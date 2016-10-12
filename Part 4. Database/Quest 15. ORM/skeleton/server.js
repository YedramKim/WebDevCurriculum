var express = require('express'),
	Sequelize = require('sequelize'),
	path = require('path'),
	fs = require('fs'),
	crypto = require('crypto'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	app = express();

//데이터 베이스 ORM
var sequelize = new Sequelize("node", "root", "phpmyadmin", {
	host : "localhost",
	dialect : "mysql",
	define : {
		timestamps : false
	}
});

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

//회원 목록
var users = [
	{
		id : "admin",
		password : "1234",
		nickname : "집게사장"
	},
	{
		id : "employee1",
		password : "1234",
		nickname : "징징이"
	},
	{
		id : "employee2",
		password : "1234",
		nickname : "스폰지밥"
	}
];
var length = users.length;

//회원 테이블 모델
var User = sequelize.define("user", {
	idx : {
		type : Sequelize.INTEGER,
		allowNull : false,
		autoIncrement : true,
		primaryKey : true
	},
	id : {
		type : Sequelize.STRING(50),
		unique : true,
		allowNull : false
	},
	nickname : {
		type : Sequelize.STRING(20),
		allowNull : false
	},
	password : {
		type : Sequelize.CHAR(64),
		allowNull : false
	},
	salt : {
		type : Sequelize.CHAR(32),
		allowNull : false
	}
});

//메모 테이블 모델
var Memo = sequelize.define("memo", {
	idx : {
		type : Sequelize.INTEGER,
		primaryKey : true,
		autoIncrement : true,
		allowNull : false
	},
	id : {
		type : Sequelize.STRING(50),
		allowNull : false
	},
	title : {
		type : Sequelize.STRING,
		allowNull : false
	},
	content : {
		type : Sequelize.TEXT,
		allowNull : false
	}
});
//`memo` 테이블 생성 해당 모델에 해당하는 테이블이 존재하지 않으면 생성한다.
Memo.sync();

//`user`테이블 생성
//force : true일 경우 테이블을 지운뒤 다시 생성한다.
User.sync({force : true}).then(function() {
	//회원 등록
	var length = users.length;
	for(var i = 0; i < length; i++) {
		var salt = createSalt();
		users[i]["salt"] = salt;

		//암호문 만들기
		var pass = users[i]["password"] + salt;
		var hash = crypto.createHash("sha256");

		users[i]["password"] = hash.update(pass , "utf8").digest("hex");

		User.create(users[i]);
	}
});

app.use("/static", express.static(path.join(__dirname, "client")));

/* TODO: 여기에 처리해야 할 요청의 주소별로 동작을 채워넣어 보세요..! */

app.use(bodyParser.urlencoded({ extended : true})); // x-www-form-urlencoded 파싱
app.use(bodyParser.json()); //JSON 파싱
app.use(session({
	secret : "secretNotepad",
	resave : false
})); // 서버에 세션 적용

// /foo 관련 라우트
var fooRouter = app.route("/foo");
fooRouter.get(function (req, res) {
	var query = req.query;
	console.log("Hello, " + query.bar);
	res.json(query);
});
fooRouter.post(function (req, res) {
	var body = req.body;
	console.log("Hello, " + body.bar);
	res.send("");
});

//로그인 관련 세션 처리
app.use(function(req, res, next) {
	if(req.session.pageId !== undefined && typeof req.session.pageId === "string"){
		req.login = true;
		req.id = req.session.pageId;
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
	res.sendFile(path.join(__dirname, "client", "login.html"));
});
//로그인 처리
loginRouter.post("/process", function(req, res) {
	//로그인 폼 정보
	var id = req.body.id;
	var pass = req.body.pass;

	//id에 맞는 유저정보 찾기, 없으면 로그인 페이지로 이동
	User.findOne({
		where : {
			id : id
		}
	}).then(function(user) {
		if(user.length === null) {
			res.prevPage("존재하지 않는 아이디입니다.");
		}else{
			return {
				id : user.id,
				nickname : user.nickname,
				password : user.password,
				salt : user.salt
			}
		}
	}).then(function(user) { // 비밀번호 확인
		var hash = crypto.createHash("sha256");

		//입력한 비밀번호를 솔트랑 조합해서 정보 수정
		var submit_pass = hash.update(pass + user.salt, "utf8").digest("hex");

		//비밀번호 검사
		if(user.password === submit_pass) {
			req.session.pageId = id;
			req.session.nickname = users.nickname;
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
	var id = req.id;
	id = id !== undefined ? id : "";

	//메모 데이터 불러오기
	Memo.findAll({
		attributes : ["idx", "id", "title"],
		where : {
			id : id
		}
	}).then(function(memos) {
		memos = memos.length !== 0 ? memos : [];
		res.json(memos);
	});
});
//메모정보 전부 공개
noteRouter.get('/all', function(req, res) {
	Memo.findAll().then(function(memos){
		res.json(memos.map(function(memo){
			return {
				idx : memo.idx,
				title : memo.title,
				id : memo.id,
			}
		}));
	});
});
//지정한 메모 로드
noteRouter.get('/load/:idx' , function(req, res) {
	var idx = parseInt(req.params.idx);
	var id = req.id;

	Memo.findOne({
		attributes : ["content"],
		where : {
			idx : idx,
			id : id
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
	var id = req.id;
	Memo.create({
		id : id,
		title : title,
		content : ""
	}).then(function(data){
		res.status(200);
		//res.send()로 숫자를 보낼때는 반드시 toString()을 사용할 것
		res.send(data.idx.toString());
	});
});
//메모 저장
noteRouter.post("/modify", function(req, res) {
	var data = req.body;
	var idx = data.idx;
	var title = data.title;
	var content = data.content;
	var id = req.id;

	//데이터베이스에 있는 메모 수정
	Memo.update({
		content : content
	},{
		where : {
			idx : idx,
			id : id
		}
	}).then(function(data) {
		res.send("save");
	})
});
//메모 삭제
noteRouter.post("/delete", function(req, res) {
	var idx = req.body.idx;
	var id = req.id;

	Memo.destroy({
		where : {
			idx : idx,
			id : id,
		}
	}).then(function(){
		res.send("deleted!!");
	});
})
app.use('/note', noteRouter);

app.get('/', function (req, res) {
	//로그인이 되어있지 않을 경우
	if(req.login === false) {
		res.send("<meta charset='utf-8'><script>alert('로그인을 하세요.'); location = '/login/page';</script>");
	}else {
		res.sendFile(path.join(__dirname, 'client', 'notepad.html'));
	}
});

app.get('/*', function(req, res) {
	res.redirect(302, "/");
});

var server = app.listen(8080, function () {
	console.log('Server started!');
});