const path = require("path");
const express = require("express");
const crypto = require("crypto");
const Database = require("./sequelize");
const User = Database.User;
var router = module.exports = exports = new express.Router();

//지정한 범위의 숫자를 랜덤으로 생성하는 함수
function randomInt(max, min = 0) {
	if(max < min) {
		var temp = max;
		max = min;
		min = temp;
	}
	max -= min;
	return Math.floor(Math.random() * (max + 1)) + min;
}

//솔트 문자열을 생성하는 함수
var saltenglish = "0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
var charLength = saltenglish.length - 1;
function createSalt() {
	var salt = "";
	for(var i = 0; i < 32; i++) {
		salt += saltenglish[randomInt(0, charLength)];
	}
	return salt;
}

router.get("/check", (req, res, next) => {
	res.send({
		login : req.login ? req.session.userIdx : false,
		site : req.session.site,
		name : req.session.name
	});
});

// 사이트 내부의 계정으로 로그인하는 페이지 (window.open으로 접속)
router.get("/sitelogin", (req, res) => {
	if(req.login) { // 만약 로그인 중인 상태이면 홈페이지로 돌아감
		res.redirect(302, "/");
	}
	res.sendFile(path.join(__dirname, "..", "web_client", "site_login.html"));
});

// 위의 페이지의 로그인을 처리
router.post("/auth", (req, res) => { // 사이트 내에서 로그인 인증
	var id = req.body.scheduleId ? req.body.scheduleId : "";
	var pass = req.body.schedulePass ? req.body.schedulePass : "";

	User.findOne({
		attributes : ["idx", "site", "account", "name", "password", "salt"],
		where : {
			account : id,
			site : "local"
		}
	}).then((user) => {
		if(!user) { //존재하지 않는 아이디일 경우
			res.prev("존재하지 않는 아이디입니다.");
		}
		var hash = crypto.createHash("sha256");
		var hashpass = hash.update(pass + user.salt, "utf8").digest("hex");

		if(hashpass === user.password) { // 비밀번호가 일치할 경우 유저 정보를 그대로 넘긴다.
			return user;
		}else { // 일치하지 않을 경우 빈 정보만 넘긴다.
			return {};
		}
	}).then((user) => {
		if(user.account !== undefined) { // 무사히 정보가 넘어왔으면 정보를 세션에 등록한다.
			req.session.userIdx = user.idx;
			req.session.account = user.account;
			req.session.site = user.site;
			req.session.name = user.name;
			res.redirect(302, "/login/success");
		}else {
			res.prev("비밀번호가 틀렸습니다.");
		}
	}).catch((e) => {
		res.send(e);
	});
});

// 회원가입 페이지 (window.open으로 접속)
router.get("/sitejoin", (req, res) => {
	if(req.login) { // 만약 로그인 중인 상태이면 홈페이지로 돌아감
		res.redirect(302, "/");
	}
	res.sendFile(path.join(__dirname, "..", "web_client", "site_join.html"));
});

//입력된 회원 정보를 User 테이블에 추가
router.post("/joinuser", (req, res) => {
	console.log(req.body.schedulePass, req.body.rePass);
	//정보 검사
	var name = req.body.scheduleName;
	if(!name) { //이름이 입력되어있지 않아 있을 경우
		res.prev("이름을 입력하세요.");
		return;
	}
	var account = req.body.scheduleId;
	if(!account) { //아이디가 입력되어있지 않아 있을 경우
		res.prev("아이디를 입력하세요.");
		return;
	}
	var pass = req.body.schedulePass;
	if(!pass) { //비밀번호가 입력되어있지 않아 있을 경우
		res.prev("비밀번호를 입력하세요.");
		return;
	}
	var rePass = req.body.rePass;
	if(rePass != pass) { //비밀번호와 비밀번호 확인이 다를 경우
		res.prev("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
		return;
	}

	//정보 입력
	var salt = createSalt();
	var hash = crypto.createHash("sha256");
	//중복 검사
	User.findOne({
		attributes : ["idx"],
		where : {
			account : account,
			site : "local"
		}
	}).then((user) => { // 아이디 중복 검사
		if(user) { // 아이디가 존재하면
			return {
				failed : true
			}
		}else {
			return User.create({
				account : account,
				password : hash.update(pass + salt, "utf8").digest("hex"),
				name : name,
				site : "local",
				salt : salt
			});
		}
	}).then((result) => {
		if(result.failed) {
			res.prev("이미 존재하는 아이디입니다.");
		}else {
			res.send('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Document</title></head><body><script>opener.Polymer.app.toast.alert("회원 가입이 완료되었습니다.");close()</script></body></html>');
		}		
	});
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
		login : false
	});
});