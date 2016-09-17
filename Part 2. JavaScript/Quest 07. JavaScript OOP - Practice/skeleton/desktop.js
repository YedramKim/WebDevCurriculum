//selector : 배경화면으로 사용할 html 요소의 선택자
var Desktop = function(selector, iconNum = 1, folderNum = 2) {
	/* TODO: Desktop 클래스는 어떤 멤버함수와 멤버변수를 가져야 할까요? */
	// section.desktop의 DOM
	// 이후 Folder 객체, Window 객체 생성에 사용됨
	this.desktopDom = document.querySelector(selector); 
	this.icons = []; // 폴더와 일반 아이콘의 모음

	//데스크톱에 폴더와 파일들을 추가합니다.

	for(var i = 1; i <= iconNum; i++) {
		var icon = new Icon("아이콘" + i);
		this.icons.push(icon);
	}

	for(var i = 1; i <= folderNum; i++) {
		var folder = new Folder("폴더" + i, this.desktopDom);
		//폴더 내부에 아이콘 추가
		for(var j = 1; j <= i; j++) {
			folder.addIcon("폴더" + i + " - 아이콘" + j);
		}
		this.icons.push(folder);
	}

	//아이콘의 크기와 모양의 정보를 보관한 변수들
	this.desktopStyle = document.createElement('style'); // 아이콘의 스타일이 변경될 경우 적용시킬 style 태그
	this.iconWidth = 120; //아이콘 이미지 공간의 넓이
	this.iconHeight = 100; //아이콘 이미지 공간의 높이
	this.iconImage = './file.png'; // 아이콘 이미지
	this.folderImage = './folder.png'; // 폴더 이미지

	//데스크톱에 폴더와 파일을 출력합니다.
	this.displayIcons();
};
//객체에 있는 폴더와 일반 아이콘을 보여주는 함수
Desktop.prototype.displayIcons = function() {
	this.desktopDom.innerHTML="";
	var length = this.icons.length;
	for(var i = 0; i < length; i++) {
		this.desktopDom.appendChild(this.icons[i].displayIconDom);
	}
}

//해당 데스크톱 HTML 요소의 ID와 class를 css셀렉터 방식으로 반환하는 함수 (이번 장에서 새로 추가한 부분)
Desktop.prototype.getSelector = function() {
	var style = "";
	var id = this.desktopDom.id.trim();
	var className = this.desktopDom.className.trim();

	if(id != "") {
		style += "#" + id;
	}

	if(className != "") {
		style += "." + className.split(" ").join('.');
	}
	return style;
}

//일반 아이콘 이미지를 변경하는 함수
Desktop.prototype.setIconImage = function(iconImage) {
	this.iconImage = iconImage;
	this.setIconStyle();
}

//폴더 아이콘 이미지를 변경하는 함수
Desktop.prototype.setFolderImage = function(folderImage) {
	this.folderImage = folderImage;
	this.setIconStyle();
}

//일반 아이콘, 폴더 아이콘의 이미지의 크기를 변경하는 함수 (변수를 한개만 넣었을 경우 높이도 width랑 동일한 크기가 된다.)
Desktop.prototype.setIconSize = function(width, height = width){
	this.iconWidth = width;
	this.iconHeight = height;
	this.setIconStyle();
}

//아이콘의 css 규칙을 다시 설정하는 함수
Desktop.prototype.setIconStyle = function(){
	var selector = this.getSelector(); //자기 자신의 데스크톱만 적용이 될 수 있도록 따로 id와 class가 결합된 선택자를 받아온다. 
	var style = ""; //style 태그에 넣을 css 규칙
	style += selector + " .icon > .iconImage, " + selector + " .folder > .iconImage{ width :" + this.iconWidth + "px; height :" + this.iconHeight + "px; }\n";
	style += selector + " .icon > .iconImage{ background-image :url(" + this.iconImage +"); }\n" ;
	style += selector + " .folder > .iconImage{ background-image :url(" + this.folderImage +"); }\n" ;
	this.desktopStyle.innerHTML = style;

	if(this.desktopStyle.parentNode === null){
		document.head.appendChild(this.desktopStyle);
	}
}

