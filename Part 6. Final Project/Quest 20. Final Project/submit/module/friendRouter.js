const path = require("path");
const express = require("express");
var router = module.exports = exports = new express.Router();

//데이터베이스 관련 모듈 객체
const Database = require("./sequelize");

//친구 목록 가져오기
router.get("/friends", (req, res, next) => {
	if(req.login === false) { //로그인 상태가 아닐 경우 실패 데이터 전송
		res.send([]);
		return;
	}
	var myIdx = req.session.userIdx;
	var User = Database.User;
	var friends = { // 전송할 유저 목록
		beforeAccept : [], // 아직 친구 요청을 수락하지 않은 유저 목록
		afterAccept : [] // 친구요청이 서로 수락한 유저 목록
	}

	User.findById(myIdx).then((user) => {
		return user.getFriends({
			attributes : ["name", "site", "idx", "account"]
		});
	}).then((users) => {
		var length = users.length;
		for(var i = 0; i < length; i++) {
			if(users[i].friend.friend) { // 양쪽 수락된 친구 관계일 경우
				friends.afterAccept.push(users[i]);
			}else if(!users[i].friend.beInvited) { // 자신이 초대한 친구인 경우
				friends.beforeAccept.push(users[i]);
			}
		}
		res.send(friends);
	});
});

//친구 삭제
router.post("/deleteFriend", (req, res) => {
	if(req.login === false) { //로그인 상태가 아닐 경우 실패 데이터 전송
		res.send({
			success : false
		});
		return;
	}
	var myIdx = req.session.userIdx; // 로그인 중인 회원의 idx
	var my = null; // 로그인 중인 회원의 정보
	var deleteIdx = req.body.deleteIdx; // 삭제할 회원의 idx
	var deleteFriend = null; // 삭제할 회원의 정보
	var type = req.body.type; // 처리 방식

	var User = Database.User;
	User.findById(myIdx).then((user) => { //로그인 중인 회원 정보 가져오기
		my = user;
		return my.getFriends({
			where : {
				idx : deleteIdx
			}
		});
	}).then((user) => { // 삭제할 친구 회원의 정보 가져오기
		deleteFriend = user[0];
		return my.removeFriend(deleteIdx); // 해당 idx의 친구와의 관계 삭제
	}).then(() => {
		return deleteFriend.removeFriend(myIdx); // 해당 idx의 친구와의 관계 삭제
	}).then(() => {
		res.send({
			success : true
		});
	}).catch((e) => { // 에러
		console.log(e);
		res.send({
			success : false
		});
	});
});

//유저 검색
router.get("/searchuser", (req, res) => {
	if(req.login === false) { //로그인 상태가 아닐 경우 실패 데이터 전송
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
			attributes : ["idx"],
			where : {
				$or : [
					{
						account : {
							$like : "%" + keyword + "%"
						}
					}, {
						name : {
							$like : "%" + keyword + "%"
						}
					}
				]
			}
		});
	}).then((friends) => {
		//console.log(friends);
		return User.findAll({ // 자신과 친구들을 제외한 키워드에 맞는 아이디,이메일, 이름을 가진 사람을 가져온다.
			attributes : ["idx", "name", "site"],
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
		//console.log(users.length);
		res.send(users);
	});
});

//친구 초대
router.post("/invite", (req, res) => {
	if(req.login === false) { //로그인 상태가 아닐 경우 실패 데이터 전송
		res.send({
			success : false
		});
		return;
	}
	var myIdx = req.session.userIdx; // 자기 자신의 idx
	var inviteIdx = req.body.inviteIdx; // 초대할 유저의 idx
	if(!inviteIdx) { // 정상적인 값이 아닌 경우
		res.send({
			success : false
		});
		return;
	}

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
		return friend.addFriend(myIdx, {beInvited : true});
	}).then(() => {
		res.send({
			success : true
		});
	}).catch((e) => {
		res.send({
			success : false
		});
	});
});

//자신한테 보낸 초대 데이터 전달
router.get("/invitelist", (req, res) => {
	if(req.login === false) { //로그인 상태가 아닐 경우 실패 데이터 전송
		res.send([]);
		return;
	}
	
	var User = Database.User;
	var userIdx = req.session.userIdx;
	var my = null; //유저 자기 자신
	User.findById(userIdx).then((user) => { // 우선 자신을 초대하거나 자신이 초대한 친구들의 목록을 전부 가져온다.
		my = user;
		return my.getFriends({ //idx, 이름, 소속 사이트만 전송한다.
			attributes : ["idx", "site", "name"]
		});
	}).then((friends) => {
		// 그중에서 자신한테 초대받은 데이터들(아직 수락하지 않은 데이터들)만 반환한다.
		return friends.filter((friend) => {
			return friend.friend.beInvited && !friend.friend.friend;
		});
	}).then((friends) => {
		res.send(friends.map((friend) => { // 전송에 불필요한 데이터 제거
			return {
				idx : friend.idx,
				name : friend.name,
				site : friend.site
			}
		}));
	});
});

//친구 초대 수락
router.post("/acceptInvite", (req, res) => {
	if(req.login === false) { //로그인 상태가 아닐 경우 실패 데이터 전송
		res.send({
			success : false
		});
		return;
	}
	var myIdx = req.session.userIdx; // 자기 자신의 idx
	var my = null; // user 테이블에서 가져온 자기 자신의 인스턴스
	var senderIdx = req.body.senderIdx; // 초대한 유저의 idx
	var sender = null; // user테이블에서 가져온 초대한 유저의 인스턴스

	var User = Database.User;
	User.findById(myIdx).then((user) => { // user테이블에서 자기 자신의 인스턴스를 가져오기
		my = user;
		return my.getFriends({ // user 테이블에서 초대자의 인스턴스를 가져온다.
			where : {
				idx : senderIdx
			}
		});
	}).then((users) => { //초대를 수락한다. (1번째 단계)
		sender = users[0];

		return sender.friend.update({
			friend : true
		}).then(() => {
			return sender.getFriends({
				where : {
					idx : myIdx
				}
			});
		});
	}).then((myInfo) => { //초대를 수락한다. (2번째 단계)
		my = myInfo[0];
		return my.friend.update({
			friend : true
		});
	}).then(() => {
		res.send({
			success : true
		});
	}).catch((e) => {
		console.log(e);
		res.send({
			success : false
		});
	});
});