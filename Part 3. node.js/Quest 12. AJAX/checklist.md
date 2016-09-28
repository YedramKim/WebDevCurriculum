### 어떠한 자바스크립트 코드가 HTTP 응답이나 사용자의 이벤트등에 종속되어 언제 실행되어야 할 지 알기 어려울 때엔 어떻게 해야 할까요?
* AJAX 같은 HTTP 요청이나 이벤트 등의 비동기 함수들은 실행시기를 예측하기 어렵습니다. 그래서 비동기 작업 뒤에 해야할 작업이 있을 경우 따로 함수를 만들어서 실행시키거나 아니면 커스텀 이벤트를 만들어 작업을 하는 편이 좋다고 생각합니다.

* 혹은 최근에 ecmascript 6에 나온 promise 객체를 활용해서 복잡한 비동기 제어 방식을 정리할 수도 있습니다. 

### 브라우저의 `XMLHttpRequest` 객체는 무엇이고 어떻게 동작하나요?
* `XMLHttpRequest` 객체는 사용자가 페이지 이동 없이 데이터를 얻는 ajax 통신을 다루는 객체로 비동기 방식과 동기 방식을 둘다 사용할 수 있습니다.

* 우선 `XMLHttpRequest` 객체는 생성한 다음에 `open` 메서드로 HTTP 메서드(GET, POST) 방식, 접속할 URL, 동기/비동기 방식을 지정한 다음 send()메서드로 ajax 통신을 하면 됩니다.
* 동기 방식으로 이용하는 경우에는 send()메서드 뒤에 `XMLHttpRequest` 객체의 `responseText` 혹은 `responseXML` 프로퍼티를 이용해서 사용하면 되고 동기 방식을 이용하는 경우에는 `XMLHttpRequest` 객체의 `onreadtstatechange`이벤트 에서 데이터를 처리하면 됩니다.

### `fetch` API는 무엇이고 어떻게 동작하나요?
* `fetch` API도 `XMLHttpRequest` 객체와 마찬가지로 AJAX에 쓰이는 API입니다. 이 둘의 차이점은 기존에 비동기 방식으로 쓰인 `XMLHttpRequest` 객체와 달리 `fetch` API는 `Promise`를 기반으로 사용되는 API 입니다.

* 사용방법 예시
```javascript
	fetch('/data.json', { //url, http request 정보 설정
		headers : {
			"Content-Type" : "application/x-www-form-urlencoded"
		},
		method : "post",
		body : "data=name"
	}).then(function(res) {
		if(res.ok) { // 무사히 호출되었으면 true
			return result.json();
		}
	}).then(function(data) { // data : 호출한 JSON 데이터가 온다.
		
	});
```

* 또한 `fetch` API는 `Headers`, `Request`, `Response` 인터페이스가 도입되어 있으며 각각의 인터페이스로 HTTP에 대한 정보를 조작할 수 있습니다.