### 프로토타입 기반의 객체지향 프로그래밍은 무엇일까요?
* prototype은 객체를 생성하기 위해 사용되는 객체의 원형을 뜻하며 생성자를 통해 객체가 생성 될 때 생성자의 prototype 프로퍼티에 링크되어 있는 객체들이 생성된 객체에 연결됩니다.
* 프로토타입 기반의 프로그래밍은 프로토타입을 이용해서 객체를 만들어내고 또한 객체의 원형을 이용해 또 다른 새로운 객체를 만들어 내거나 객체를 확장하는 방식의 프로그래밍 기법입니다.

#### 클래스 기반의 객체지향 프로그래밍과 어떤 점이 다를까요?
* 클래스 기반의 언어의 경우 클래스가 객체를 찍어내는 틀 역할을 합니다. 그렇게 클래스라는 틀로 인스턴스를 만들어 객체를 사용합니다. 하지만 프로토타입 기반의 언어는 프로토타입같은 이미 존재하는 객체를 직접 사용하거나 복사해서 사용합니다.

### 객체의 프로토타입 함수는 무엇일까요?


### JavaScript에서 `private`한 멤버 변수를 구현하려면 어떤 식으로 해야 할까요?
* 자바스크립트의 객체에서는 private가 자체적으로 지원되어 있지 않지만 클로저를 이용해서 비슷하게 구현할 수 있습니다.
생성자 함수에 `private`로 사용할 함수를 `this`가 아닌 var로 선언을 하고 `private` 값을 얻거나 조절할 수 있는 함수를 `this`로 객체의 멤버변수로 선언하면 됩니다.
```javascript
var Object=function(n){
	var number = n;
	this.setnum=function(num){
		number = num;
	}
	this.getnum = function(){
		return number;
	}
};
```
위의 코드처럼 작성하면 number은 자신을 참조하는 함수가 있기에 사라지지 않고 그대로 유지되지만 위의 두 함수 이외에는 접근이 불가능하므로 클래스의 `private`처럼 구현이 가능합니다.

### 자바스크립트에서 클래스간에 상속을 하려면 어떤 식으로 구현해야 할까요?
* 자바스크립트에서 상속을 이용하기 위해서는 자식 객체로 쓸 생성자 함수 내부에 부모 객체의 생성자 함수를 `apply` 혹은 `call`메서드로 호출하여 내용을 부모 객체의 내용을 자식 객체에 상속시킵니다.
* 그리고 부모 객체의 prototype을 자식 객체의 prototype에 넣습니다.
```javascript
//부모 객체
var Parent=function(){
	this.name = "parent";
}
Parent.prototype.name = "object";

//자식 객체
var Child=function(){
	//Parent 생성자 함수를 Child 내부에서 실행. Parent 생성자 함수의 this가 본 객체로 변경
	Parent.apply(this, arguments);
}

//Child의 프로토타입에 Parent의 프로토타입을 넣습니다.
//아래의 코드 처럼 Prototype이란 객체를 따로 만들어 넣은 이유는 Child의 prototype의 멤버변수의 변경 및 추가가 Parent의 prototype에 영향을 미치지 않기 위해서 입니다.
var ChildPrototype = function(){};
ChildPrototype.prototype = Parent.prototype;
Child.prototype = new ChildPrototype();
Child.prototype.age=10;

//추가로 Child의 construct를 Child로 변경합니다.
Child.prototype.constructor=Child;
```