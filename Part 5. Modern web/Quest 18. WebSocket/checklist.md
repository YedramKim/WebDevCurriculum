### WebSocket은 어떤 방식으로 HTTP 프로토콜 위에 실시간 통신을 구현하나요?
* 우선 클라이언트에서 websocket을 사용시 클라이언트는 다음과 같은 HTTP request통신을 보냅니다.

``` HTTP
GET / HTTP/1.1
HOST: www.websocket.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==
Sec-WebSocket-version: 13
```

* 우선 `Upgrade: websocket`은 서버에서 websocket 프로토콜을 사용할 수 있으면 websocket 프로토콜을 사용할 것을 요청한다는 내용입니다. 그리고 `Sec-WebSocket-Key`는 서버가 websocket을 이해하고 있는지 확인하기 위해 보내는 무작위로 선정된 문자열입니다. 그리고 서버가 request 요청을 받으면 서버는 클라이언트에게 다음과 response 통신을 보냅니다.

``` HTTP
HTTP/1.1 101
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: HSmrc0sMlYUkAGmm5OPpG2HaGWk=
```

* 서버 응답의 맨 위의 줄의 101은 클라이언트의 요청방식대로 다른 프로토콜을 사용할 것을 알리는 내용이고, `Sec-WebSocket-Accept`는 클라이언트의 request 요청 헤더에 있던 Sec-WebSocket-Key의 값에 고정 GUID()인 `258EAFA5-E914-47DA-95CA-C5AB0DC85B11`(웹소켓에서 지정한 식별자)를 붙여 SHA-1 해쉬 함수로 base64로 인코딩된 값을 나타냅니다.

* 이 response통신을 받은 후 이후 부터 연결이 그대로 유지가 되면서 서버와 클라이언트가 지속적으로 연결이 됩니다.

### socket.io를 통해 node.js 서버에서 여러 개의 채팅방을 관리/구현하려면 어떻게 해야 하나요?
* 
