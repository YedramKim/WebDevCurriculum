var express = require('express'),
	path = require('path'),
	fs = require('fs'),
	bodyParser = require('body-parser'),
	app = express();

app.use("/static", express.static(path.join(__dirname, "client")));

/* TODO: 여기에 처리해야 할 요청의 주소별로 동작을 채워넣어 보세요..! */
app.use(bodyParser.urlencoded({ extended : true})); // x-www-form-urlencoded 파싱
app.use(bodyParser.json()); //JSON 파싱

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
			title : data[1]
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

//메모장 관련 라우트
var noteRouter = express.Router();
//메모장 리스트를 전송
noteRouter.get('/', function(req, res) {
	//제목들만 전송
	res.json(notes);
});
//지정한 메모 로드
noteRouter.get('/load/:idx' , function(req, res) {
	var idx = parseInt(req.params.idx);
	var title = "";
	var length = notes.length;
	for(var i = 0; i < length; i++) {
		if(notes[i].idx === idx){
			title = notes[i].title.trim();
			break;
		}
	}
	//만약의 경우 파일이 존재하지 않을 경우 종료
	var path = notePath + "/" + idx + ")))" + title + ".txt";
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
	fs.writeFile(notePath + "/" + idx + ")))" + title + ".txt", req.body.content, "utf8", function(err){
		notes[notes.length] = {
			idx : idx,
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
	//기존에 있던 파일일 경우
	fs.writeFile(notePath + "/" + idx + ")))" + title + ".txt", content, "utf8", function(err, result) {
		res.send("save");
	});
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