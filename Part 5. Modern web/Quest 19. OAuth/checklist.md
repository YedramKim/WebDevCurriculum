## 페이스북이나 구글같은 회사는 어떤 식으로 다른 사이트에게 사용자 비밀번호를 넘기지 않고 사용자 인증을 해 줄 수 있을까요?
* 페이스북이나 구글같은 회사에서 OAuth를 이용하여서 다른 사이트 혹은 애플리케이션에 비밀번호를 넘기지 않는 대신 해당 사용자의 지정된 정보의 접속할 수 있는 토큰을 발급해서 사용자 인증을 할 수 있게 합니다.

### OAuth란 무엇인가요?
* OAuth는 OpenID로 이루어진 표준 인증 방식으로 외부에서 OAuth 기능을 제공하는 서비스(e.g. Google, FaceBook, twitter 등)에서 해당 서비스를 이용하는 회원의 정보를 이용할 수 있는 인증 토큰을 받아서 아이디, 비밀번호를 저장할 필요 없이 회원의 정보를 관련된 api를 얻어올 수 있습니다.

* OAuth는 토큰을 통해 회원 인증을 받으므로 회원의 아이디, 비밀번호가 변경이 되었다 할지라도 토큰을 통해 무사히 정보를 얻을 수 있으며 필요한 api에만 접근할 수 있도록 통제할 수 있고, 사용자가 OAuth 제공 서비스의 페이지에 들어가 토큰을 차단할 수 있다는 특징이 있습니다.

#### OAuth의 구성요소 (OAuth 2.0. 기준)
* Authorization Server : 인증 관련된 작업을 수행하는 서버로 인증 토큰 발행 및 요청받은 정보의 토큰을 검사하는 역할을 합니다.

* Resource Server : OAuth를 통해 정보를 제공하는 서비스의 서버

* Resource Owner : Resource Server에서 제공한 자원의 소유자

* client : 인증 토큰을 얻어서 OAuth를 통해 정보를 얻는 애플리케이션

* Authorization code : Authorization Server가 발급해주는 문자열로 client는 Authorization code을 통해 access token을 얻을 수 있습니다.

* access token : client가 authorization Server를 통해 얻은 토큰입니다. 이 토큰을 사용해서 Resource Server에서 필요한 정보들을 얻어 올 수 있습니다.

## OAuth를 통해 사용자 인증을 할 때 어떤 경로로 어떤 정보가 흘러가야 할까요?
* 클라이언트에서 정보를 받으려는 사이트의 Resource Server에 인증을 요청합니다. 이 때 인증받기 위해 Resource Server에 필요한 회원의 아이디와 비밀번호를 같이 보냅니다.

* Resource Server는 받은 회원의 정보를 Authorization Server에 넘겨서 해당 정보로 승인 요청을 받고 받은 승인 요청을 다시 클라이언트에게 전합니다. 

* 승인 허락 요청을 받은 클라이언트는 다시 그 정보를 Authorization Server에 전달해서 access token을 받습니다.

* 이제 클라이언트는 정보를 얻으려 할 때 마다 Resouce Server에 인증 받기 위해 access token를 포함한 요청을 보냅니다. 그리고 Resouce Server는 토큰이 유효한지 검증을 하고 유효한 토큰일 경우 클라이언트가 요청한 정보를 보냅니다.