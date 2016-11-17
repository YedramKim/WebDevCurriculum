var module = module.exports = exports = {};

//데이터 베이스 로딩
var Sequelize = require("sequelize");
var sequelize = new Sequelize("schedule", "root", "phpmyadmin", {
	dialog : "mysql",
	host : "localhost",
	logging : false,
	define : {
		paranoid : true
	}
});

//회원 테이블 구축
var User = sequelize.define("user", {
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
var Schedule = sequelize.define("schedule", {
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
	image : {
		type : Sequelize.STRING(15),
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

// 유저와 일정의 관계 테이블

//테이블 관계 구축
User.belongsToMany(User, {
	as : "friends",
	through : "friend"
});
User.belongsToMany(Schedule, {
	foreignKey : "User",
	through : "UserHasSchedule"
});
Schedule.belongsToMany(User, {
	foreignKey : "Schedule",
	through : "UserHasSchedule"
});

module.sync = () => {
	return sequelize.sync();
}