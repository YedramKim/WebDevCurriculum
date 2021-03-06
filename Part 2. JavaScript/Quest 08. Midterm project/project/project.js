//DOM 함수 추가
HTMLElement.prototype.height = function() {
	var pos = this.getBoundingClientRect();
	return pos.bottom - pos.top;
}

//문자열 함수 추가
String.prototype.replaceAll = function(keyword, replace) {
	return this.split(keyword).join(replace);
}

//일본어일 경우 루비태그로 변환시키는 함수
function wordChangeRuby(str){
	var hanzaRegStr = "\u2E80-\u2EFF\u3400-\u4DBF\u4E00-\u9FBF\uF900-\uFAFF\u20000-\u2A6DF\u2F800-\u2FA1F";
	var kanaRegStr = "\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF";
	var japaneseReg = new RegExp("[" + hanzaRegStr + "]+", "gim");
	var rubyReg = new RegExp("[" + hanzaRegStr + "]+\\([" + kanaRegStr + "]+\\)", "gim");

	var match = str.match(rubyReg);

	if(match !== null){
		var length = match.length;
		for(var i = 0; i < length; ++i){
			var tempstr = "</ruby><ruby>" + match[i];
			tempstr = tempstr.replace("(", "<rp>(</rp><rt>").replace(")", "</rt><rp>)</rp></ruby><ruby>");
			str = str.replace(match[i], tempstr);
		}

		str = "<ruby>" + str + "</ruby>";
		str = str.replaceAll("<ruby></ruby>", "");
	}

	return str;
}

//단어장 총괄할 객체
var Vocabulary = function(selector) {
	this.diaryNode = document.querySelector(selector);

	//데이터 저장소
	this.wordList = new Store("word");

	//템플릿들 (밑의 함수에서 초기화)
	this.wordExampleTemplate = null;
	this.wordTemplate = null;

	//단어와 예시문들
	this.words = this.wordList.getData();

	//단어를 표시할 HTML 요소들
	this.wordNodes = [];

	//한글 정규식(단어 추가시 검사용)
	this.koreanReg =/[가-힣ㅂㅈㄷㄱ쇼ㅕㅑㅐㅔㅁㄴㅇㄹ호ㅓㅏㅣㅋㅌㅊ퓨ㅜㅡ]/g;

	//객체 초기화
	this._initialize();
}
//단어장 초기화 함수
Vocabulary.prototype._initialize = function() {
	//템플릿 초기화
	var template = this.diaryNode.querySelector('.template');

	var node = template.querySelector(".exams>li"); //단어 예재 템플릿
	this.wordExampleTemplate = node.cloneNode(true);
	node.parentNode.removeChild(node);

	node = template.querySelector(".wordCard"); //단어 템플릿
	this.wordTemplate = node.cloneNode(true);
	node.parentNode.removeChild(node);

	template.parentNode.removeChild(template);

	var wordTemplate = this.wordTemplate;
	var wExamTemplate = this.wordExampleTemplate;
	var parent = this.diaryNode;
	var length = this.words.length;
	for(var i = 0; i < length; i++){
		var data = this.words[i];
		var word = new Word(wordTemplate, wExamTemplate, data);
		word.template.addEventListener("append", function() {
			parent.appendChild(this);
		});
		word._initialize();

		this.wordNodes[i] = word;
	}

	//이벤트 설정
	this.bindEvents();
}
//단어장 이벤트 설정 함수
Vocabulary.prototype.bindEvents = function(){
	(function(node) {
		//단어 추가 이벤트
		var wordForm = node.diaryNode.querySelector(".wordForm");
		wordForm.addEventListener("submit", wordFormSubmit);
		function wordFormSubmit(e) {
			e.preventDefault();

			//데이터 추출
			var addData = {};
			addData.word = wordForm.querySelector(".wordInput").value.trim();
			addData.mean = wordForm.querySelector(".meanInput").value.trim();
			
			//데이터 검사
			if(addData.word == ""){
				alert("단어를 입력하세요.");
				return false;
			}else if(addData.word.search(node.koreanReg) !== -1){
				alert("단어에는 한글과 특수기호를 넣지 못합니다.");
				return false;
			}else if(addData.mean == ""){
				alert("단어의 뜻을 입력하세요.");
				return false;
			}

			node.wordList.add(addData);
			alert("단어가 무사히 추가되었습니다.");

			var word = new Word(node.wordTemplate, node.wordExampleTemplate, addData);
			word.template.addEventListener("append", function() {
				node.diaryNode.appendChild(this);
			});
			word._initialize();

			node.wordNodes[node.wordNodes.length] = word;
		}
	})(this);
}

