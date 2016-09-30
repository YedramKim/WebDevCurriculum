## 쿠키란 무엇일까요?
* 쿠키는 클라이언트에 대한 정보를 이용자의 PC에 보관하기 위해 웹 사이트에서 클라이언트의 웹 브라우저에 전송하고 저장하는 정보입니다.
* 쿠키는 텍스트 형태로 저장이 되며 클라이언트에 총 300개까지 저장할 수 있고 각 도메인 당 20개까지 저장이 가능하며 쿠키 하나의 최대 크기는 4096byte( =4kb)입니다.
* 쿠키는 웹 브라우저가 거쳐 간 웹 사이트 및 개인의 정보가 기록되기 때문에 정보를 침해당할 수 있으며 보안에 취약하다는 단점이 있습니다.

#### 쿠키는 어떤 식으로 동작하나요?
* 쿠키의 동작은 웹 서버와 브라우저 간의 상호 협력으로 이루어집니다.
* 쿠키는 클라이언트가 같은 웹사이트를 방문할 때마다 읽히며 웹 브라우저에 의해 관리(기록, 수정, 삭제)됩니다.

#### 쿠키는 어떤 식으로 서버와 클라이언트 사이에 정보를 주고받나요?
* 브라우저가 웹 서버에 웹 페이지를 요청 할 때 웹 서버가 받은 요청에 따라 HTTP 프로토콜에 있는 HTTP 헤더에 쿠키 정보를 쿠키 정보를 포함시켜서 클라이언트 쪽으로 보냅니다. 그리고 브라우저가 다시 페이지를 요청할 때 전에 자신이 요청했을 때 해당 페이지에 대해서 웹 서버가 브라우저 쪽으로 심어 놓은 쿠키를 웹 서버로 다시 건네주어서 이전의 정보를 웹 서버가 알 수 있습니다.

## 웹 어플리케이션의 세션이란 무엇일까요?

#### 세션의 내용은 어디에, 어떤 식으로 저장되나요?