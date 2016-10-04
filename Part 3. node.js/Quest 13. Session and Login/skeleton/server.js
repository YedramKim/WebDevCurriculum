var express = require('express'),
	path = require('path'),
	fs = require('fs'),
	crypto = require('crypto'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	app = express();

app.use(express.static(path.join(__dirname, "client")));

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

//css 압축 관련 라우트
var styleRouter = express.Router();
styleRouter.use(function(req, res, next) {
	res.root = path.join(__dirname, "client");
	res.css = function (cssStr) {
		res.set("Content-Type", "text/css");
		res.send(cssStr.toString().split(/\/\*.+\*\/|\t|\r\n|\n/).join(""));
	}
	next();
});
styleRouter.get("/index", function(req, res) {
	fs.readFile(path.join(res.root, "style.css"), function(error, style) {
		style = style.toString();
		res.css(style);
	});
});
styleRouter.get("/octicons.ttf", function(req, res) {
	//res.set("Content-Type", "application/x-font-opentype");
	fs.readFile(path.join(res.root, "octicons.ttf"), function(error, font) {
		font = font.toString();
		res.send(font);
	});
});
app.use('/style', styleRouter);

//회원 목록
var users = [
	{
		id : "admin",
		password : "F2qkL5N1Uvd0eJBnKbjYEA==",
		nickname : "집게사장"
	},
	{
		id : "employee1",
		password : "F2qkL5N1Uvd0eJBnKbjYEA==",
		nickname : "징징이"
	},
	{
		id : "employee2",
		password : "F2qkL5N1Uvd0eJBnKbjYEA==",
		nickname : "스폰지밥"
	}
];

//로그인 관련 세션 처리
app.use(function(req, res, next) {
	if(req.session.pageId !== undefined && typeof req.session.pageId === "string"){
		req.login = true;
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
	//암호화 객체
	var key = "notepadLoginPassword";
	var cipher = crypto.createCipher("aes256", key);

	//로그인 폼 정보
	var id = req.body.id;
	var pass = req.body.pass;

	//비밀번호 암호화
	cipher.update(pass, "utf8", "base64");
	pass = cipher.final("base64");

	//id 존재 유무 확인
	var length = users.length;
	for(var i = 0; i < length; i++){
		if(users[i].id === id){
			if(users[i].password === pass){
				req.session.pageId = id;
				req.session.nickname = users[i].nickname;
				res.redirect(302, "/");
			}else{
				res.prevPage("비밀번호가 틀렸습니다.")
			}
			return;
		}
	}
	res.prevPage("존재하지 않는 아이디입니다.");
});
loginRouter.get("/logout", function(req, res) {
	req.session.destroy();
	res.redirect(302, "/login/page");
});
app.use("/login", loginRouter);

//메모장 관련 데이터
var notes = [];
var noteAutoIncrement = notes.length; // 새 파일을 만들 때 마다 사용할 메모 idx

//메모장 관련 라우트
var noteRouter = express.Router();
//메모장 리스트를 전송
noteRouter.get('/', function(req, res) {
	//자신의 id
	var id = req.session.pageId;
	id = id !== undefined ? id : "";

	//id가 똑같은 메모 파일만 전송
	var datas = [];
	var length = notes.length;
	for(var i = 0; i < length; i++) {
		if(notes[i].id === id){
			datas.push({
				idx : notes[i].idx,
				title : notes[i].title,
				id : id
			});
		}
	}
	res.json(datas);
});
//메모정보 전부 공개
noteRouter.get('/all', function(req, res) {
	res.json(notes);
});
//지정한 메모 로드
noteRouter.get('/load/:idx' , function(req, res) {
	var idx = parseInt(req.params.idx);
	var data = notes.filter(function(note) {
		return note.idx === idx;
	})[0];
	if(data) {
		res.send(data.content);
	}else{
		res.send("");
	}
});
//메모 저장
noteRouter.post("/save", function(req, res) {
	var id = req.session.pageId;
	id = id !== undefined ? id : "";

	var data = req.body;
	//기존에 있던 파일일 경우
	if(data.idx !== undefined) {
		var length = notes.length;
		for(var i = 0; i < length; i++) {
			if(data.idx === notes[i].idx) {
				notes[i].content = data.content;
			}
		}
		res.send("save");
	}else { // 기존에 있던 파일이 아닐 경우 (메모장 목록에 추가, 데이터에 idx추가)
		data.idx = noteAutoIncrement++;
		data.id = id;
		notes.push(data);
		res.send(data.idx+"");
	}
});
app.use('/note', noteRouter);

app.get("/password", function(req, res) {
	var cipher = crypto.createCipher("aes256", "notepadLoginPassword");
	cipher.update("1234", "utf8", "base64");
	res.send(cipher.final("base64"));
});

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