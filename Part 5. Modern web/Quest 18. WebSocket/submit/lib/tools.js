module.exports = exports = {};

var materialWords = "qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
var wordNumber = materialWords.length - 1;

function random(num1, num2 = 1) {
	var _rand = Math.random();
	if(num1 > num2) {
		var temp = num1;
		num1 = num2;
		num2 = temp;
	}
	var min = num1;
	var max = num2 + 1;

	var range = max - min;
	_rand *= range;
	_rand = Math.floor(_rand);
	_rand = min + _rand;

	return _rand;
}

exports.random = random;

var wordLength = 20;
function createRandomString(length){
	var str = "";
	length = length || wordLength;
	for(var i = 0; i < length; i++) {
		var num = random(0, wordNumber);
		str += materialWords[num];
	}
	return str;
}

exports.createRandomString = createRandomString;