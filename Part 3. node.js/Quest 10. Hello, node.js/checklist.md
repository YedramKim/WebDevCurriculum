## node.js는 어떤 식으로 동작하나요?
* node.js는 기존에 많이 쓰이던 동기 방식이 아닌 이벤트를 기반으로 하는 비동기 방식으로 돌아갑니다.
* 파일 출력을 예로 들자면 기존에 동기 방식으로 돌아가던 서버에서는 파일을 받을 때까지 프로그램이 대기한 다음 파일을 받으면 프로그램을 다시 돌리는 방식이지만 node.js는 파일을 받는 함수를 실행하면 실행하자 마자 다음으로 넘어가는 대신 이벤트 기반의 비동기 방식으로 파일을 받아오면 따로 이벤트를 발생시켜 처리하는 방식입니다.

#### require() 함수는 어떻게 쓰는 것인가요?
* node.js는 모듈을 기반으로 기능을 확장하는데 require() 함수는 모듈을 불러오는 함수입니다. 매개변수로는 모듈로 사용할 자바스크립트 파일 혹은 index.js 파일이 들어있는 디렉터리, 혹은 외부 모듈의 이름을 입력합니다. require() 함수를 사용하면 해당 파일의 `module.exports` 객체를 반환합니다.
* require() 함수의 매개변수가 ./나 ../처럼 경로로 시작하지 않고 모듈이름으로 시작하면 기본 모듈이나 확장 모듈을 가져옵니다.
* 매개변수가 ./나 ../로 시작하면 해당 경로를 기준으로 모듈을 찾아서 가져옵니다.

#### module.exports와 exports 변수는 어떻게 다른가요?
* module.exports와 exports 둘 다 동일한 객체를 call by reference 방식으로 참조하고 있습니다. 하지만 require() 함수로 최종적으로 반환되는 것은 module.exports 이므로 exports에 다른 객체를 참조하도록 만들면 exports에 어떤 기능을 추가하거나 변경해도 모듈에는 영향이 없습니다.

## npm이 무엇인가요?
* npm은 node.js 개발에 필요한 모듈을 서버에서 설치받거나 관리를 할 수 있게 도와주는 모듈 관리 도구입니다.

#### npm 패키지를 -g 옵션을 통해 Global로 저장하는 것과 그렇지 않은 것은 어떻게 다른가요?
* 커맨드라인에서 명령어로 사용되는 모듈은 -g 옵션을 통해 Global에 설치하고 그렇지 않고 로컬에 사용하는 모듈은 -g 옵션을 사용하지 않고 설치합니다.