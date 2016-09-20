//DOM 함수 추가
HTMLElement.prototype.width = function() {
	var pos = this.getBoundingClientRect();
	return pos.right - pos.left;
}
HTMLElement.prototype.height = function() {
	var pos = this.getBoundingClientRect();
	return pos.bottom - pos.top;
}

//문자열 함수 추가
String.prototype.replaceAll = function(keyword, replace) {
	return this.split(keyword).join(replace);
}

//단어장 총괄할 객체
var Vocabulary = function(selector) {
	this.diaryNode = document.querySelector(selector);

	//데이터 저장소
	this.wordList = new Store("word");
	this.exampleList = new Store("exmaple");

	//템플릿들 (밑의 함수에서 초기화)
	this.wordExampleTemplate = null;
	this.wordTemplate = null;

	//단어와 예시문들 (밑의 함수에서 초기화)
	this.words = this.wordList.getData();
	this.examples = this.exampleList.getData();

	//단어를 표시할 HTML 요소들
	this.wordNodes = [];

	//한글 정규식(단어 추가시 검사용)
	this.koreanReg =/[가-힣ㅂㅈㄷㄱ쇼ㅕㅑㅐㅔㅁㄴㅇㄹ호ㅓㅏㅣㅋㅌㅊ퓨ㅜㅡ]/g;

	//객체 초기화
	this._initialize();

	//이벤트 설정
	this.bindEvents();

	/*console.log(this.words);
	console.log(this.examples);*/
}
//단어장 초기화 함수
Vocabulary.prototype._initialize = function() {
	//템플릿 초기화
	var node = this.diaryNode.querySelector(".exams>li");
	this.wordExampleTemplate = node.cloneNode(true);
	node.parentNode.removeChild(node);

	node = this.diaryNode.querySelector(".wordCard");
	this.wordTemplate = node.cloneNode(true);
	node.parentNode.removeChild(node);

	var wordTemplate = this.wordTemplate;
	var wExamTemplate = this.wordExampleTemplate;
	var parent = this.diaryNode;
	var length = this.words.length;
	for(var i = 0; i < length; i++){
		var data = this.words[i];
		this.wordNodes[i] = new Word(parent, wordTemplate, wExamTemplate, this.wordList, this.exampleList, data);
	}
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
				alert("단어에는 한글을 넣지 못합니다.");
				return false;
			}else if(addData.mean == ""){
				alert("단어의 뜻을 입력하세요.");
				return false;
			}

			console.log(addData)

			node.wordList.add(addData);
			alert("단어가 무사히 추가되었습니다.");
			node.wordNodes[node.wordNodes.length] = new Word(node.diaryNode, node.wordTemplate, node.wordExampleTemplate, node.wordListStore, addData);
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
	var insert_idx = this._store.database.length;
	data.idx = this._store.autoIncrement++;
	this._store.database[insert_idx] = data;

	//데이터를 다시 적용
	this.reload();

	return data;
}
//삭제 하는 함수 조건을 검사하기 위해 함수를 넣거나 삭제해야 할 인덱스 번호 삽입
Store.prototype.remove = function(idx) {
	var length = this._store.database.length;
	for(var i = 0; i < length; i++){
		var data = this._store.database[i];
		if(data.idx === idx){
			this._store.database.splice(i, 1);
			break;
		}
	}

	//데이터를 다시 적용
	this.reload();
}
//저장소의 데이터를 변경
Store.prototype.update = function(idx, data){
	var length = this._store.database.length;
	for(var i = 0; i < length; i++){
		var data = this._store.database[i];
		if(data.idx === idx){
			console.log('update')
			this._store.database[i] = data;
			break;
		}
	}

	//데이터를 다시 적용
	this.reload();
}
//저장소에서 데이터를 얻음 (함수가 들어가면 함수를 통해 반환할 데이터를 결정)
Store.prototype.getData = function(checkFunc) {
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
//데이터를 다시 적용하는 함수
Store.prototype.reload = function() {
	console.log(this._store);
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
var Word = function(parent, template, exampleTemplate, wordStore, exampleStore, data) {
	this.parent = parent;
	this.template = template.cloneNode(true);
	this.exampleTemplate = exampleTemplate.cloneNode(true);
	this.wordStore = wordStore;
	this.exampleStore = exampleStore;
	this.data = data;

	//예시문 객체들
	this.examples = [];

	//객체 설정
	this._initialize();

	//템플릿 설정
	this.setNode();

	//이벤트 설정
	this.bindEvents();
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
		parentNode = this.template.querySelector('.exams');
		template = this.exampleTemplate;
		exampleStore = this.exampleStore;
	}
	for(var i = 0; i < length; i++){
		this.examples[i] = new WordExample(parentNode, template, exampleStore, exampleList[i]);
	}
}
//단어장에 넣을 노드를 만드는 함수
Word.prototype.setNode = function() {
	var word = this.data.word;
	var mean = this.data.mean;

	var template = this.template;

	template.querySelector('.modifyForm .wordInput').value = word;
	template.querySelector('.modifyForm .meanInput').value = mean;

	//일본어인지 검사
	if(word.search(Word.japaneseReg) !== -1){
		word = "<ruby>" + word.replaceAll("(", "<rp>(</rp><rt>").replaceAll(")", "</rt><rp>)</rp></ruby><ruby>") + "</ruby>";
		word = word.replace("<ruby></ruby>", "");
	}
	template.querySelector('.word').innerHTML = word;
	template.querySelector('.wordMean').innerHTML = mean;

	if(template.parentNode === null){
		this.parent.appendChild(template);
	}
}
//이벤트 설정
Word.prototype.bindEvents = function() {
	(function(node) {
		var template = node.template;
		var modifyForm = template.querySelector('.modifyForm');
		var examForm = template.querySelector('.examForm');

		//단어 수정 폼 표시
		template.querySelector('.setBtns .modified').addEventListener('click', modifiedFormShow);
		function modifiedFormShow(e){
			this.parentNode.style.display = "none";
			template.querySelector('.word').style.display = "none";
			template.querySelector('.wordMean').style.display = "none";

			modifyForm.style.display = "block";
		}

		//단어 수정 취소
		template.querySelector('.modifyBtns .cancle').addEventListener('click', modifieCancle);
		function modifieCancle(e){
			template.querySelector('.setBtns').style.display = "block";
			template.querySelector('.word').style.display = "block";
			template.querySelector('.wordMean').style.display = "block";

			modifyForm.style.display = "none";
		}

		//단어수정 이벤트
		modifyForm.addEventListener("submit", modifySubmit);
		function modifySubmit(e) {
			e.preventDefault();

			node.data.word = this.querySelector(".wordInput").value.trim();
			node.data.mean = this.querySelector(".meanInput").value.trim();

			node.wordStore.update(node.data.idx, node);

			alert("단어가 수정되었습니다.");
			this.style.display = "none";
			template.querySelector('.setBtns').style.display = "block";
			template.querySelector('.word').style.display = "block";
			template.querySelector('.wordMean').style.display = "block";

			node.setNode();
		}

		//삭제 버튼 이벤트
		template.querySelector('.setBtns .remove').addEventListener('click', deleteEvent);
		function deleteEvent(e) {
			node.wordStore.remove(node.data.idx);

			alert("단어가 삭제되었습니다.");

			template.parentNode.removeChild(template);
		}

		//예시추가 버튼 이벤트
		var addExam = template.querySelector('.addExam');
		addExam.addEventListener('click', function(e) {
			this.style.display = "none";

			//예시추가 폼 표시
			examForm.style.display = "block";
			examForm.querySelector(".wordInput").value = node.data.word;
		});

		examForm.addEventListener('submit', function(e){
			e.preventDefault();

			var addData = {};
			addData.word = node.data.word;
			addData.exam = this.querySelector(".wordInput").value.trim();
			addData.mean = this.querySelector(".meanInput").value.trim();

			//데이터 검사
			if(addData.word == ""){
				alert("단어를 입력하세요.");
				return false;
			}else if(addData.mean == ""){
				alert("단어의 뜻을 입력하세요.");
				return false;
			}
			node.exampleStore.add(addData);

			var parent = node.template.querySelector('.exams');
			var template = node.exampleTemplate;
			var exampleStore = node.exampleStore;
			node.examples[node.examples.length] = new WordExample(parent, template, exampleStore, addData);
			addExam.style.display = "block";
			this.style.display = "none";

		});
	})(this);
}
//일본어 정규식
Word.japaneseReg = new RegExp("[\u3040-\u309F\u30A0-\u30FF\u31F0-\u31FF]");

//단어 예시 객체
var WordExample = function(parent, template, exampleStore, data){
	this.parent = parent;
	this.template = template.cloneNode(true);
	this.exampleStore = exampleStore;
	this.data = data;

	//객체 초기화
	this._initialize();

	//HTML 요소 설정
	this.setNode();

	//이벤트 설정
	this.bindEvents();

}
WordExample.prototype._initialize = function() {
	console.log(this.data)
}
WordExample.prototype.setNode = function() {
	var exam = this.data.exam;
	var mean = this.data.mean;

	var template = this.template;

	template.querySelector('.meanModifyForm .examInput').value = exam;
	template.querySelector('.meanModifyForm .meanInput').value = mean;

	//일본어인지 검사
	if(exam.search(Word.japaneseReg) !== -1){
		exam = "<ruby>" + exam.replaceAll("(", "<rp>(</rp><rt>").replaceAll(")", "</rt><rp>)</rp></ruby><ruby>") + "</ruby>";
		exam = exam.replace("<ruby></ruby>", "");
	}
	template.querySelector('.exam>.word').innerHTML = exam;
	template.querySelector('.exam p').innerHTML = mean;

	if(template.parentNode === null){
		this.parent.appendChild(template);
	}
}
WordExample.prototype.bindEvents = function() {
	
}

var app = new Vocabulary(".voca");