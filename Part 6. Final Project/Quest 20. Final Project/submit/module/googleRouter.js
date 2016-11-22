const path = require("path");
const fs = require("fs");
const express = require("express");
var router = module.exports = exports = new express.Router();

//데이터베이스 관련 모듈 객체
const Database = require("./sequelize");
const User = Database.User;

//google api 관련 파일
const google = require("googleapis");
var OAuth2 = google.auth.OAuth2;
var plus = google.plus("v1");

var CLIENT_INFO = path.join(__dirname, "OAuth.json");
CLIENT_INFO = JSON.parse(fs.readFileSync(CLIENT_INFO));
var CLIENT_ID = CLIENT_INFO.id;
var CLIENT_SECRET = CLIENT_INFO.secret;
var redirect_uri = "http://localhost/googleOAuth/token";
var scope = CLIENT_INFO.scope;

var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, redirect_uri);
oauth2Client.setCredentials({
	access_token : "ACCESS TOKEN HERE",
	refresh_token : "REFRESH TOKEN HERE"
});

var OAuth2url = oauth2Client.generateAuthUrl({
	access_type : "offline",
	scope : scope
});

router.get("/auth", (req, res) => {
	res.redirect(302, OAuth2url);
});

router.get("/token", (req, res) => {
	var code = req.session.code = req.query.code;
	if(!code) { // 코드검사
		res.redirect(302, "/login/failed");
		return;
	}

	oauth2Client.getToken(code, (err, tokens) => {
		oauth2Client.setCredentials(tokens);
		if(err) { // 에러 검사
			res.redirect(302, "/login/failed");
			return;
		}

		plus.people.get({
			userId : "me",
			auth : oauth2Client
		}, (err, result) => {
			var OAuthProfile = req.session.OAuthProfile = {
				site : "google",
				account : result.emails[0].value,
				name : result.displayName
			}
			res.redirect(302, "/googleOAuth/login");
		});
	});
});

router.get("/login", (req, res, next) => {
	var OAuthProfile = req.session.OAuthProfile;
	req.session.OAuthProfile = undefined;
	if(!OAuthProfile) { // 정상적인 방법으로 들어온 것이 아닐 경우 홈페이지로 이동
		next();
		return;
	}

	User.findOne({
		where : OAuthProfile
	}).then((user) => {
		if(user) { // 등록되어 있을 경우 그대로 정보를 등록한다.
			return user;
		}else { // 처음 로그인한 경우 정보를 등록한다.
			return User.create(OAuthProfile);
		}
	}).then((user) => {
		req.session.userIdx = user.idx;
		req.session.account = user.account;
		req.session.site = user.site;
		req.session.name = user.name;
		res.redirect(302, "/login/success");
	});
});

router.get("/info", (req, res) => {
	res.send(req.session);
});