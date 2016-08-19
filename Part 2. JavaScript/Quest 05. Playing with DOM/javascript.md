### 자바스크립트를 통해 DOM 객체에 CSS Class를 주거나 없애려면 어떻게 해야 하나요?
* 자바스크립트의 DOM 객체는 `classList`라는 객체를 가지고 있는데, 그 객체의 `add`메서드를 이용해서 클래스를 추가하거나 `remove`메서드를 이용해서 클래스를 삭제, 그리고 `toggle`메서드를 이용해서 특정 클래스를 추가했다, 삭제했다를 반복할 수 있습니다.

#### IE9나 그 이전의 옛날 브라우저들에서는 어떻게 해야 하나요?
* 예전 브라우저에서는 DOM 객체의 class를 `className`이라는 문자열 객체로 class를 주거나 없앴습니다.
제가 생각한 방법은 이렇습니다.

 * class 추가하기
 ```javascript
 DOM.className+=' class';
 ```

 * class 삭제하기
 ```javascript
 DOM.className=DOM.className.replace('class', '');
 ```

### 자바스크립트의 Closure는 무엇이며, 어떤 식으로 활용할 수 있나요?
* 클로저는 특정 함수 내에 정의된 지역 변수를 외부에서도 참조 할 수 있게 하는 것(함수)을 말합니다. <br>
보통 함수 내에서 선언된 지역변수는 함수가 종료 되면 저절로 사라지지만 외부에서 참조 할 수 있는 함수를 만들면 그 지역 변수는 사라지지 않고 계속 유지가 됩니다.
 * 클로저 사용 예시
 ```javascript
 function stackClosure(n){
 	var num=n;
 	return function(add){
 		num+=add;
 		console.log(num);
 	}
 }

 //stackClosure를 실행하면 매개변수값을 내부의 num이란 변수에 대입하게 되는데,
 //반환값으로 매개변수만큼 내부의 num을 증가시키고 console창에 출력하는 함수를 반환합니다.
 var stack=stackClosure(10); 
 stack(5); //num값이 15가 되고 console창에 15가 출력 
 stack(6); //num값이 21가 되고 console창에 21이 출력 
 ```

* 클로저를 이용해 객체를 만들면 그 객체 안의 변수나 객체를 잘못 건드리거나 하는 사태를 미연에 방지할 수도 있습니다. 