//저장소 객체
var Store = function(storeName) {
	this.storeName = storeName; //저장소 이름
	this._store = localStorage.getItem("Hello, " + storeName); //저장소
	
	//저장소 초기화
	this._initialize();
}
//저장소를 초기화
Store.prototype._initialize = function() {
	//저장소 초기화
	if(this._store == null){
		this._store = {};
		this._store.autoIncrement = 0; // 데이터를 삽입할 때 쓸 idx 번호
		this._store.database = []; //데이터 목록
	}else{
		this._store = JSON.parse(this._store);
	}
}
//저장소에 데이터를 삽입
Store.prototype.add = function(data) {
	this.reload();
	var insert_idx = this._store.database.length;
	data.idx = this._store.autoIncrement++;
	this._store.database[insert_idx] = data;

	//데이터를 변경
	this.modify();

	return data;
}
//삭제 하는 함수 조건을 검사하기 위해 함수를 넣거나 삭제해야 할 인덱스 번호 삽입
Store.prototype.remove = function(idx) {
	this.reload();
	var length = this._store.database.length;
	for(var i = 0; i < length; i++){
		var data = this._store.database[i];
		if(data.idx === idx){
			this._store.database.splice(i, 1);
			break;
		}
	}

	//데이터를 변경
	this.modify();
}
//저장소의 데이터를 변경
Store.prototype.update = function(idx, update){
	this.reload();
	var length = this._store.database.length;
	for(var i = 0; i < length; i++){
		var data = this._store.database[i];
		if(data.idx === idx){
			this._store.database[i] = update;
			break;
		}
	}

	//데이터를 변경
	this.modify();
}
//저장소에서 데이터를 얻음 (함수가 들어가면 함수를 통해 반환할 데이터를 결정)
Store.prototype.getData = function(checkFunc) {
	this.reload();
	var dataList = this._store.database;
	if(typeof checkFunc === "function"){
		var length = dataList.length;
		var returnDatas = [];
		for(var i = 0; i < length; i++){
			var data = dataList[i];
			if(checkFunc(data) === true){
				returnDatas[returnDatas.length] = data;
			}
		}
		return returnDatas;
	}
	return dataList;
}
//로컬스토리지 데이터를 변경하는 함수
Store.prototype.modify = function() {
	var json = JSON.stringify(this._store);
	localStorage.setItem("Hello, " + this.storeName, json);
}
//데이터를 다시 불러오는 함수
Store.prototype.reload = function(){
	this._store = localStorage.getItem("Hello, " + this.storeName); //저장소
	if(this._store == null){
		this._store = {};
		this._store.autoIncrement = 0; // 데이터를 삽입할 때 쓸 idx 번호
		this._store.database = []; //데이터 목록
	}else{
		this._store = JSON.parse(this._store);
	}
}
//데이터를 완전히 초기화하는 함수
Store.prototype.reset = function() {
	this._store.autoIncrement = 0;
	this._store.database = [];
	var json = JSON.stringify(this._store);
	localStorage.setItem("Hello, " + this.storeName, json);
}

