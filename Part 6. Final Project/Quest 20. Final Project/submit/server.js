var module = module.exports = {};

//웹 서버
const express = require("./module/express");
var server = express.listen(80);

//데이터베이스
var Database = require("./module/sequelize");