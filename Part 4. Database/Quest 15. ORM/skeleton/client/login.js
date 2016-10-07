//로그인 폼 객체
var LoginForm = function(selector) {
	this.node = document.querySelector(selector);

	this.form = this.node.querySelector("form");
	this.inputs = this.form.querySelectorAll("input[type=text], input[type=password]");
	
	this.bindEvent();
}
//이벤트 설정
LoginForm.prototype.bindEvent = function() {
	var loginForm = this;
	//로그인 폼 제출 이벤트
	this.form.addEventListener("submit", function(e) {

		var length = loginForm.inputs.length; // 로그인 폼에 있는 input요소 길이
		for(var i = 0; i < length; i++) {
			var input = loginForm.inputs[i];
			var val = input.value.trim();
			if(val === "") { // input 값이 비어있을 경우 매세지를 띄우고 이벤트를 중단한다.
				alert(input.getAttribute("data-message"));
				input.focus();
				e.preventDefault();
				break;
			}
		}
	});
}