//단어 객체
//parent : 자신이 위치할 부모 객체
//tempalte : 자신을 표시할 템플릿
//exampleTemplate : 예시문에 들어갈 템플릿
//data : 자신의 정보
//wordStore : 단어 저장소
//exampleStore : 예시 문장 저장소
var Word = function(template, exampleTemplate, data) {
	this.template = template.cloneNode(true);
	this.exampleTemplate = exampleTemplate.cloneNode(true);
	this.wordStore = new Store("word");
	this.exampleStore = new Store("example");
	this.data = data;
	
	//정규식
	this.japaneseReg = new RegExp("[\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF]", "gim");

	//예시문 객체들
	this.examples = [];
}
//단어 객체 초기화
Word.prototype._initialize = function() {
	//해당 예시들 가져오기
	var chkWord = this.data.word;
	var exampleList = this.exampleStore.getData(getExampleFunc);
	function getExampleFunc(data){
		return data.word == chkWord;
	}

	var length = exampleList.length;
	var parentNode = null;
	var template = null;
	var exampleStore = null;
	if(length){
		parentNode = this.template.querySelector(".exams");
		template = this.exampleTemplate;
		exampleStore = this.exampleStore;
	}
	for(var i = 0; i < length; i++){
		var wordExample = new WordExample(template, exampleList[i]);
		wordExample.template.addEventListener("append", function(){
			parentNode.appendChild(this);
		});
		wordExample._initialize();

		this.examples[i] = wordExample;
	}

	//템플릿 설정
	this.setNode();

	//이벤트 설정
	this.bindEvents();
}
//단어장에 넣을 노드를 만드는 함수
Word.prototype.setNode = function() {
	var word = this.data.word;
	var mean = this.data.mean;

	var template = this.template;

	//일본어인지 검사
	if(word.search(this.japaneseReg) !== -1){
		template.classList.add("jword");
	}else{
		template.classList.add("eword");
	}
	template.querySelector(".word").innerHTML = wordChangeRuby(word);
	template.querySelector(".wordMean").innerHTML = mean;

	if(template.parentNode === null){
		var event = new Event("append");
		template.dispatchEvent(event);
	}
}
//이벤트 설정
Word.prototype.bindEvents = function() {
	(function(node) {
		var template = node.template;

		//이벤트 관련 노드들
		var modifyForm = template.querySelector(".modifyForm"); //수정 폼
		var addExam = template.querySelector(".addExam"); // 예시 추가 버튼
		var examForm = template.querySelector(".examForm"); //예시 작성 폼

		var word = template.querySelector(".word"); // 단어
		var wordMean = template.querySelector(".wordMean"); // 단어

		var wordInput = template.querySelector(".modifyForm .wordInput"); //단어 수정 인풋
		var meanInput = template.querySelector(".modifyForm .meanInput"); //뜻 수정 인풋

		var setBtns = template.querySelector(".setBtns"); //단어 설정 버튼

		var examView = template.querySelector(".examView"); // 예시보기 버튼
		var examArea = template.querySelector(".examArea"); // 예시보기 버튼
		var examClose = template.querySelector(".examClose"); // 예시닫기 버튼

		//단어 수정 폼 표시
		setBtns.querySelector(".modified").addEventListener("click", modifiedFormShow);
		function modifiedFormShow(e){
			template.classList.add("modifyMode");

			wordInput.value = node.data.word;
			meanInput.value = node.data.mean;
		}

		//단어 수정 취소
		template.querySelector(".modifyBtns .cancle").addEventListener("click", modifieCancle);
		function modifieCancle(e){
			template.classList.remove("modifyMode");
		}

		//단어수정 이벤트
		modifyForm.addEventListener("submit", modifySubmit);
		function modifySubmit(e) {
			e.preventDefault();
			var word = wordInput.value.trim();
			var mean = meanInput.value.trim();

			//예시문장들의 자신을 가리키는 단어 변경
			var exampleData = node.exampleStore.getData(searchExample);
			function searchExample(data){
				return node.data.word == data.word;
			}

			var length = exampleData.length;
			for(var i = 0; i < length; i++){
				var data = exampleData[i];
				data.word = word;
				node.exampleStore.update(data.idx, data);
			}

			node.data.word = word;
			node.data.mean = mean;

			node.wordStore.update(node.data.idx, node.data);

			alert("단어가 수정되었습니다.");
			template.classList.remove("modifyMode");

			node.setNode();
		}

		//삭제 버튼 이벤트
		setBtns.querySelector(".remove").addEventListener("click", deleteEvent);
		function deleteEvent(e) {
			if(confirm("해당 단어를 삭제하시겠습니까?") === false){
				return;
			}
			node.wordStore.remove(node.data.idx);

			alert("단어가 삭제되었습니다.");

			template.parentNode.removeChild(template);
		}

		//예시보기 이벤트
		examView.addEventListener("click", exampleViewShow);
		function exampleViewShow(e) {
			template.classList.add("examView");
		}

		//예시닫기 이벤트
		examClose.addEventListener("click", exampleViewHide);
		function exampleViewHide(e) {
			template.classList.remove("examView");
		}

		//예시추가 버튼 이벤트
		addExam.addEventListener("click", function(e) {
			examArea.classList.add("examAdd");
			examForm.querySelector(".wordInput").value = node.data.word;
		});

		examForm.querySelector(".addExamCancle").addEventListener("click", examFormHide);
		function examFormHide(e) {
			examArea.classList.remove("examAdd");
			examForm.querySelector(".wordInput").value = node.data.word;
			examForm.querySelector(".meanInput").value = "";
		}

		//예시추가 이벤트
		examForm.addEventListener("submit", function(e){
			e.preventDefault();

			//데이터 생성
			var addData = {};
			addData.word = node.data.word;
			addData.exam = examForm.querySelector(".wordInput").value.trim();
			addData.mean = examForm.querySelector(".meanInput").value.trim();

			//데이터 검사
			if(addData.word == ""){
				alert("단어를 입력하세요.");
				return false;
			}else if(addData.mean == ""){
				alert("단어의 뜻을 입력하세요.");
				return false;
			}
			node.exampleStore.add(addData);

			//데이터 표시 및 폼 가리기
			var parent = node.template.querySelector(".exams");
			var template = node.exampleTemplate;

			var wordExample = new WordExample(template, addData);
			wordExample.template.addEventListener("append", function(){
				parent.appendChild(this);
			});
			wordExample._initialize();

			node.examples[node.examples.length] = wordExample;
			examArea.classList.remove("examAdd");
		});
	})(this);
}
//일본어 정규식

