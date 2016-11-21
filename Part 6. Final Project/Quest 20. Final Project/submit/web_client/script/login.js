var Form = function(selector) {
	var form = this.form = document.querySelector(selector);
	var toast = this.toast = document.querySelector("toast-alert");
	
	this.form.addEventListener("submit", (e) => {
		var inputs = form.querySelectorAll("input");
		var length = inputs.length;
		for(var i = 0; i < length; i++) {
			if(inputs[i].value.trim() === "") {
				toast.alert(inputs[i].placeholder + "를 입력하세요.");
				inputs[i].focus();
				e.preventDefault();
				return;
			}
		}
	});
}
var receiveBehavior = {
	properties : {
		receiveNode : {
			type : Object,
			reflectToAttribute : true,
			notify : true,
			readOnly : true
		},
	},
	ready : function() {
		this._setReceiveNode(this);
	}
};