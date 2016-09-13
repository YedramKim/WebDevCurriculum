//selector : 배경화면으로 사용할 html 요소의 선택자
var Desktop = function(selector, createIcon = 1, createFolder = 2) {
	/* TODO: Desktop 클래스는 어떤 멤버함수와 멤버변수를 가져야 할까요? */
	this.node = null; // section.desktop의 DOM
	this.icons = []; // 폴더와 일반 아이콘의 모음
};
//객체에 있는 폴더와 일반 아이콘을 보여주는 함수
Desktop.prototype.displayIcon = function() {

}

var Icon = function(name) {
	/* TODO: Icon 클래스는 어떤 멤버함수와 멤버변수를 가져야 할까요? */
	this.name = name; // 아이콘의 이름
	this.displayIconDom = null; //아이콘을 데스크톱에 표시할 HTML dom
	this.iconImage = null; //아이콘의 이미지 dom
	this.iconText = null; //아이콘의 제목 이미지
	this.drag = false; //지금 아이콘의 드래그 이동이 가능한 상태인지 확인하는 변수


	/* 드래그 이벤트 관련 변수 */
	this.firstPointX=0; //최초로 마우스를 클릭했을 때 마우스의 X좌표
	this.firstPointY=0; //최초로 마우스를 클릭했을 때 마우스의 Y좌표

	/* 드래그 이벤트 세팅 관련 함수 */
	//아이콘을 클릭했을시의 이벤트 클릭했을 시 this.drag가 true가 된다.
	function iconMouseDown() {}
	//아이콘을 드래그시키게 하는 이벤트 함수 this.drag가 false 이면 실행되지 않는다.
	function iconMouseMove() {}
	//아이콘에서 마우스를 때면 발생하는 이벤트 this.drag가 false가 된다.

};

var Folder = function(name, contents) {
	/* TODO: Folder 클래스는 어떤 멤버함수와 멤버변수를 가져야 할까요? */
	Icon.apply(this, arguments);
	this.windowContents = contents; // 폴더의 창에 표시할 내용
	this.folderWindow = null; // 해당 폴더의 창 객체

	/* 폴더를 더블클릭했을 때 창을 여는 버튼 */
	function FolderDblclick() {}

};
//Folder는 Icon 객체를 상속합니다. 아래는 Folder 객체의 prototype에 Icon 객체의 prototype을 상속시키는 과정입니다.
function FolderPrototype() {}
FolderPrototype.prototype = Icon.prototype;
Folder.prototype = new FolderPrototype();
Folder.prototype.constructor = Folder;

var Window = function(title, content) {
	/* TODO: Window 클래스는 어떤 멤버함수와 멤버변수를 가져야 할까요? */
	this.title=title; // 폴더의 창의 타이틀 
	this.content=content; // 폴더의 창의 내용
	this.windowDom = null; //폴더의 창을 구현한 DOM
	this.windowHeader = null; // 폴더의 창의 헤더부분 DOM
	this.windowContent = null; // 폴더의 창의 컨텐츠부분 DOM

	/* 드래그 이벤트 관련 변수 */
	this.firstPointX=0; //최초로 마우스를 클릭했을 때 마우스의 X좌표
	this.firstPointY=0; //최초로 마우스를 클릭했을 때 마우스의 Y좌표

	/* 드래그 이벤트 세팅 관련 함수 */
	//아이콘을 클릭했을시의 이벤트 클릭했을 시 this.drag가 true가 된다.
	function iconMouseDown() {}
	//아이콘을 드래그시키게 하는 이벤트 함수 this.drag가 false 이면 실행되지 않는다.
	function iconMouseMove() {}
	//아이콘에서 마우스를 때면 발생하는 이벤트 this.drag가 false가 된다.
};
