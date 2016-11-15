var server = require("./module/express").listen(80).then(function(express) {
	server = express;
});