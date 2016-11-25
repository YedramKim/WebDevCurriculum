const path = require("path");
const fs = require("fs");
const express = require("express");
const multer = require("multer");
const upload = multer({dest : path.join(__dirname, "..", "multer_uploads/")});
var router = module.exports = exports = new express.Router();

//데이터베이스 관련 모듈 객체
const Database = require("./sequelize");
const User = Database.User;
const Schedule = Database.Schedule;

//일정 목록 얻어오기
router.get("/mySchedules", (req, res) => {
	if(req.login === false) { //로그인 상태가 아닐 경우 빈 데이터 전송
		res.send([]);
		return;
	}
	var userIdx = req.session.userIdx;
	var user = null;

	User.findById(userIdx).then((u) => { // 유저 정보를 얻어온 뒤에 일정을 받아온다.
		user = u;
		return user.getSchedules({
			attributes : ["idx", "title", "startTime", "endTime"]
		});
	}).then((schedules) => {
		return schedules.filter((schedule) => { // 자신이 참가하기로 한 일정만 걸러낸다.
			return schedule.userScheduleRelation.join;
		});
	}).then((schedules) => {
		res.send(schedules.map((schedule) => { // 필요한 정보만 보낸다.
			return {
				idx : schedule.idx,
				title : schedule.title,
				startTime : schedule.startTime,
				endTime : schedule.endTime,
			};
		}));
	});
});

//일정 얻어오기
router.get("/load", (req, res) => {
	if(req.login === false) { //로그인 상태가 아닐 경우 빈 데이터 전송
		res.send({
			success : false
		});
		return;
	}
	var userIdx = req.session.userIdx;
	var scheduleIdx = req.query.idx;
	var user = null; // 유저 인스턴스
	var schedule = null; //일정 인스턴스

	User.findById(userIdx).then((u) => {
		user = u;
		return user.getSchedules({ // 우선 스케쥴을 가져온다.
			where : {
				idx : scheduleIdx
			},
			attributes : ["idx", "title", "content", "startTime", "endTime", "image", "useMap", "latitude", "longitude"],
			limit : 1
		});
	}).then((schedules) => {
		if(schedules.length === 0) { // 스케쥴을 못가져 왔을 경우
			throw {
				success : false,
				message : "have not"
			}
		}
		schedule = schedules[0];
		if(schedule.image) { // 이미지가 업로드 되어있을 경우 이미지 이름을 수정해서 보낸다.
			schedule.image = schedule.idx + "__" + schedule.image;
		}else { 
			schedule.image = false;
		}
		schedule.userScheduleRelation = undefined;

		return schedule.getUsers(); //일정과 관련된 인원들 구하기
	}).then((users) => {
		return users.filter((user) => { // 일정을 같이 하기로 한 친구들만 걸러내기
			return user.userScheduleRelation.join;
		});
	}).then((users) => { // 데이터 전송
		schedule.count = users.length;
		res.send({
			content : schedule.content,
			endTime : schedule.endTime,
			idx : schedule.idx,
			image : schedule.image,
			latitude : schedule.latitude,
			longitude : schedule.longitude,
			startTime : schedule.startTime,
			title : schedule.title,
			useMap : schedule.useMap,
			count : schedule.count,
		});
	}).catch((e) => {
		res.send(e)
	})
});

//일정 참여 취소
router.post("/exitSchedule", (req, res) => {
	if(req.login === false) { //로그인 상태가 아닐 경우 실패 데이터 전송
		res.send({
			success : false,
			cause : "login"
		});
		return;
	}
	var userIdx = req.session.userIdx;
	var scheduleIdx = req.body.idx;

	User.findById(userIdx).then((user) => {
		return user.removeSchedule(scheduleIdx);
	}).then((result) => {
		res.send({
			success : true
		});
	}).catch((e) => {
		res.send({
			success : false
		});
	});
});

//일정 등록
router.post("/register",  (req, res) => {
	if(req.login === false) { //로그인 상태가 아닐 경우 실패 데이터 전송
		res.send({
			success : false,
			cause : "login"
		});
		return;
	}
	var userIdx = req.session.userIdx || 1;
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
	var content = req.body.content || "";
	if(content.trim() === "") {
		res.send({
			success : false,
			cause : "content"
		});
	}
	scheduleData.content = content.split("\n").join("<br>");

	//시작 날짜 (만에 하나 지정 되어 있지 않으면 지금 시간을 지정)
	var startTime = scheduleData.startTime = req.body.startTime || "";

	//종료 날짜(만에 하나 지정되어 있지 않으면 startTime의 1시간 뒤)
	var endTime = scheduleData.endTime = req.body.endTime || "";

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
	User.findById(userIdx).then((user) => {
		return user.getSchedules({ // 겹치는 시간대 찾아보기
			attributes : ["idx", "startTime", "endTime"],
			where : {
				$or : [
					{
						endTime : {
							$gte : startTime
						},
						startTime : {
							$lte : startTime
						}
					},
					{
						startTime : {
							$lte : endTime
						},
						endTime : {
							$gte : endTime
						}
					}
				]
			},
			limit : 1
		});
	}).then((schedules) => {
		if(schedules.length) { // 겹치는 시간대가 있으면 예외처리를 던져 일정 생성을 중단한다.
			throw "timeCrash" + schedules[0].idx;
		}
		return Schedule.create(scheduleData).then((schedule) => { // 우선 일정을 추가하고
			req.scheduleIdx = schedule.idx;
			createSchedule = schedule;
			return schedule.addUser(userIdx, { // 추가한 유저와 연결한다.
				join : true
			});
		})
	}).then(() => {
		// 공유하기로 설정한 친구가 있으면 우선 관계를 맺는다.
		// 우선 일정에 참가한다는 join은 false
		if(shareFriend.length) {
			return createSchedule.addUsers(shareFriend);
		}
	}).then(() => {
		res.send({
			success : req.scheduleIdx
		});
	}).catch((error) => {
		res.send({
			success : false,
			cause : error
		});
	});
});

