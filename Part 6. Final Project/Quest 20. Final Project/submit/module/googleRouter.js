var path = require("path");
var fs = require("fs");
var express = require("express");
var router = module.exports = exports = new express.Router();

//google api 관련 파일
var google = require("googleapis");
var OAuth2 = google.auth.OAuth2;
var plus = google.plus("v1");

var CLIENT_INFO = path.join(__dirname, "OAuth.json");
CLIENT_INFO = JSON.parse(fs.readFileSync(CLIENT_INFO));
var CLIENT_ID = CLIENT_INFO.id;
var CLIENT_SECRET = CLIENT_INFO.secret;
var redirect_uri = "http://localhost/google/login";
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

router.get("/access", (req, res) => {
	res.redirect(302, OAuth2url);
});

router.get("/login", (req, res) => {
	var code = req.session.code = req.query.code;
	if(!code) { // 코드검사
		res.redirect(302, "/google/loginerror");
		return;
	}

	oauth2Client.getToken(code, (err, tokens) => {
		oauth2Client.setCredentials(tokens);
		if(err) { // 에러 검사
			res.redirect(302, "/google/loginerror");
			return;
		}

		plus.people.get({
			userId : "me",
			auth : oauth2Client
		}, (err, result) => {
			res.send(result);
		});
	});

});