var path = require("path");
var express = require("express");
var router = module.exports = exports = new express.Router();

router.get("/check", (req, res, next) => {
	res.send({
		login : req.login ? req.session.userIdx : false,
		site : req.session.site
	});
});

// 사이트 내부의 계정으로 로그인 (window.open으로 접속)
router.get("/sitelogin", (req, res) => {
	if(req.login) { // 만약 로그인 중인 상태이면 홈페이지로 돌아감
		res.redirect(302, "/");
	}
	res.sendFile(path.join(__dirname, "..", "web_client", "site_login.html"));
});

router.post("/auth", (req, res) => {
	res.send([]);
});

// 이 라우터 혹은 다른 다우터를 통해 로그인이 처리되었을 때 리다이렉트를 처리함
router.get("/success", (req, res) => {
	res.sendFile(path.join(__dirname, "..", "web_client", "success_redirect.html"));
});

router.get("/failed", (req, res) => {
	res.sendFile(path.join(__dirname, "..", "web_client", "failed_redirect.html"));
});

router.get("/logout", (req, res) => {
	var session = req.session;
	session.userIdx = undefined;
	session.account = undefined;
	session.site = undefined;
	session.name = undefined;

	res.send({
		login : false,
		site : req.session.site
	});
});