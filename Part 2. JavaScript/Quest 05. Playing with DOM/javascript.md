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