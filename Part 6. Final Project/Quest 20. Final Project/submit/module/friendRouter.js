const path = require("path");
const express = require("express");
var router = module.exports = exports = new express.Router();

//데이터베이스 관련 모듈 객체
const Database = require("./sequelize");

router.use("/searchuser", (req, res) => {
	if(req.login === false) { //로그인 상태가 아닐 경우
		res.send([]);
		return;
	}
	var userIdx = req.session.userIdx;
	var keyword = req.query.keyword;

	var User = Database.User;
	// 자신을 제외하고 키워드에 맞는 아이디,이메일, 이름을 가진 사람을 가져온다.
	User.findAll({
		where : {
			idx : {
				$ne : userIdx
			},
			$or : [
				{
					account : {
						$like : "%" + keyword + "%"
					}
				},{
					name : {
						$like : "%" + keyword + "%"
					}
				},
			]
		}
	}).then((users) => {
		res.send(users);
	});
});