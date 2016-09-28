var express = require('express'),
	path = require('path'),
	bodyParser = require('body-parser'),
	app = express();

app.use(express.static(path.join(__dirname, "client")));

/* TODO: 여기에 처리해야 할 요청의 주소별로 동작을 채워넣어 보세요..! */
app.use(bodyParser.urlencoded({ extended : true, limit : '5mb'}));
app.use(bodyParser.json({ limit : '5mb'})); //JSON 파싱

app.route("/foo*").
	get(function (req, res, next) {
		var query = req.query;
		console.log("Hello, " + query.bar);
		res.json(query);
	}).
	post(function (req, res) {
		var body = req.body;
		console.log("Hello, " + body.bar);
		res.send("");
	});

app.get('/', function (req, res) {
	res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

//메모장 파일들
var notes = [];

var server = app.listen(8080, function () {
	console.log('Server started!');
});