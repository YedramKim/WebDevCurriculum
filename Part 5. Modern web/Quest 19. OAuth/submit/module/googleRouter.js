var fs = require("fs");
var path = require("path");
var express = require("express");
var Database = require("./sequelize");
var googleRouter = module.exports = exports = express.Router();

//구글 관련 api들
var google = require("googleapis");
var OAuth2 = google.auth.OAuth2;
var plus = google.plus("v1");

//API에 쓸 클라이언트 관련 정보들
var APICLIENT = path.join(__dirname, "..", "client", "OAuth.json");
APICLIENT = JSON.parse(fs.readFileSync(APICLIENT));
var REDIRECT_URI = "http://localhost/google/login";

//로그인 oauth 클라이언트
var oauth2Client = new OAuth2(APICLIENT.id, APICLIENT.secret, REDIRECT_URI);

oauth2Client.setCredentials({
	access_token : "ACCESS TOKEN HERE",
	refresh_token : "REFRESH TOKEN HERE"
});

var oauthURL = oauth2Client.generateAuthUrl({
	access_type : "offline",
	scope : APICLIENT.scope
});

//구글 관련 라우터 설정
//google oauth 로그인
googleRouter.get("/login", (req, res) => {
	var code = req.query.code;
	oauth2Client.getToken(code, (err, tokens) => { // access_token 받아오기
		if(err) { // 에러가 있을 경우 로그인 페이지로 이동
			res.redirect(302, "/login/page");
			return;
		}

		//토큰 설정
		oauth2Client.setCredentials(tokens);
		plus.people.get({ // 프로필 얻어오기
			userId : "me",
			auth : oauth2Client
		}, (err, result) => {
			if(err) { // 에러가 있을 경우 로그인 페이지로 이동
				res.redirect(302, "/login/page");
				return;
			}
			req.session.googleLogin = {
				id : result.emails[0].value,
				name : result.displayName
			};
			// 콜백 중첩 문제로 리다이렉트
			res.redirect(302, "/google/login/process");
		});
	});
});

googleRouter.get("/login/process", (req, res) => {
	var googleLogin = req.session.googleLogin;
	if(!googleLogin) { //만약 존재하지 않거나 이상이 있을 때 로그인 페이지로 리다이렉트
		res.redirect(302, "/login/page");
		return;
	}

	delete req.session.googleLogin; // 세션에서 구글유저 정보 삭제
	var User = Database.User; //유저 데이터베이스

	googleLogin.password = "ek7s2qo8pfq2pbjc2hkc0iad5oob5uqjek7s2qo8pfq2pbjc2hkc0iad5oob5uqj";
	googleLogin.salt = "ek7s2qo8pfq2pbjc2hkc0iad5oob5uqj";
	googleLogin.googleUser = true;

	User.findOne({
		where : {
			id : googleLogin.id,
			googleUser : true
		}
	}).then((user) => {
		if(!user) { // 정보가 등록되어있지 않아있을 경우 정보를 등록한다.
			return User.create(googleLogin);
		}else { //아닐 경우 로그인 한다. (우선 정보를 그대로 넘긴다.)
			return user;
		}
	}).then((user) => {
		req.session.userIdx = user.idx;
		req.session.name = user.name;
		req.session.googleUser = true; // 구글유저가 맞다.
		res.redirect(302, "/google/login/redirect");
	});
});

googleRouter.get("/login/redirect", (req, res) => {
	res.sendFile(path.join(__dirname, "..", "client", "google_oauth_redirect.html"));
});

//oauth 인증 페이지로 이동
googleRouter.get(["/", "/auth"], (req, res) => {
	res.redirect(302, oauthURL);
});