var Icon = function(name) {
	/* TODO: Icon 클래스는 어떤 멤버함수와 멤버변수를 가져야 할까요? */
	this.name = name; // 아이콘의 이름

	//아이콘을 데스크톱에 표시할 HTML dom
	this.displayIconDom = document.createElement("div");
	this.displayIconDom.classList.add("icon");
	this.displayIconDom.setAttribute("title", name);

	//아이콘의 이미지 dom
	this.iconImage = document.createElement("div");
	this.iconImage.classList.add("iconImage");
	this.displayIconDom.appendChild(this.iconImage);

	//아이콘의 제목 이미지
	this.iconText = document.createElement("p");
	this.iconText.innerHTML=name;
	this.displayIconDom.appendChild(this.iconText);

	//폴더 hover 이벤트 (이번 장에서 새로 추가한 부분)
	(function(node) {
		node.displayIconDom.addEventListener("mouseenter", iconMouseEnter);
		function iconMouseEnter(e) {
			node.displayIconDom.classList.add("hover");
		}
		node.displayIconDom.addEventListener("mouseleave", iconMouseLeave);
		function iconMouseLeave(e) {
			node.displayIconDom.classList.remove("hover");
		}
	})(this);

	/* 드래그 이벤트 관련 변수 */
	this.drag = false; //지금 아이콘의 드래그 이동이 가능한 상태인지 확인하는 변수
	var firstPointX = 0; //최초로 마우스를 클릭했을 때 마우스의 X좌표
	var firstPointY = 0; //최초로 마우스를 클릭했을 때 마우스의 Y좌표
	var currentPosX = 0; //마우스를 이동했을 때의 X좌표
	var currentPosY = 0; //마우스를 이동했을 때의 Y좌표
	this.posX = 0; // Icon의 X좌표(position:relative)
	this.posY = 0; // Icon의 Y좌표(position:relative)

	/* 드래그 이벤트 세팅 관련 함수 */
	//아이콘을 클릭했을시의 이벤트 클릭했을 시 this.drag가 true가 된다.
	(function(node) {
		node.displayIconDom.addEventListener("mousedown", iconMouseDown);
		function iconMouseDown(e) {
			node.displayIconDom.classList.add("drag");

			firstPointX = e.pageX;
			firstPointY = e.pageY;
			node.drag = true;
		}
		//아이콘을 드래그시키게 하는 이벤트 함수 this.drag가 false 이면 실행되지 않는다.
		document.body.addEventListener("mousemove", iconMouseMove);
		function iconMouseMove(e) {
			e.preventDefault();
			if(node.drag == false){
				return;
			}

			//마우스가 영역 밖으로 나갔을 경우 이벤트가 발동이 되지 않도록 함
			//부모 HTML 요소의 위치
			var parentPosition = node.displayIconDom.parentNode.getBoundingClientRect();
			if(e.pageX < parentPosition.left) {
				return;
			}else if(parentPosition.right < e.pageX) {
				return;
			}else if(e.pageY < parentPosition.top) {
				return;
			}else if(parentPosition.bottom < e.pageY) {
				return;
			}

			//왼쪽 마우스가 눌러져 있는 상태에서만 작동이 되도록 함
			if(e.which == 1 && e.button == 0) {
				currentPosX = node.posX + e.pageX - firstPointX;
				currentPosY = node.posY + e.pageY - firstPointY;

				node.displayIconDom.style.left = currentPosX + "px";
				node.displayIconDom.style.top = currentPosY + "px";
			}else{
				node.displayIconDom.classList.remove("drag");

				node.posX = currentPosX;
				node.posY = currentPosY;
				node.drag = false;
			}
		}
		//아이콘에서 마우스를 때면 발생하는 이벤트 this.drag가 false가 된다.
		document.body.addEventListener("mouseup", iconMouseUp);
		function iconMouseUp(e) {
			node.displayIconDom.classList.remove("drag");

			node.posX = currentPosX;
			node.posY = currentPosY;
			node.drag = false;
		}
	})(this);

};

var Folder = function(name, desktop) {
	/* TODO: Folder 클래스는 어떤 멤버함수와 멤버변수를 가져야 할까요? */
	Icon.apply(this, arguments);

	//Icon에서의 일부 내용 변경
	this.displayIconDom.classList.remove("icon");
	this.displayIconDom.classList.add("folder");

	// 해당 폴더의 창 객체
	this.icons = []; //폴더에 넣을 아이콘들
	this.folderWindow = null;

	/* 폴더를 더블클릭했을 때 창을 여는 버튼 */
	(function(node) {
		node.displayIconDom.addEventListener("dblclick", FolderDblclick);
		function FolderDblclick(e) {
			if(node.folderWindow === null) {
				node.folderWindow = new Window(desktop, name, node.icons);
			}
			node.folderWindow.showWindow();
		}
	})(this);
};
//Folder는 Icon 객체를 상속합니다. 아래는 Folder 객체의 prototype에 Icon 객체의 prototype을 상속시키는 과정입니다.
function FolderPrototype() {}
FolderPrototype.prototype = Icon.prototype;
Folder.prototype = new FolderPrototype();
Folder.prototype.constructor = Folder;

//아이콘을 추가하는 함수 (이번 장에서 새로 추가한 함수)
Folder.prototype.addIcon = function(name) {
	var icon=new Icon(name);
	this.icons.push(icon);
	return this;
}

