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

var User = sequelize.define("user", {
	idx : {
		type : Sequelize.INTEGER,
		primaryKey : true,
		allowNull : false
	},
	site : {
		type : Sequelize.ENUM("local", "google", "facebook"),
		allowNull : false,
		unique : "userUnique"
	},
	id : {
		type : Sequelize.STRING(50),
		allowNull : false,
		unique : "userUnique"
	},
	name : {
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

module.sync = () => {
	return sequelize.sync();
}