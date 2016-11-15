var fs = require("fs");
var path = require("path");
var crypto = require("crypto");
var express = require("express");
var Database = require("./sequelize");
var loginRouter = module.exports = exports = express.Router();

//로그인 폼 페이지
loginRouter.get("/page", function(req, res) {
	//로그인 되어 있을 경우 메모편집으로 이동
	if(req.login) {
		res.redirect(302, "/");
	}
	res.sendFile(path.join(__dirname, "..", "client", "login.html"));
});
//로그인 처리
loginRouter.post("/process", function(req, res) {
	//로그인 폼 정보
	var id = req.body.id;
	var pass = req.body.pass;

	//id에 맞는 유저정보 찾기, 없으면 로그인 페이지로 이동
	Database.User.findOne({
		where : {
			id : id,
			googleUser : false
		}
	}).then(function(user) { // 아이디 검사, user : 만약에 아이디가 존재하지 않으면 NULL
		if(user === null) {
			res.prevPage("존재하지 않는 아이디입니다.");
			return null;
		}else{
			return {
				idx : user.idx,
				name : user.name,
				password : user.password,
				salt : user.salt
			};
		}
	}).then(function(user) { // 비밀번호 확인
		if(user === null) {
			return;
		}
		var hash = crypto.createHash("sha256");

		//입력한 비밀번호를 솔트랑 조합해서 정보 수정
		var submit_pass = hash.update(pass + user.salt, "utf8").digest("hex");

		//비밀번호 검사, 틀릴 경우 다시 로그인 페이지로 이동
		if(user.password === submit_pass) {
			req.session.userIdx = user.idx;
			req.session.name = user.name;
			req.session.googleUser = false; // 구글유저가 아니다.
			res.redirect(302, "/");
		}else {
			res.prevPage("비밀번호가 틀렸습니다.");
		}
	});
});
//로그아웃
loginRouter.get("/logout", function(req, res) {
	req.session.destroy();
	res.redirect(302, "/login/page");
});