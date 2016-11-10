var express = require("express");
var static = require("serve-static");
var app = express();
var path = require("path");

app.use("/static", static(path.join(__dirname, "../", "client")));
app.use("/polymer", static(path.join(__dirname, "../", "bower_components")));
app.use("/elements", static(path.join(__dirname, "../", "elements")));

app.use("/service-worker.js", function(req, res) {
	res.sendFile(path.join(__dirname, "../", "client", "service-worker.js"));
});

app.get(["/room", "/room/*"], function(req, res) {
	res.sendFile(path.join(__dirname, "../", "client", "room.html"));
});

//방 목록
app.get("/", function(req, res) {
	res.sendFile(path.join(__dirname, "../", "client", "list.html"));
});

module.exports = exports = app.listen(8080, function(){
	console.log("Running at localhost:8080");
});