var module = module.exports = exports = {};

//node.js 기본 모듈
const path = require("path");
const fs = require("fs");

//express 관련 기본 모듈과 객체
const express = require("express");
const static = require("serve-static");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = module.app = express();
var server = null;

//데이터베이스 관련 모듈 객체
const Database = require("./sequelize");

//클라이언트 파일 불러오기 설정
app.use("/polymer", static(path.join(__dirname , "..", "bower_components")));
app.use("/client", static(path.join(__dirname , "..", "web_client")));
app.use("/elements", static(path.join(__dirname , "..", "web_client", "elements")));
app.use("/upload", static(path.join(__dirname , "..", "scheduleImages")));

//post 처리 설정
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

//res.prev([message=""]) : 이전 페이지로 이동, window.open으로 연 페이지 전용
//message는 opener의 toast-alert에서 출력이 된다. 
app.use((req, res, next) => {
	res.prev = function(message="오류입니다.") {
		this.send('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Document</title></head><body><script>if(opener){opener.Polymer.app.toast.alert("' + message + '")}else{alert("' + message + '")}location.href=document.referrer;</script></body></html>');
	}
	next();
});

//세션 설정
app.use(session({
	resave : false,
	secret : "Curriculum Final project",
	saveUninitialized : true
}));

//로그인 검사
app.use((req, res, next) => {
	var session = req.session;
	if(session.account) { // 로그인 되어 있는 경우
		req.login = true;
	}else {
		req.login = false;
	}
	next();
});

//일정 관련 라우터
const scheduleRouter = require("./scheduleRouter");
app.use("/schedule", scheduleRouter);

//로그인 관련 라우터
const loginRouter = require("./loginRouter");
app.use("/login", loginRouter);

//로그인 관련 라우터
const friendRouter = require("./friendRouter");
app.use("/friend", friendRouter);

//구글 api 라우터
const googleRouter = require("./googleRouter");
app.use("/googleOAuth", googleRouter);

//기본 페이지 설정
app.use((req, res) => {
	if(req.xhr) { //ajax일 경우
		res.send({
			error : true
		});
	}else {
		res.sendFile(path.join(__dirname, "..", "web_client", "index.html"));
	}
});

module.listen = (port) => {
	server = app.listen(port, () => {
		console.log("Server Running at " + port);
		//데이터 베이스 실행
		Database.sync().then(() => {
			console.log("Database Start");
		});
	});

	return server;
}