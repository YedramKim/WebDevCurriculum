var express = require('express'),
	path = require('path'),
	fs = require('fs'),
	crypto = require('crypto'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	app = express();

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
var notePath = __dirname + "/notes";
var noteAutoIncrement = 0; // 새 파일을 만들 때 마다 사용할 메모 idx

var notes = [];
try{
	notes = fs.readdirSync(notePath);
	
	var length = notes.length;
	for(var i = 0; i < length; i++) {
		var data = notes[i].replace(/\.[^.]+$/, "");
		data = data.split(/\)\)\)/gi); 
		notes[i] = {
			idx : Number(data[0]),
			id : data[1],
			title : data[2]
		}
	}

	//파일을 다시 idx별로 정렬
	notes.sort(function(prev, next) {
		return prev.idx - next.idx;
	});

	//파일이 하나도 없을 경우
	if(notes.length === 0) {
		noteAutoIncrement = 0;
	}else {
		noteAutoIncrement = notes[notes.length - 1].idx + 1;
	}
}catch(e) {
	console.log(e);
	process.exit(1);
}
console.log(notes);

//메모장 관련 라우트
var noteRouter = express.Router();
//메모장 리스트를 전송
noteRouter.get('/', function(req, res) {
	//자신의 id
	var id = req.id;
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
	var title = "";
	var id = req.id;
	var length = notes.length;
	for(var i = 0; i < length; i++) {
		if(notes[i].idx === idx){
			title = notes[i].title.trim();
			break;
		}
	}
	//만약의 경우 파일이 존재하지 않을 경우 종료
	var path = notePath + "/" + idx + ")))" + id + ")))" + title + ".txt";
	if(title = "") {
		res.redirect(302, "/");
	}else {
		fs.readFile(path, "utf8", function(err, content) {
			res.send(content);
		});
	}
});
//메모 생성
noteRouter.post("/create", function(req, res) {
	var idx = noteAutoIncrement ++;
	var title = req.body.title;
	var id = req.session.pageId;
	var path = notePath + "/" + idx + ")))" + id + ")))" + title + ".txt";
	fs.writeFile(path, req.body.content, "utf8", function(err){
		notes[notes.length] = {
			idx : idx,
			id : id,
			title : title
		}
		res.send(String(idx));
	});
});
//메모 저장
noteRouter.post("/modify", function(req, res) {
	var data = req.body;
	var idx = data.idx;
	var title = data.title;
	var content = data.content;
	var id = req.id;
	//기존에 있던 파일일 경우
	fs.writeFile(notePath + "/" + idx + ")))" + req.id + ")))" + title + ".txt", content, "utf8", function(err, result) {
		res.send("save");
	});
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