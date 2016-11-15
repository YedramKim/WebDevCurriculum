var fs = require("fs");
var path = require("path");
var express = require("express");
var Database = require("./sequelize");
var noteRouter = module.exports = exports = express.Router();

//메모장 리스트를 전송
noteRouter.get('/', function(req, res) {
	//자신의 id
	var idx = req.userIdx;
	idx = idx !== undefined ? idx : -1;

	//메모 데이터 불러오기
	Database.User.findOne({
		where : {
			idx : idx
		}
	}).then(function(user) {
		return user.getMemos();
	}).then(function(memos) {
		var length = memos.length;
		for(var i = 0; i < length; i++) {
			memos[i] = {
				idx : memos[i].idx,
				title : memos[i].title,
				userIdx : memos[i].userIdx
			}
		}
		memos = memos.length !== 0 ? memos : [];
		res.json(memos);
	});
});
//메모정보 전부 공개
noteRouter.get('/all', function(req, res) {
	Database.Memo.findAll().then(function(memos){
		res.json(memos.map((memo) => {
			return {
				idx : memo.idx,
				title : memo.title,
				user : memo.userIdx
			}
		}));
	});
});
//지정한 메모 로드
noteRouter.get('/load/:idx' , function(req, res) {
	var idx = parseInt(req.params.idx);
	var userIdx = req.userIdx;

	Database.Memo.findOne({
		attributes : ["content"],
		where : {
			idx : idx,
			userIdx : userIdx
		}
	}).then(function(memo) {
		if(memo === null) {
			res.send("Error");
		}else{
			res.send(memo.content);
		}
	});
});
//메모 생성
noteRouter.post("/create", function(req, res) {
	var title = req.body.title;
	var userIdx = req.userIdx;
	var writer = null;
	
	Database.User.findOne({
		where : {
			idx : userIdx
		}
	}).then(function(user) {
		writer = user;
		return Database.Memo.create({
			title : title,
			content : "",
			userIdx : userIdx
		});
	}).then(function(memo){
		//res.send()로 숫자를 보낼때는 반드시 toString()을 사용할 것
		res.send(memo.idx.toString());
		return writer.addMemo(memo);
	}).then(function() {
		
	});
});
//메모 수정
noteRouter.post("/modify", function(req, res) {
	var data = req.body;
	var idx = data.idx;
	var title = data.title;
	var content = data.content;
	var userIdx = req.userIdx;

	//데이터베이스에 있는 메모 수정
	Database.Memo.update({
		content : content
	},{
		where : {
			idx : idx,
			userIdx : userIdx
		}
	}).then(function(data) {
		res.send("save");
	})
});
//메모 삭제
noteRouter.post("/delete", function(req, res) {
	var idx = req.body.idx;
	var userIdx = req.userIdx;

	//idx와 userIdx가 같은 데이터 삭제
	Database.Memo.destroy({
		where : {
			idx : idx,
			userIdx : userIdx,
		}
	}).then(function(){
		res.send("deleted!!");
	});
});