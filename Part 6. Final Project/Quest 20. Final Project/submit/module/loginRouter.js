var path = require("path");
var express = require("express");
var router = module.exports = exports = new express.Router();

router.get("/check", (req, res, next) => {
	if(req.xhr) { //ajax을 경우에만 전송
		res.send({
			status : req.login
		});
	}else{
		next();
	}
});