var Window = function(desktop, title, icons) {
	/* TODO: Window 클래스는 어떤 멤버함수와 멤버변수를 가져야 할까요? */
	this.desktop = desktop;
	this.title = title; // 폴더의 창의 타이틀 
	this.icons = icons; // 폴더의 창의 아이콘들

	//폴더의 창을 구현한 DOM
	this.winNum = Window.winNum++;
	this.windowDom = document.createElement("div");
	this.windowDom.classList.add("window");
	(function(node) {
		node.windowDom.addEventListener("mousedown", function(e) {
			node.windowDom.style.zIndex=Window.zIndex++;
		});
	})(this);

	//지금 창이 열려있는 상태인지 확인하는 변수
	this.show = false;

	// 폴더의 창의 헤더부분 DOM
	this.windowHeader = document.createElement("div");
	this.windowHeader.classList.add("windowHeader");

	//닫기 버튼
	var closeButton = document.createElement("button");
	closeButton.innerHTML = "X";
	this.windowHeader.appendChild(closeButton);

	this.windowHeader.innerHTML += "<p>"+title+"</p>";
	this.windowDom.appendChild(this.windowHeader);

	//닫기버튼 클릭 이벤트
	//button 태그에 click 이벤트가 직접 먹히지 않아 부모 태그에서 이벤트를 실행시키도록 했습니다.
	(function(node) {
		node.windowHeader.addEventListener("click", closeButtonClick);
		function closeButtonClick(e) {
			if(e.target.tagName == "BUTTON") {
				node.windowDom.style.display = "none";
				node.show = false;
			}
		}
	})(this);

	// 폴더의 창의 컨텐츠부분 DOM
	this.windowContent = document.createElement("div");
	this.windowContent.classList.add("windowContent");
	this.windowDom.appendChild(this.windowContent);

	//창에 저장해 놓은 아이콘을 저장
	var length = this.icons.length;
	for(var i = 0; i < length; i++) {
		this.windowContent.appendChild(icons[i].displayIconDom);
	}

	/* 드래그 이벤트 관련 변수 */
	this.drag = false; //지금 아이콘의 드래그 이동이 가능한 상태인지 확인하는 변수
	var firstPointX = 0; //최초로 마우스를 클릭했을 때 마우스의 X좌표
	var firstPointY = 0; //최초로 마우스를 클릭했을 때 마우스의 Y좌표
	var currentPosX = 0; //마우스를 이동했을 때의 X좌표
	var currentPosY = 0; //마우스를 이동했을 때의 Y좌표
	this.posX = this.winNum * 10; // Icon의 X좌표(position:relative)
	this.posY = this.winNum * 10; // Icon의 Y좌표(position:relative)

	/* 드래그 이벤트 세팅 관련 함수 */
	//아이콘을 클릭했을시의 이벤트 클릭했을 시 this.drag가 true가 된다.
	(function(node) {
		node.windowHeader.addEventListener("mousedown", windowMouseDown);
		function windowMouseDown(e) {
			node.windowDom.classList.add("drag");

			firstPointX = e.pageX;
			firstPointY = e.pageY;
			node.drag = true;
		}
		//아이콘을 드래그시키게 하는 이벤트 함수 this.drag가 false 이면 실행되지 않는다.
		document.body.addEventListener("mousemove", windowMouseMove);
		function windowMouseMove(e) {
			e.preventDefault();
			if(node.drag == false) { return; }

			//마우스가 영역 밖으로 나갔을 경우 이벤트가 발동이 되지 않도록 함
			//부모 HTML 요소의 위치
			var parentPosition = node.windowDom.parentNode.getBoundingClientRect();
			if(e.pageX < parentPosition.left) {
				return;
			}else if(parentPosition.right < e.pageX) {
				return;
			}else if(e.pageY < parentPosition.top) {
				return;
			}else if(parentPosition.bottom < e.pageY) {
				return;
			}

			//왼쪽 마우스가 눌러져 있는 상태에서만 작동이 되도록 함
			if(e.which == 1 && e.button == 0) {
				currentPosX = node.posX + e.pageX - firstPointX;
				currentPosY = node.posY + e.pageY - firstPointY;

				node.windowDom.style.left = currentPosX + "px";
				node.windowDom.style.top = currentPosY + "px";
			}else{
				node.windowDom.classList.remove("drag");

				node.posX = currentPosX;
				node.posY = currentPosY;
				node.drag = false;
			}
		}
		//아이콘에서 마우스를 때면 발생하는 이벤트 this.drag가 false가 된다.
		document.body.addEventListener("mouseup", windowMouseUp);
		function windowMouseUp(e) {
			node.windowDom.classList.remove("drag");

			node.posX = currentPosX;
			node.posY = currentPosY;
			node.drag = false;
		}
	})(this);
};
//Window 객체로 구현한 DOM 에 넣을 zindex값 쓸 때마다 1씩 올라간다 (이번 장에서 새로 추가한 부분)
Window.zIndex=10000;

//Window 객체에 넣은 Window의 일련번호
Window.winNum=1;

//Window 객체를 화면에 출력하는 함수
Window.prototype.showWindow = function() {
	if(this.show === false) {
		this.windowDom.style = "block";

		this.show = true;
		if(this.windowDom.parentNode === null) {
			this.desktop.appendChild(this.windowDom);
		}

		//창이 맨 위에 표시되도록 함.
		this.windowDom.style.zIndex=Window.zIndex++;

		this.windowDom.style.left = this.posX + "px";
		this.windowDom.style.top = this.posY + "px";
	}else{
		this.windowDom.style.zIndex=Window.zIndex++;
	}
}