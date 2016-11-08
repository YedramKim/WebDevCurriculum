var express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var Sequelize = require("sequelize");
var static = require("serve-static");
var app = express();
var path = require("path");

app.use("/static", static(path.join(__dirname, "static")));

app.use("/socket", function(req, res) {
	console.log(1);
	res.send("socket");
});

app.get("/room", function(req, res) {
	res.sendFile(path.join(__dirname, "client", "room.html"));
});

//방 목록
app.get("/", function(req, res) {
	res.sendFile(path.join(__dirname, "client", "list.html"));
});

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

var server = app.listen(8000, function(){
	console.log("Running at localhost:8000");
});

var io = require("socket.io").listen(server);

io.on("connection", function(socket){

	socket.on("disconnect", function() {
		console.log("disconnect");
	});
});

var room = io.of("/room");
room.on("connection", function(socket) {
	socket.join("room");

	console.log(socket.adapter.rooms);
});