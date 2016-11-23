const path = require("path");
const express = require("express");
const multer = require("multer");
const storage = multer.diskStorage({
	destination : (req, file, cb) => {
		cb(null, path.join(__dirname, "..", "multer_uploads/"));
	},
	//서버에 저장할 파일명
	fileName : (req, file, cb) => {
		var name = req.body.image || "image.png";
		name = name.split("/");
		name = req.scheduleIdx + "__" + name[name.length - 1];
		file.image = {
			name : name,
			ext : file.mimetype.split("/")[1]
		};
		cb(null, file.image.name);
	}
});
const upload = function(req, res) { //파일 업로드 함수
	var file = multer({storage : storage}).single("image");
	var uploadPromise = new Promise((resolve, reject) => {
		file(req, res, (err) => {
			if(err) {
				resolve();
			}else {
				reject(req.file.image);
			}
		});
	});
	return uploadPromise;
};
/*var upload = multer({dest : path.join(__dirname, "..", "multer_uploads")});*/
var router = module.exports = exports = new express.Router();

//데이터베이스 관련 모듈 객체
const Database = require("./sequelize");
const User = Database.User;
const Schedule = Database.Schedule;

router.post("/register", (req, res) => {
	if(req.login === false) { //로그인 상태가 아닐 경우 실패 데이터 전송
		res.send({
			success : false,
			cause : "login"
		});
		return;
	}
	var userIdx = req.session.userIdx;
	var scheduleData = {}; // 데이터 베이스에 보낼 데이터
	//제목 검사
	var title = scheduleData.title = req.body.title || "";
	if(title.trim() === "") {
		res.send({
			success : false,
			cause : "title"
		});
		return
	}
	//내용 검사
	var content = scheduleData.content = req.body.content || "";
	if(content.trim() === "") {
		res.send({
			success : false,
			cause : "content"
		});
	}
	//시작 날짜 (만에 하나 지정 되어 있지 않으면 지금 시간을 지정)
	var startTime = new Date(req.body.startTime || Date.now());
	startTime = scheduleData.startTime = startTime.getTime();

	//종료 날짜(만에 하나 지정되어 있지 않으면 startTime의 1시간 뒤)
	var endTime = new Date(req.body.endTime || startTime + 36000000);
	endTime = scheduleData.endTime = endTime.getTime();

	//이미지 설정
	var useImage = false;
	if(req.body.useImage && req.body.image) { // 이미지를 사용할 경우
		useImage = true;
		var fileName = req.body.image.split("\\");
		fileName = scheduleData.image = fileName[fileName.length - 1];
	}

	if(req.body.useMap) { // 지도를 사용할 경우
		scheduleData.useMap = true;
		scheduleData.latitude = req.body.latitude;
		scheduleData.longitude = req.body.longitude;
	}

	var shareFriend = [];
	if(req.body['friends[]']) { // 일정을 공유할 친구가 있을 경우
		shareFriend = req.body['friends[]'].split(",");
	}

	var createSchedule = null;
	res.send({
		success : true
	});
	/*Schedule.create(scheduleData).then((schedule) => { // 우선 스케쥴을 추가하고
		req.scheduleIdx = schedule.idx;
		createSchedule = schedule;
		return schedule.addUser(userIdx, { // 추가한 유저와 연결한다.
			owner : true,
			see : true
		});
	}).then(() => {
		// 공유하기로 설정한 친구가 있으면 우선 관계를 맺는다.
		// 우선 일정에 참가한다는 join은 false
		if(shareFriend.length) {
			return createSchedule.addUsers(shareFriend);
		}
	}).then(() => {
		res.send({
			success : true,
			file : req.file
		});
		console.log(req.body);
	}).catch(() => {
		res.send({
			success : false,
			cause : "??"
		});
	});*/
});