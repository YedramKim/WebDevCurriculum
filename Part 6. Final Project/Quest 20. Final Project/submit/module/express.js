var module = module.exports = exports = {};

//node.js 기본 모듈
var path = require("path");
var fs = require("fs");

//express 관련 기본 모듈과 객체
var express = require("express");
var bodyParser = require("body-parser");
var static = require("serve-static");
var session = require("express-session");
var app = module.app = express();
var server = null;

//데이터베이스 관련 모듈 객체
var Database = require("./sequelize");

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
var googleRouter = require("./googleRouter");
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
		Database.sync().then(() => {
			console.log("Database Start");
		});
	});

	return server;
}