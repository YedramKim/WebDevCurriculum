var module = module.exports = exports = {};

//데이터 베이스 로딩
var Sequelize = require("sequelize");
var sequelize = new Sequelize("schedule", "root", "phpmyadmin", {
	dialog : "mysql",
	host : "localhost",
	logging : false,
	timezone : "+09:00",
	define : {
		paranoid : true
	}
});

//회원 테이블 구축
const User = module.User = sequelize.define("user", {
	idx : {
		type : Sequelize.INTEGER,
		primaryKey : true,
		autoIncrement : true,
		allowNull : false
	},
	site : {
		type : Sequelize.ENUM("local", "google", "facebook"),
		defaultValue : "google",
		allowNull : false,
		unique : "userUnique"
	},
	account : {
		type : Sequelize.STRING(50),
		allowNull : false,
		defaultValue : "",
		unique : "userUnique"
	},
	name : {
		type : Sequelize.STRING(20),
		allowNull : false,
		defaultValue : ""
	},
	password : {
		type : Sequelize.CHAR(64),
		allowNull : false,
		defaultValue : ""
	},
	salt : {
		type : Sequelize.CHAR(32),
		allowNull : false,
		defaultValue : ""
	}
}, {
	tableName : "user"
});

//일정 테이블 구축
const Schedule = module.Schedule = sequelize.define("schedule", {
	idx : {
		type : Sequelize.INTEGER,
		primaryKey : true,
		autoIncrement : true,
		allowNull : false
	},
	title : {
		type : Sequelize.STRING(40),
		allowNull : false,
		defaultValue : "title"
	},
	content : {
		type : Sequelize.TEXT,
		allowNull : false
	},
	startTime : {
		type : Sequelize.CHAR(19),
		allowNull : false
	},
	endTime : {
		type : Sequelize.CHAR(19),
		allowNull : false
	},
	image : {
		type : Sequelize.STRING(60),
		allowNull : true
	},
	useMap : {
		type : Sequelize.BOOLEAN,
		allowNull : false,
		defaultValue : false
	},
	latitude : {
		type : Sequelize.CHAR(20),
		allowNull : true
	},
	longitude : {
		type : Sequelize.CHAR(20),
		allowNull : true
	}
}, {
	tableName : "schedule"
});

//관계 테이블 구축
// 친구 테이블
// provide가 false 일 경우 일정 초대 목록에 true일 경우 친구 목록에 표시
const Friend = sequelize.define("friend", {
	beInvited : { // 초대를 받아 생긴 데이터이면 true, 초대해서 생긴 데이터이면 true 
		type : Sequelize.BOOLEAN,
		defaultValue : false,
		allowNull : false
	},
	friend : { // 수락받은 상태인지 표시
		type : Sequelize.BOOLEAN,
		defaultValue : false,
		allowNull : false
	}
}, {
	tableName : "friend",
	paranoid : false
});

// 일정 테이블
// join이 false 일 경우 일정 공유 권유 목록에 true일 경우 일정 목록에 표시
// owner가 true일 경우 해당 일정을 자신이 삭제할 수 있다.
const UserScheduleRelation = sequelize.define("userScheduleRelation", {
	join : { // 일정에 참가하기로 결정
		type : Sequelize.BOOLEAN,
		defaultValue : false,
		allowNull : false
	}
}, {
	tableName : "userScheduleRelation"
});

//테이블 관계 구축
//친구 관계
User.belongsToMany(User, {
	as : "friends",
	through : Friend
});
//유저와 일정의 관계
User.belongsToMany(Schedule, {
	foreignKey : "User",
	through : UserScheduleRelation
});
Schedule.belongsToMany(User, {
	foreignKey : "Schedule",
	through : UserScheduleRelation
});

module.sync = () => {
	return sequelize.sync();
}