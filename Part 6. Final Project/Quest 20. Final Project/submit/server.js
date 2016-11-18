var socket = require("socket.io");

//웹 서버
var express = require("./module/express");
var server = express.listen(80);
var io = socket.listen(server);

//데이터베이스
var Database = require("./module/sequelize");

//소켓 서버
io.on("connection", (socket) => {
	var sockets = this;
	var userIdx = -1;

	socket.on("send user", function(idx) {
		userIdx = idx;
	});
});