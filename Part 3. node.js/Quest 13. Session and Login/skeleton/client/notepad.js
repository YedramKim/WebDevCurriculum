//자신이 부모 노드에서 몇번째 인지 알아보는 함수
HTMLElement.prototype.getIndex = function() {
	var siblings = this.parentNode.children;
	var length = siblings.length;
	for(var i = 0; i < length; i++) {
		if(siblings[i] == this) {
			return i;
		}
	}
}

//메모장 객체
var Notepad = function(selector) {
	/* TODO: 그 외에 또 어떤 클래스와 메소드가 정의되어야 할까요? */
	this.node = document.querySelector(selector); // 메모장 HTML 요소

	// 메모장 리스트(HTML ul)
	this.fileList = document.createElement("ul");

	//메모 편집기 리스트(HTML ul)
	this.fileEditorList = document.createElement("ul");

	//메모 생성 버튼
	this.lastlist = document.createElement("li");
	this.createNoteButton = document.createElement("button");

	this.files = null // 메모장 리스트(ajax로 불러오기, _initialize에서 데이터 초기화)

	this._initialize();
};
Notepad.prototype._initialize = function() {
	var notepad = this; // Notepad 객체 자기자신

	// 메모장 리스트(HTML ul)
	this.fileList.classList.add("filetab");
	this.fileList.classList.add("list");
	this.node.appendChild(this.fileList);

	//메모 편집기 리스트(HTML ul)
	this.fileEditorList.classList.add("noteEditors");
	this.node.appendChild(this.fileEditorList);

	//메모 생성 버튼
	this.lastlist.classList.add("createNote");
	this.createNoteButton.innerHTML = "<span class='octicons octicon-plus'></span>파일 생성";
	this.lastlist.appendChild(this.createNoteButton);

	//메모장 리스트 가져오기
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "/note", true);
	xhr.onreadystatechange = function(e) {
		if(this.readyState === 4 && this.status == 200){
			var data = JSON.parse(this.responseText);
			notepad.files = data;
			notepad.start();
			notepad.bindEvent();
		}
	}
	xhr.send();
}
//메모장 실행 함수
Notepad.prototype.start = function() {
	var notepad = this;
	//파일 버튼 삽입에 쓸 이벤트 함수
	function buttonAppendEvent(e) {
		notepad.fileList.appendChild(this); // 파일목록에 파일 부르기 버튼 삽입
	}
	//파일 편집기 삽입에 쓸 이벤트 함수
	function editorAppendEvent(e) {
		notepad.fileEditorList.appendChild(this);
	}

	//메모장 목록 생성
	var length = this.files.length;
	for(var i = 0; i < length; i++) {
		var note = new Note(this.files[i]);
		note.loadDom.addEventListener("append", buttonAppendEvent);
		note.noteEditor.addEventListener("append", editorAppendEvent);
		note._initialize();
		this.files[i] = note;
	}
	notepad.fileList.appendChild(notepad.lastlist);
}
//메모장 관련 이벤트 설정
Notepad.prototype.bindEvent = function() {
	//새 파일 생성
	var notepad = this;

	notepad.createNoteButton.addEventListener("click", createNote);
	function createNote(e) {
		//제목 입력
		var title = prompt("생성할 파일의 이름을 입력하세요.\n(참고로 생성한 파일은 저장하지 않고 사이트를 나가면 사라집니다.)");
		if(title === null) {
			return ;
		}

		title = title.trim();
		if(title === "") {
			alert("제목을 입력하세요.")
			return;
		}

		//파일 버튼 삽입에 쓸 이벤트 함수
		function buttonAppendEvent(e) {
			notepad.fileList.appendChild(this); // 파일목록에 파일 부르기 버튼 삽입
		}
		//파일 편집기 삽입에 쓸 이벤트 함수
		function editorAppendEvent(e) {
			notepad.fileEditorList.appendChild(this);
		}

		//파일 생성
		var data = {
			title : title,
			content : ""
		};
		var note = new Note(data);

		note.loadDom.addEventListener("append", buttonAppendEvent);
		note.noteEditor.addEventListener("append", editorAppendEvent);
		note._initialize();
		note.showEditor();
		notepad.files.push(note);

		//파일 생성 버튼을 다시 맨뒤에 놓음
		notepad.fileList.appendChild(notepad.lastlist);
	}

	//탭으로 메모 전환
	document.body.addEventListener("keydown", function(e) {
		//누른 키가 탭일 경우
		if(e.which == 9 && e.key.toLowerCase() == "tab") {
			e.preventDefault();
			var noteNum = notepad.files.length;
			
			//메모 파일이 없을 경우 종료
			if(noteNum === 0) {
				return ;
			}

			var current = notepad.fileList.querySelector(".select");
			var clickEventTrigger = new Event("click");
			if(current !== null) {
				//쉬프트 키가 눌려져 있을 경우
				if(this.shiftPress) {
					var idx = current.getIndex() - 1;
					if(idx < 0) {
						idx = noteNum - 1;
					}
				}else { // 눌려져 있지 않은 경우
					var idx = current.getIndex() + 1;
					if(idx === noteNum) {
						idx = 0;
					}
				}

				notepad.files[idx].loadButton.dispatchEvent(clickEventTrigger);
			}else {
				//쉬프트 키가 눌려져 있을 경우 맨 마지막을 연다.
				if(this.shiftPress) {
					notepad.files[noteNum - 1].loadButton.dispatchEvent(clickEventTrigger);
				}else{
					notepad.files[0].loadButton.dispatchEvent(clickEventTrigger);
				}
			}
		}

		//누른 키가 쉬프트일 경우
		if(e.which == 16 && e.key.toLowerCase() == "shift") {
			this.shiftPress = true;
		}
	});

	document.body.addEventListener("keyup", function(e) {
		//쉬프트키를 땠을 경우
		if(e.which == 16 && e.key.toLowerCase() == "shift") {
			this.shiftPress = false;
		}
	});
}

