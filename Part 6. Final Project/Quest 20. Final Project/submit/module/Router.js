var path = require("path");
var express = require("express");
var router = module.exports = exports = new express.Router();

router.use((req, res) => {
	if(!req.xhr){
		res.sendFile(path.join(__dirname, "..", "client", "index.html"));
	}
});