var express = require('express'),
	path = require('path'),
	fs = require('fs'),
	bodyParser = require('body-parser'),
	app = express();

app.use(express.static(path.join(__dirname, "client")));

/* TODO: 여기에 처리해야 할 요청의 주소별로 동작을 채워넣어 보세요..! */
app.use(bodyParser.urlencoded({ extended : true})); // x-www-form-urlencoded 파싱
app.use(bodyParser.json()); //JSON 파싱

//압축 css 관련 라우트
var styleRouter = express.Router();
styleRouter.use(function(req, res, next) {
	res.root = path.join(__dirname, "client");
	res.css = function (cssStr) {
		res.set("Content-Type", "text/css");
		res.send(cssStr.split(/\/\*.+\*\/|\t|\r\n|\n/).join(""));
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

//메모장 관련 데이터
var notes = [];
var noteAutoIncrement = notes.length; // 새 파일을 만들 때 마다 사용할 메모 idx

//메모장 관련 라우트
var noteRouter = express.Router();
//메모장 리스트를 전송
noteRouter.get('/', function(req, res) {
	//제목들만 전송
	var datas = [];
	var length = notes.length;
	for(var i = 0; i < length; i++) {
		datas.push({
			idx : notes[i].idx,
			title : notes[i].title
		});
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
	var data = req.body;
	//기존에 있던 파일일 경우
	if(data.idx !== undefined) {
		var length = notes.length;
		for(var i = 0; i < length; i++) {
			if(data.idx === notes[i].idx) {
				notes[i].content = data.content;
				console.log(data);
				console.log(notes[i]);
			}
		}
		res.send("save");
	}else { // 기존에 있던 파일이 아닐 경우 (메모장 목록에 추가, 데이터에 idx추가)
		data.idx = noteAutoIncrement++;
		notes.push(data);
		res.send(data.idx+"");
	}
});
app.use('/note', noteRouter);

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

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.get('*', function(req, res) {
	res.redirect(302, "/");
});

var server = app.listen(8080, function () {
	console.log('Server started!');
});