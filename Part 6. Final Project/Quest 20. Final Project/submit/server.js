var socket = require("socket.io");

//웹 서버
var express = require("./module/express");
var server = express.listen(80);
var io = socket.listen(server);

//데이터베이스
var Database = require("./module/sequelize");

var module = module.exports = exports = io;

io.on("connection", (socket) => {
	var sockets = this;
	var UserIdx = -1;
});