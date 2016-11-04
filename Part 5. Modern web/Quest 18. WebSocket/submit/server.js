var express = require("express");
var app = express();

app.use(function(req, res) {
	res.send("Hello");
});

app.listen(8080, function(){
	console.log("Running at localhost:8080");
});