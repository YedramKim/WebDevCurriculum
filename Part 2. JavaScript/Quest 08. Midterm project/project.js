var app = new Diary('.diary');

//단어장
function Diary(selector) {
	this.diaryNode = document.querySelector(selector);
}

//DOM 함수 추가
HTMLElement.prototype.width = function() {
	var pos = this.getBoundingClientRect();
	return pos.right - pos.left;
}
HTMLElement.prototype.height = function() {
	var pos = this.getBoundingClientRect();
	return pos.bottom - pos.top;
}