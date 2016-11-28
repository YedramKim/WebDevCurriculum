# 일정표

## 정보

### 회원
* 우선 회원은 google oauth, 가입한 회원으로 로그인 가능.
* 최초로 로그인 시 정보 등록.

### 일정 등록
* 제목, 일정 내용, 일정 날짜(전용 date-picker 생성), 시간, 선택시 사진(1장, 10md 제한)과 지도(<google-map>)로 위치 지정 가능.
* 특정 친구들을 선택하여 일정 등록시 친구들에게 해당 일정을 보여주고 (동시에 웹소켓으로 접속해 있는 친구들에게 알려준다.) 같이 참여를 권유할 수 있다.

### 친구
* 친구 목록과 친구 신청 목록 (삭제 가능)
* 친구 기능(친구와 일정 공유 가능, 추가 요청을 받았을 시 웹소켓을 이용해서 친구의 요청을 확인 가능)

##만드는 태그

### date picker 태그
* date picker를 태그 형식으로 개발 날짜 문자열과 시간(getTime())을 two way binding으로 지정가능 (2016년부터)

### toast alert 태그
* 토스트 형식으로 alert를 태그 링크도 추가 가능(paper-toast 이용)

## 파일 구조
* server.js(여기에서 서버 실행) -> module/express(express 서버 생성) -> googleRouter(google oAuth) | module/sequelize(데이터 베이스), 기타 express 라우트 .js파일
* client : html, css, js, polymer custom element파일
* module : node.js 모듈

## 데이터 베이스 구조
### 회원 테이블(user)
* 회원의 정보를 저장
* site : 회원의 정보 소속(이 사이트의 id이면 local, google이면 google, facebook이면 facebook)
* 회원 테이블은 자기 자신과 N:M 관계(친구)

### 일정 테이블(schedule)
* 일정 관련 정보를 저장
* 제목 : 일정 제목
* 내용 : 일정 내용
* 이미지 : 일정 관련 이미지
* 좌표 : 일정 관련 좌표 (경도, 위도)
* 또한 회원 테이블과 N:M 관계
* 삭제는 주인만 삭제할 수 있게 함.

## 파일

### module
* express.js : express 서버와 관련된 모듈
* friendRouter.js : 친구와 관련된 정보를 처리하는 express 라우터가 들어있는 모듈
* googleRouter.js : google OAuth를 처리하는 express 라우터가 들어있는 모듈
* loginRouter.js : 로그인과 정보들을 처리하거나 로그인과 관련된 팝업들을 처리하는 express 라우터가 들어있는 모듈
* OAuth.json : OAuth 관련 정보가 들어있는 파일
* scheduleRouter.js : 일정과 관련된 정보들을 데이터 베이스에 넣거나 정보들을 변경하는 express 라우터가 들어있는 모듈
* sequelize.js : 데이터 베이스에 접속하거나 데이터 베이스 모델을 만드는 모듈

### multer_uploads : 이미지를 업로드할 때 임시적으로 이미지가 머무는 장소

### scheduleImages : 업로드한 이미지가 들어있는 장소

### web_client : 클라이언트에서 쓰이는 파일들의 모음
* behaviors : 일부 polymer 커스텀 엘리먼트에 사용할 behaviors 모음

#### elements : polymer 커스텀 엘리먼트가 들어있는 폴더
* app-navigation : 웹 사이트의 사이드 메뉴
* friend-invite : 받은 친구 초대 목록이 있는 커스텀 엘리먼트
* friend-list : 초대를 보낸 유저와 친구들의 목록이 있는 커스텀 엘리먼트
* friend-page : 친구와 관련된 페이지들을 처리
* friend-search : 유저를 검색하여 친구 초대를 하는 커스텀 엘리먼트
* login-auth : 로그인과 관련된 커스텀 엘리먼트
* page-404 : 잘못된 url로 왔을 때 나오는 커스텀 엘리먼트
* paper-date-picker : 달력이 나와서 연-월-일을 고르는 태그
* paper-datetime-picker : 달력이 나와서 연-월-일을 고르는 태그
* paper-time-picker : 시간을 고르는 태그
* schedule-addtion : 일정을 추가하는 폼이 나오는 커스텀 엘리먼트
* schedule-app : 웹 사이트를 조작하는 커스텀 엘리먼트
* schedule-invite : 친구에게 권유를 받은 일정들 목록이 표시되는 커스텀 엘리먼트
* schedule-list : 일정 리스트들이 나오는 커스텀 엘리먼트(schedule-view에서 사용)
* schedule-page : 일정과 관련된 페이지들을 처리
* schedule-view : 일정 보기를 관리하는 커스텀 엘리먼트 (schedule-list와 schedule-viewer 커스텀 엘리먼트 사용)
* toast-alert : paper-toast를 이용하여 만든 알림 창

#### img : 웹에서 사용할 이미지파일 들의 모음

#### script : 웹에서 사용할 script 파일들 모음 (.js)
* login.js : 로그인 팝업에서 사용할 스크립트

#### style : 웹에서 사용하는 css 그리고 polymer 커스텀 엘리먼트에 쓸 style 태그가 들어있다.