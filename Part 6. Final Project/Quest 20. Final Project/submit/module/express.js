var module = module.exports = exports = {};

//node.js 기본 모듈
const path = require("path");
const fs = require("fs");

//express 관련 기본 모듈과 객체
const express = require("express");
const bodyParser = require("body-parser");
const static = require("serve-static");
const session = require("express-session");
var app = module.app = express();
var server = null;

//데이터베이스 관련 모듈 객체
const Database = require("./sequelize");

//클라이언트 파일 불러오기 설정
app.use("/polymer", static(path.join(__dirname , "..", "bower_components")));
app.use("/client", static(path.join(__dirname , "..", "client")));

//세션 설정
app.use(session({
	resave : false,
	secret : "Curriculum Final project",
	saveUninitialized : true
}));

//post 처리 설정
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

//라우터
const googleRouter = require("./googleRouter");
app.use("/google", googleRouter);


app.post("/form", (req, res) => {
	res.json(req.body);
});

//기본 페이지 설정
app.use((req, res) => {
	res.sendFile(path.join(__dirname, "..", "client", "index.html"))
});

module.listen = (port) => {
	server = app.listen(port, () => {
		console.log("Server Running at " + port);
		//데이터 베이스 실행
		/*Database.sync().then(() => {
			console.log("Database Start");
		});*/
	});

	return server;
}