var module = module.exports = exports = {};
var express = require('express');
var static = require("serve-static");
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var Database = require("./sequelize");
var app = express();

app.use("/static", express.static(path.join(__dirname, "..", "client")));

/* TODO: 여기에 처리해야 할 요청의 주소별로 동작을 채워넣어 보세요..! */

app.use(bodyParser.urlencoded({ extended : true})); // x-www-form-urlencoded 파싱
app.use(bodyParser.json()); //JSON 파싱
app.use(session({
	saveUninitialized : true,
	secret : "secretNotepad",
	resave : false
})); // 서버에 세션 적용

//로그인 관련 세션 처리
app.use(function(req, res, next) {
	//로그인이 되어 있으면 req 객체에 login, id 속성 추가
	if(req.session.userIdx !== undefined){
		req.login = true;
		req.userIdx = req.session.userIdx;
	}else{
		req.login = false;
	}

	//메세지를 출력하면서 전페이지로 이동하는 함수
	res.prevPage = function(message) {
		res.send("<meta charset='utf-8'><script>alert('" + message + ".'); history.go(-1);</script>");
	}
	next();
});

//구글 로그인 라우터
var googleRouter = require("./googleRouter")
app.use("/google", googleRouter);

//로그인 관련 라우터
var loginRouter = require("./loginRouter");
app.use("/login", loginRouter);

//메모장 관련 라우트
var noteRouter = require("./noteRouter");
app.use('/note', noteRouter);

app.get('/', function (req, res) {
	//로그인이 되어있지 않을 경우
	if(req.login === false) {
		res.send("<meta charset='utf-8'><script>alert('로그인을 하세요.'); location = '/login/page';</script>");
	}else {
		res.sendFile(path.join(__dirname, "..", 'client', 'notepad.html'));
	}
});

app.get('/*', function(req, res) {
	res.redirect(302, "/");
});

module.listen = function(port) {
	return Database.sync().then(function() {
		return app.listen(port, function () {
			console.log('Running Server at', port);
		});
	});
}