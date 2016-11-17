# 일정표
* 로그인을 하지 않는 이상 이용 불가능
* 로그인을 하면 우선 메인페이지에서 자신의 간단한 정보와 달력 가장 가까운 일정 소개

## 기능
### 회원
* 우선 회원은 google oauth로만 로그인 가능
* 최초로 로그인 시 정보 등록

### 일정 등록
* 제목, 일정 내용, 일정 날짜(전용 date-picker 생성), 시간, 선택시 사진(1장, 10md 제한)과 지도(<google-map>)로 위치 지정 가능
* 특정 친구들을 선택하여 일정 등록시 친구들에게 해당 일정을 보여주고 (동시에 웹소켓으로 접속해 있는 친구들에게 알려준다.) 같이 참여를 권유할 수 있다.

### 친구
* 친구 목록과 친구 신청 목록 (삭제 가능)
* 친구 기능(친구와 일정 공유 가능, 추가 요청을 받았을 시 웹소켓을 이용해서 친구의 요청을 확인 가능)

#### 웹소켓
* 우선 웹소켓에 접속하면 자신의 idx로 룸을 이동
* 자신이 일정을 추가할 때 마다 지정한 자신의 친구들에게 알림.(회원 idx의 이름으로 된 룸으로 소켓 전송)

##만드는 태그

### date picker 태그
* date picker를 태그 형식으로 개발 날짜 문자열과 시간(getTime())을 two way binding으로 지정가능 (2016년부터)

### toast alert 태그
* 토스트 형식으로 alert를 태그 링크도 추가 가능(paper-toast 이용)

## 파일 구조
* server.js(여기에서 socket.io와 서버 실행) -> module/express(express 서버 생성) -> googleRouter(google oAuth) | module/sequelize(데이터 베이스), 기타 express 라우트 .js파일
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