//메모장 파일(처음에는 제목만 받고 클릭이벤트를 받으면 내용을 로드한다.
var Note = function(data) {
	this.data = data; //메모 데이터

	// 더블클릭하면 내용을 로드하는 버튼
	this.loadDom = document.createElement("li");
	this.loadButton = document.createElement("button");

	//메모장 편집기
	this.noteEditor = document.createElement("li");
	this.noteTextarea = document.createElement("textarea");

	this.saveButton = document.createElement("button");
}
Note.prototype._initialize = function() {
	this.loadButton.setAttribute("title", this.data.title);
	this.loadDom.appendChild(this.loadButton);
	this.loadButton.innerHTML ='<span class="octicons octicon-bookmark"></span>' + this.data.title + '&nbsp;(open)';	

	this.noteEditor.appendChild(this.noteTextarea);

	this.saveButton.innerHTML = '<span class="octicons octicon-keyboard"></span>저장하기';
	this.noteEditor.appendChild(this.saveButton);

	//메모 파일 추가 이벤트 발생
	var eventTrigger = new Event("append");
	this.loadDom.dispatchEvent(eventTrigger);
	this.noteEditor.dispatchEvent(eventTrigger);

	//이벤트 설정
	this.bindEvent();
}
//이벤트 설정
Note.prototype.bindEvent = function() {
	var note = this;

	//더블클릭 했을 시 데이터가 없으면 파일을 로드한다.
	this.loadButton.addEventListener("click", loadNoteEvent);
	function loadNoteEvent(e) {
		e.preventDefault();
		if(note.data.content === undefined) {
			var xhr = new XMLHttpRequest();
			xhr.open("GET", "/note/load/" + note.data.idx);
			xhr.onreadystatechange = function(e) {
				note.data.content = this.responseText;
				note.noteTextarea.textContent = this.responseText;
				note.showEditor();
			}
			xhr.send();
		}else{
			note.showEditor();
		}
	}

	//메모 저장 및 수정
	this.saveButton.addEventListener("click", noteSave);
	function noteSave() {
		note.data.content = note.noteTextarea.value;

		var data = JSON.stringify(note.data);
		var xhr = new XMLHttpRequest();
		xhr.open("POST", "/note/save", true);
		xhr.onreadystatechange = function(e) {
			if(this.readyState === 4 && this.status === 200) {
				var idx;
				if(note.data.idx === undefined) {
					idx = this.responseText;
				}else{
					idx = note.data.idx;
				}
				idx = parseInt(idx);
				note.data.idx = idx;
			}
		}
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.send(data);
	}
}
//편집기 보여주기
Note.prototype.showEditor = function() {
	var siblings = this.loadDom.parentNode.children;
	var length = siblings.length;
	for(var i = 0; i < length; i++) {
		siblings[i].classList.remove("select");
	}
	this.loadDom.classList.add("select");

	var siblings = this.noteEditor.parentNode.children;
	var length = siblings.length;
	for(var i = 0; i < length; i++) {
		siblings[i].classList.remove("edit");
	}
	this.noteEditor.classList.add("edit");

	this.noteTextarea.focus();
}