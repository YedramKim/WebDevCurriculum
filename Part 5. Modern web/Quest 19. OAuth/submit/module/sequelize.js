//데이터 베이스 모듈
var module = module.exports = exports = {};
var Sequelize = require('sequelize');
var crypto = require('crypto');

//회원 목록(서버가 실행이 될 때 이 목록을 토대로 회원을 만든다.)
var users = [
	{
		id : "admin",
		password : "1234",
		nickname : "집게사장"
	},
	{
		id : "employee1",
		password : "1234",
		nickname : "징징이"
	},
	{
		id : "employee2",
		password : "1234",
		nickname : "스폰지밥"
	}
];

//지정한 범위의 숫자를 랜덤으로 생성하는 함수
function randomInt(max, min = 0) {
	if(max < min) {
		var temp = max;
		max = min;
		min = temp;
	}
	max -= min;
	return Math.floor(Math.random() * (max + 1)) + min;
}

//솔트 문자열을 생성하는 함수
var saltenglish = "0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
var charLength = saltenglish.length - 1;
function createSalt() {
	var salt = "";
	for(var i = 0; i < 32; i++) {
		salt += saltenglish[randomInt(0, charLength)];
	}
	return salt;
}

//데이터 베이스 ORM
var sequelize = new Sequelize("oauth", "root", "phpmyadmin", {
	host : "localhost",
	dialect : "mysql",
	logging : false,
	define : {
		paranoid : true
	}
});

//회원 테이블 모델 생성
var User = module.User = sequelize.define("user", {
	idx : {
		type : Sequelize.INTEGER,
		allowNull : false,
		autoIncrement : true,
		primaryKey : true
	},
	id : {
		type : Sequelize.STRING(50),
		unique : true,
		allowNull : false
	},
	nickname : {
		type : Sequelize.STRING(20),
		allowNull : false
	},
	password : {
		type : Sequelize.CHAR(64),
		allowNull : false
	},
	salt : {
		type : Sequelize.CHAR(32),
		allowNull : false
	}
}, {
	tableName : "user"
});

//메모 테이블 모델 생성
var Memo = module.Memo = sequelize.define("memo", {
	idx : {
		type : Sequelize.INTEGER,
		primaryKey : true,
		autoIncrement : true,
		allowNull : false
	},
	title : {
		type : Sequelize.STRING,
		allowNull : false
	},
	content : {
		type : Sequelize.TEXT,
		allowNull : false
	}
}, {
	tableName : "memo"
});
//`user`테이블 생성
//회원이 없을 경우 생성한다.
// User 모델과 Memo 모델을 1:N 관계로 정의한다.
User.hasMany(Memo, {
	foreignKey : "userIdx"
});
Memo.belongsTo(User, {
	foreignKey : "userIdx",
	targetKey : "idx"
});

User.sync().then(function(){
	return User.count();
}).then(function(count) {
	var promise = User.sync();
	if(count === 0) {
		//회원 별로 솔트 문자열 생성 및 데이터베이스에 정보 등록
		var length = users.length;
		for(var i = 0; i < length; i++) {
			//솔트 문자열 생성
			var salt = createSalt();
			users[i]["salt"] = salt;

			//암호문 만들기
			var pass = users[i]["password"] + salt;
			var hash = crypto.createHash("sha256");

			users[i]["password"] = hash.update(pass , "utf8").digest("hex");
		}
		return User.bulkCreate(users);
	}
	return null;
}).then(function() {
	return Memo.sync();
}).then(function() {
	console.log("Database ready complete");
});