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

//관계 테이블 구축
// 친구 테이블
// provide가 false 일 경우 일정 초대 목록에 true일 경우 친구 목록에 표시
const friend = sequelize.define("friend", {
	idx : {
		type : Sequelize.INTEGER,
		primaryKey : true,
		autoIncrement : true,
		allowNull : false
	},
	provide : {
		type : Sequelize.BOOLEAN,
		defaultValue : false,
		allowNull : false
	}
}, {
	tableName : "friend"
});

// 일정 테이블
// join이 false 일 경우 일정 공유 권유 목록에 true일 경우 일정 목록에 표시
// owner가 true일 경우 해당 일정을 자신이 삭제할 수 있다.
const UserScheduleRelation = sequelize.define("userScheduleRelation", {
	idx : {
		type : Sequelize.INTEGER,
		primaryKey : true,
		autoIncrement : true,
		allowNull : false
	},
	join : {
		type : Sequelize.BOOLEAN,
		defaultValue : false,
		allowNull : false
	},
	owner : {
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
	through : "friend"
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


//관계 테이블 다루는 법
/*var uss = [
	{
		site : "google",
		account : "abc",
		name : "afsdb",
		password : "1234",
		salt : "salt"
	},{
		site : "facebook",
		account : "abc",
		name : "afsdb",
		password : "1234",
		salt : "salt"
	},{
		site : "local",
		account : "abc",
		name : "afsdb",
		password : "1234",
		salt : "salt"
	},
];

var users = [];
sequelize.sync({force : true}).then(() => {
	return User.bulkCreate(uss);
}).then(() => {
	return User.findAll();
}).then((users1) => {
	users = users1;
	var promise = users1[0].addFriend(2, {provide : false});
	promise = promise.then(() => {
		return users1[1].addFriend(2, {provide : true});
	});
	promise = promise.then(() => {
		return users1[0].addFriend(3, {provide : true});
	});
	return promise;
}).then(() => {
	return users[0].getFriends();
}).then((friends) => {
	for(var i in friends[1].get().friend){
		console.log(i);
	}
	return friends[1].get().friend.update({
		provide : false
	});
}).then(() => {
	process.exit();
});*/

module.sync = () => {
	return sequelize.sync();
}