//이미지 업로드
router.post("/imageUpload", upload.single("image"), (req, res) => {
	var scheduleIdx = req.body.scheduleIdx;
	var filePath = scheduleIdx + "__" + req.file.originalname;
	filePath = path.join(__dirname, "..", "scheduleImages", filePath);
	fs.rename(req.file.path, filePath, (err) => {
		if(err) {
			res.send({
				success : false
			});
		}else {
			res.send({
				success : true,
				link : scheduleIdx
			});
		}
	});
});

//초대받은 일정 받기
router.get("/invites", (req, res) => {
	if(req.login === false) { //로그인 상태가 아닐 경우 빈 데이터 전송
		res.send([]);
		return;
	}

	var userIdx = req.session.userIdx;
	var user = null;

	//유저 데이터 얻기
	User.findById(userIdx).then((u) => {
		user = u;
		return user.getSchedules({
			attributes : ["idx", "title", "startTime", "endTime"]
		}); // 우선 자신과 관련된 모든 일정얻기
	}).then((schedules) => {
		return schedules.filter((schedule) => { // 그중에서 join가 false인 데이터만 전송
			return !schedule.userScheduleRelation.join;
		});
	}).then((schedules) => {
		res.send(schedules.map((schedule) => { //userScheduleRelation 데이터는 전송하지 않음
			return {
				idx : schedule.idx,
				title : schedule.title,
				startTime : schedule.startTime,
				endTime : schedule.endTime
			}
		}));
	});
});

// 일정 참가
router.post("/joinSchedule", (req, res) => {
	if(req.login === false) { //로그인 상태가 아닐 경우 실패 데이터 전송
		res.send({
			success : false,
			cause : "login"
		});
		return;
	}
	var userIdx = req.session.userIdx;
	var scheduleIdx = req.body.idx;
	var startTime = req.body.startTime;
	var endTime = req.body.endTime;

	var user = null;

	User.findById(userIdx).then((u) => {
		user = u;
		return user.getSchedules({ // 시간이 겹쳐지는 자신과 관련된 일정 모두 가져오기
			where : {
				$or : [
					{
						endTime : {
							$gte : startTime
						},
						startTime : {
							$lte : startTime
						}
					},
					{
						startTime : {
							$lte : endTime
						},
						endTime : {
							$gte : endTime
						}
					}
				]
			},
			attributes : ["idx"]
		});
	}).then((schedules) => { // 자신이 참가하기로 한 일정만 걸러낸다.
		return schedules.filter((schedule) => {
			return schedule.userScheduleRelation.join;
		});
	}).then((schedules) => {
		if(schedules.length) { // 겹치는 일정이 있을 경우 에러 메세지를 보내고 종료한다.
			throw {
				message : "timeCrash" + schedules[0].idx
			};
		}else {
			return user.getSchedules({ // 일정 얻어오기
				where : {
					idx : scheduleIdx
				}
			});
		}
	}).then((schedules) => {
		if(schedules.length) { // 일정을 정상적으로 받아오면
			return schedules[0].userScheduleRelation.update({
				join : true
			});
		}else {
			throw {
				message : "have not"
			}
		}
	}).then(() => {
		res.send({
			success : true,
			link : scheduleIdx
		});
	}).catch((e) => {
		res.send({
			success : false,
			cause : e.message
		});
	});

});

//일정 간략하게 보기
router.get("/summary", (req, res) => {
	if(req.login === false) { //로그인 상태가 아닐 경우 실패 데이터 전송
		res.send({});
		return;
	}
	var userIdx = req.session.userIdx;
	var scheduleIdx = req.query.idx;

	var schedule = null;

	Schedule.findById(scheduleIdx, {
		attributes : ["idx", "title", "content", "startTime", "endTime"]
	}).then((s) => { // 일정 정보 얻기
		schedule = s;
		return schedule.getUsers({
			where : {
				idx : userIdx
			},
			limit : 1
		});
	}).then((users) => {
		if(users.length) {
			schedule.success = true;
			res.send(schedule);
		}else {
			res.send({
				success : false,
				cause : "have not"
			});
		}
	});
});