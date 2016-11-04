var SvgController = function(selector) {
	this.node = document.querySelector(selector);
	this.node.style.height = "100%";
	this.node.style.overflow = "hidden";

	//svg 도형 모음
	var svgTemplates = document.querySelector("template.svg_template").content;
	this.svgTriangle = svgTemplates.querySelector('svg.triangle').cloneNode(true);
	this.svgRectangle = svgTemplates.querySelector('svg.rectangle').cloneNode(true);
	this.svgCircle = svgTemplates.querySelector('svg.circle').cloneNode(true);

	this.target = null; // 조종할 노드

	//키보드 누르기 점검표
	// 0 : 눌러져 있지 않음
	// 1 : 눌러져 있는 상태
	// -1 : 눌러져 있지만 이벤트에는 영향을 미치지 않는 상태
	this.keyState = {
		left : 0,
		top : 0,
		right : 0,
		bottom : 0
	};

	//도형이동 인터벌
	this.processInterval = null;
	//도형이동 인터벌에 사용할 함수
	this.processIntervalFunction = this.keyBoardInterval.bind(this);

	//생성 버튼 클릭시 임시로 보여줄 svg
	this.beforeCreate = null;

	//이벤트 설정
	this.bindEvent();
}
SvgController.prototype.keyBoardInterval = function() {
	//만약 지정된 도형이 없다면 종료한다.
	if(!this.target) {
		return false;
	}

	//기존 위치정보 얻어오기
	var left = this.target.style.left.trim();
	left = left ? parseInt(left) : 0;
	var top = this.target.style.top.trim();
	top = top ? parseInt(top) : 0;

	//svg 위치 재설정
	var speed = 3;
	if(this.keyState.left === 1){
		left -= speed;
	}else if(this.keyState.right === 1){
		left += speed;
	}

	if(this.keyState.top === 1){
		top -= speed;
	}else if(this.keyState.bottom === 1){
		top += speed;
	}

	this.target.style.left = left + "px";
	this.target.style.top = top + "px";
}
SvgController.prototype.bindEvent = function() {
	//이벤트 내부에서 필요한 변수들
	var svgController = this;
	var node = this.node;
	var keyState = this.keyState;

	//svg 클릭 이벤트(이동대상 변경)
	//svg는 수시로 추가되거나 제거되므로 svg를 저장하는 태그에다가
	//클릭이벤트를 걸음
	node.addEventListener("click", function(e) {
		var target = e.target.closest("svg");

		//클릭한 노드가 svg가 아닐경우 종료
		if(target === null) {
			return;
		}

		//기존의 선택된 svg의 select클래스를 삭제하고
		//지금 선택한 svg에 select클래스를 추가한다.
		svgController.reSelect(target);

		//정확히 도형을 클릭했을 때 이벤트가 발생하도록
		//자신과 부모 노드들 중에 svg 태그는 있되 자신이 svg 태그여서는 안된다.
		if(target != e.target){
			svgController.target = target;
		}
	});

	//svg 생성 이벤트
	var lists = node.querySelectorAll(".createButtons li");
	var length = lists.length;
	for(var i = 0; i < length; i++) {
		var button = lists[i];
		button.addEventListener("click", function(e) {
			e.stopPropagation();

			//기존의 생성하려고 하는 svg가 있는 상태에서
			//클릭한 상황이라면 기존의 svg를 삭세한다.
			var beforeCreate = svgController.beforeCreate;
			if(beforeCreate !== null) {
				beforeCreate.parentNode.removeChild(beforeCreate);
			}

			//클릭한 목록에 따라 필요한 svg를 가져온다.
			var svg = this.getAttribute("data-shape");
			svgController.beforeCreate = svg = svgController[svg].cloneNode(true);
			svg.classList.add("beforeCreate");

			//초기위치 설정
			svg.style.left = e.pageX - 50 + "px";
			svg.style.top = e.pageY - 50 + "px";
			//아직 생성하기 전의 svg를 웹의 가장 위쪽에 삽입한다.
			document.body.appendChild(svg);
		});
	}

	//생성하기 전의 svg가 존재할 경우 마우스가 움직일 때 같이 이동한다.
	document.body.addEventListener("mousemove", function(e) {
		var beforeCreate = svgController.beforeCreate;
		if(beforeCreate !== null) { //지정되어 있는 svg가 있으면 실행
			beforeCreate.style.left = e.pageX - 50 + "px";
			beforeCreate.style.top = e.pageY - 50 + "px";
		}
	});

	//생성하기 전의 svg가 존재할 경우 마우스를 클릭할 때
	//svg를 스케치보드에 추가한다.
	document.body.addEventListener("click", function(e) {
		var beforeCreate = svgController.beforeCreate;
		if(beforeCreate !== null) { //지정되어 있는 svg가 있으면 실행
			var pos = node.getBoundingClientRect();
			var x = e.pageX - 50;
			var y = e.pageY - 50;

			//클래스 삭제 및 스케치 보드 내의 위치 설정
			beforeCreate.classList.remove("beforeCreate")
			beforeCreate.style.left = x + "px";
			beforeCreate.style.top = y + "px";

			//스케치보드에 svg 삽입
			node.appendChild(beforeCreate);

			//자동적으로 생성한 svg를 선택 상태로 설정
			svgController.beforeCreate = null;
			svgController.target = beforeCreate;

			//이동하는 svg 재선택
			svgController.reSelect(svgController.target);
		}
	});

	//keydown 이벤트
	document.body.addEventListener("keydown", function(e) {
		var keyCode = e.keyCode;
		console.log(1);

		switch(keyCode){
			case SvgController.keyCode.left:
				keyState.left = 1;
				if(keyState.right === 1) { // 만약 기존에 오른쪽 키가 눌러져 있던 경우
					keyState.right = -1;
				}
				break;
			case SvgController.keyCode.right:
				keyState.right = 1;
				if(keyState.left === 1) { // 만약 기존에 왼쪽 키가 눌러져 있던 경우
					keyState.left = -1;
				}
				break;
			case SvgController.keyCode.top:
				keyState.top = 1;
				if(keyState.bottom === 1) { // 만약 기존에 아래쪽 키가 눌러져 있던 경우
					keyState.bottom = -1;
				}
				break;
			case SvgController.keyCode.bottom:
				keyState.bottom = 1;
				if(keyState.top === 1) { // 만약 기존에 위쪽 키가 눌러져 있던 경우
					keyState.top = -1;
				}
				break;
			case SvgController.keyCode.delete:
				svgController.target.parentNode.removeChild(svgController.target);
				svgController.target = null;
				break;
		}

		//만약 도형이동 인터벌이 설정되어 있지 않을 때
		//방향키 중 한개라도 눌러져 있으면 도형이동 인터벌을 실행한다.
		if(svgController.processInterval === null){
			var result = keyState.left || keyState.right || keyState.bottom || keyState.top;
			if(result) {
				var interval = svgController.processIntervalFunction;
				svgController.processInterval = setInterval(interval, 10);
			}
		}
	});
	
	document.body.addEventListener("keyup", function(e) {
		var keyCode = e.keyCode;

		//떼어진 키가 방향키라면 svg 이동방향 설정
		if(keyCode === SvgController.keyCode.left) {
			keyState.left = 0;
			if(keyState.right === -1) {
				keyState.right = 1;
			}
		}else if(keyCode === SvgController.keyCode.top) {
			keyState.top = 0;
			if(keyState.bottom === -1) {
				keyState.bottom = 1;
			}
		}else if(keyCode === SvgController.keyCode.right) {
			keyState.right = 0;
			if(keyState.left === -1) {
				keyState.left = 1;
			}
		}else if(keyCode === SvgController.keyCode.bottom) {
			keyState.bottom = 0;
			if(keyState.top === -1) {
				keyState.top = 1;
			}
		}

		//모든 방향키가 눌러져 있지 않는 상황일 경우 도형 인터벌을 종료 한다.
		if(svgController.processInterval !== null){
			var result = keyState.left || keyState.right || keyState.top || keyState.bottom;
			
			if(result == false) {
				clearInterval(svgController.processInterval);
				svgController.processInterval = null;
			}
		}
	});
}
//이동하는 도형을 재선택하는 함수
SvgController.prototype.reSelect = function(node){
	var selected = this.node.querySelector("svg.select");
	if(selected != null) {
		selected.classList.remove("select");
	}
	node.classList.add("select");
}

SvgController.keyCode = {
	left : 37,
	top : 38,
	right : 39,
	bottom : 40,
	delete : 46
}