var module = module.exports = exports = {};
var express = require('express');
var static = require("serve-static");
var path = require('path');
var crypto = require('crypto');
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
//로그인 관련 라우터
var loginRouter = express.Router();
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
			id : id
		}
	}).then(function(user) { // 아이디 검사, user : 만약에 아이디가 존재하지 않으면 NULL
		if(user === null) {
			res.prevPage("존재하지 않는 아이디입니다.");
			return null;
		}else{
			return {
				idx : user.idx,
				nickname : user.nickname,
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
			req.session.nickname = user.nickname;
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
app.use("/login", loginRouter);

//메모장 관련 라우트
var noteRouter = express.Router();
//메모장 리스트를 전송
noteRouter.get('/', function(req, res) {
	//자신의 id
	var idx = req.userIdx;
	idx = idx !== undefined ? idx : -1;

	//메모 데이터 불러오기
	Database.User.findOne({
		where : {
			idx : idx
		}
	}).then(function(user) {
		return user.getMemos();
	}).then(function(memos) {
		var length = memos.length;
		for(var i = 0; i < length; i++) {
			memos[i] = {
				idx : memos[i].idx,
				title : memos[i].title,
				userIdx : memos[i].userIdx
			}
		}
		memos = memos.length !== 0 ? memos : [];
		res.json(memos);
	});
});
//메모정보 전부 공개
noteRouter.get('/all', function(req, res) {
	Database.Memo.findAll().then(function(memos){
		var length = memos.length;
		var datas=[];
		for(var i = 0; i < length; i++) {
			datas.push({
				idx : memos[i].idx,
				title : memos[i].title,
				id : memos[i].id,
			})
		}
		res.json(datas);
	});
});
//지정한 메모 로드
noteRouter.get('/load/:idx' , function(req, res) {
	var idx = parseInt(req.params.idx);
	var userIdx = req.userIdx;

	Database.Memo.findOne({
		attributes : ["content"],
		where : {
			idx : idx,
			userIdx : userIdx
		}
	}).then(function(memo) {
		if(memo === null) {
			res.send("Error");
		}else{
			res.send(memo.content);
		}
	});
});
//메모 생성
noteRouter.post("/create", function(req, res) {
	var title = req.body.title;
	var userIdx = req.userIdx;
	var writer = null;
	
	Database.User.findOne({
		where : {
			idx : userIdx
		}
	}).then(function(user) {
		writer = user;
		return Database.Memo.create({
			title : title,
			content : "",
			userIdx : userIdx
		});
	}).then(function(memo){
		//res.send()로 숫자를 보낼때는 반드시 toString()을 사용할 것
		res.send(memo.idx.toString());
		return writer.addMemo(memo);
	}).then(function() {
		console.log("create new memo");
	});
});
//메모 수정
noteRouter.post("/modify", function(req, res) {
	var data = req.body;
	var idx = data.idx;
	var title = data.title;
	var content = data.content;
	var userIdx = req.userIdx;

	//데이터베이스에 있는 메모 수정
	Database.Memo.update({
		content : content
	},{
		where : {
			idx : idx,
			userIdx : userIdx
		}
	}).then(function(data) {
		res.send("save");
	})
});
//메모 삭제
noteRouter.post("/delete", function(req, res) {
	var idx = req.body.idx;
	var userIdx = req.userIdx;

	//idx와 userIdx가 같은 데이터 삭제
	Database.Memo.destroy({
		where : {
			idx : idx,
			userIdx : userIdx,
		}
	}).then(function(){
		res.send("deleted!!");
	});
});
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

module.listen = function() {
	return app.listen(8080, function () {
		console.log('Server started!');
	});
}