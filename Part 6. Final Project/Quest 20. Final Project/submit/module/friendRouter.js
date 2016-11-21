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
	var my = null; //자기 자신의 정보 
	var userIdx = req.session.userIdx;
	var keyword = req.query.keyword;

	var User = Database.User;
	var friendIdxs = []; //친구들의 idx번호
	var users = []; // 유저들 정보
	// 우선 자신의 인스턴스를 가져오고
	User.findById(userIdx).then((user) => {
		my = user;
		return user.getFriends({ // 우선 자신의 친구들 idx 정보 가져오기
			where : {
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
		}).then((friends) => {
			return friends.map((friend => {
				return friend.idx;
			}));
		});

	}).then((friends) => {
		console.log(friends);
		return User.findAll({ // 자신과 친구들을 제외한 키워드에 맞는 아이디,이메일, 이름을 가진 사람을 가져온다.
			where : {
				idx : {
					$and : [
						{ $ne : userIdx }/*,
						{ $notIn : friends }*/
					]
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
		});
	}).then((users) => {
		console.log(users.length);
		res.send(users);
	});
});

router.get("/invite", (req, res) => {
	if(req.login === false) { //로그인 상태가 아닐 경우
		res.send({
			result : false
		});
		return;
	}
	var myIdx = req.session.userIdx; // 자기 자신의 idx
	var inviteIdx = req.query.inviteIdx; // 초대할 유저의 idx
	var my = null; //user 테이블의 자기 자신의 데이터가 담긴 인스턴스
	var friend = null; //user 테이블의 초대받는 사람의 데이터가 담긴 인스턴스

	var User = Database.User;
	User.findById(myIdx).then((user) => {
		my = user;
		return User.findById(inviteIdx);
	}).then((inviteUser) => {
		friend = inviteUser;
		return my.addFriend(inviteIdx); // 친구 초청 보내기
	}).then(() => {
		return friend.addFriend(myIdx);
	}).then(() => {
		res.send({
			result : true
		});
	}).catch((e) => {
		res.send({
			result : false
		});
	});
});