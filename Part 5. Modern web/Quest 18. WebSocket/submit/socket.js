var http = require("http");
var express = require("express");
var path = require("path");
var app = express();
var server = http.createServer(app);
var io = require("socket.io")(server);

app.use(express.static(path.join(__dirname, "client")))

app.get("/", function(req, res) {
	res.sendFile(path.join(__dirname, "client", "socket.html"));
});

server.listen(8080, function(){
	console.log("Server Running at localhost:8080");
});

io.on("connection", function(socket) {
	console.log("Socket", socket.id, " Start");
	socket.emit("start", {
		msg : "Hello, Socket.IO"
	});

	socket.on("msg", function(data){
		console.log("Socket", socket.id, "'s message is", data);
	});
});