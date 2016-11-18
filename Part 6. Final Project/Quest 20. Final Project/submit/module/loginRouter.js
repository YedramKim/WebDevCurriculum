var path = require("path");
var express = require("express");
var router = module.exports = exports = new express.Router();

router.get("/check", (req, res, next) => {
	res.send({
		status : req.login
	});
});

// 이 라우터 혹은 다른 다우터를 통해 로그인이 처리되었을 때 리다이렉트를 처리함
router.get("/success", (req, res) => {
	res.sendFile(path.join(__dirname, "..", "client", "success_redirect.html"));
});

router.get("/failed", (req, res) => {
	res.sendFile(path.join(__dirname, "..", "client", "failed_redirect.html"));
});