//단어 예시 객체
var WordExample = function(template, data){
	this.template = template.cloneNode(true);
	this.exampleStore = new Store("example");
	this.data = data;
}
WordExample.prototype._initialize = function() {
	//HTML 요소 설정
	this.setNode();

	//이벤트 설정
	this.bindEvents();
}
//HTML 요소 초기화
WordExample.prototype.setNode = function() {
	var exam = this.data.exam;
	var mean = this.data.mean;

	var template = this.template;

	template.querySelector(".meanModifyForm .examInput").value = exam;
	template.querySelector(".meanModifyForm .meanInput").value = mean;

	template.querySelector(".exam>.word").innerHTML = wordChangeRuby(exam);
	template.querySelector(".exam p").innerHTML = mean;

	//삽입 이벤트 실행
	if(this.template.parentNode === null){
		var event = new Event("append");
		this.template.dispatchEvent(event);
	}
}
//이벤트 설정
WordExample.prototype.bindEvents = function() {
	(function(node) {
		var template = node.template;

		var exam = template.querySelector(".exam"); // 예시 설정 버튼 영역
		var examSetBtns = template.querySelector(".examSetBtns"); // 예시 설정 버튼 영역
		var modifyBtn = examSetBtns.querySelector(".modifyBtn"); //예시 수정 버튼
		var removeBtn = examSetBtns.querySelector(".removeBtn"); //예시 삭제 버튼

		var meanModifyForm = template.querySelector(".meanModifyForm"); //예시 수정 폼
		var examInput = meanModifyForm.querySelector(".examInput"); // 예시 수정 인풋
		var meanInput = meanModifyForm.querySelector(".meanInput"); // 뜻 수정 인풋

		//예시 수정 버튼 이벤트
		modifyBtn.addEventListener("click", meanModifyFormShow);
		function meanModifyFormShow(e) {
			examInput.value = node.data.exam;
			meanInput.value = node.data.mean;

			meanModifyForm.classList.add("show");
		}

		//예시 수정 이벤트
		meanModifyForm.addEventListener("submit", meanModify);
		function meanModify(e) {
			e.preventDefault();

			var examWord = examInput.value;
			var mean = meanInput.value;

			node.data.exam = examWord;
			node.data.mean = mean;

			node.exampleStore.update(node.data.idx, node.data);
			exam.querySelector(".word").innerHTML = wordChangeRuby(examWord);
			exam.querySelector(".examMean p").innerHTML = mean;
			alert("예시가 수정되었습니다.");

			meanModifyFormHide();
		}

		//예시 수정 취소 이벤트
		meanModifyForm.querySelector(".cancle").addEventListener("click", meanModifyFormHide);
		function meanModifyFormHide(e) {
			meanModifyForm.classList.remove("show");
		}

		//예시 삭제 이벤트
		removeBtn.addEventListener("click", examRemove);
		function examRemove(e) {
			if(confirm("해당 해당 예시를 삭제하시겠습니까?") === false){
				return;
			}

			node.exampleStore.remove(node.data.idx);
			alert("예시가 삭제되었습니다.");
			template.parentNode.removeChild(template);
		}
	})(this);
}

var app = new Vocabulary(".voca");