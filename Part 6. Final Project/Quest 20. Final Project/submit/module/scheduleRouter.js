const path = require("path");
const express = require("express");
var router = module.exports = exports = new express.Router();

//데이터베이스 관련 모듈 객체
const Database = require("./sequelize");