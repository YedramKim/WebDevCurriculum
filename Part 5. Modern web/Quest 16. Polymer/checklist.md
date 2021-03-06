## Polymer는 어떤 특징을 가지고 있는 웹 프레임워크인가요?
* 구글에서 개발한 Web components 기반의 프레임워크입니다. 지금 현재 Web components는 chrome을 제외한 다른 브라우저에서는 거의 제대로 동작하지 않지만 Polymer를 통해 다른 브라우저에서도 비슷한 형태로 Web components를 구현할 수 있게 해줍니다.(하지만 Polymer library만으로도 한계가 있기 때문에 web components의 polyfill이 별개로 필요합니다.)

* Polymer는 web components 기능처럼 기존의 태그를 이용한 커스텀 엘리먼트를 만들 수 있고 커스텀 엘리먼트마다 전용 속성을 만들어서 커스텀 엘리먼트를 조작할 수도 있습니다.

* observer나 computed properties를 이용해서 종속된 값들이 변할 때마다 observer 처럼 그에 대한 처리를 할 수도 있습니다.

* 데이터 바인딩을 이용해서 바인딩된 값이 변할 때마다 자동으로 바인딩을 시킨 구역이 값에 맞춰 변하게 하거나 `<input>`같은 기존의 태그의 속성(attribute)에 바인딩 시켜서 특정한 이벤트 때마다 값을 변화시킬 수도 있습니다.

* 구글이 제공해주는 여러가지 커스텀 엘리먼트를 이용할 수도 있습니다.

## Shadow DOM이 무엇인가요?
* `Shadow DOM`은 DOM 일종으로 내부에 있는 DOM, style, script은 Shadow DOM에 의해 캡슐화가 되어서 외부에 노출되지 않게 되어서 특수한 방법을 쓰지 않는 이상 외부의 css 규칙과 스크립트의 영향을 받지 않습니다. (마찬가지로 Shadow DOM 내부의 css 규칙은 외부에 아무런 영향을 주지 않습니다.)

* Shadow DOM가 만들어지게 되면 Shadow DOM은 기존의 렌더링된 DOM의 내용의 위에 덮어그리는 방식으로 렌더링이 됩니다. 그래서 기존의 DOM의 내용은 HTML 페이지에서는 볼 수 없습니다. 기존의 DOM의 내용을 이어받아 사용하려면 `<content>`태그를 사용하면 그 자리에 기존의 DOM의 내용이 렌더링 됩니다. 또한 <content>태그에는 select 속성이 있는데 이 속성을 사용하지 않으면 기존의 dom태그 전체를 가져오지만 속성 값에 css 규칙을 작성하면 그 규칙에 맞는 태그들만 가져와서 해당 자리에 렌더링을 합니다.

* 또한 Shadow DOM은 여러 번 만들 수 있는데 다시 새로 만들때마다 기존의 Shadow DOM이 기존의 Shadow DOM에 덮어져 렌더링이 된 것처럼 다시 렌더링이 되는데 기존의 Shadow DOM의 내용을 가져올 때는  `<shadow>`태그를 사용하면 됩니다.

## Web components가 무엇이고, 이 것을 사용할 때 어떤 점을 유의해야 하나요?
* Web components는 기존의 HTML 요소를 확장시키거나 조합하여 새로운 HTML 요소를 개발하는 기술로, 기존의 class나 id같은 선택자로 요소를 선택해서 해당 요소를 기능을 추가하는 방법보다 직관적으로 사용할 수 있으며 해당 기능을 캡슐화해서 분류할 수가 있습니다.

* Web components는 **[Can I use 사이트의 통계](http://caniuse.com/#search=web%20component)**에 따르면 아직 chrome과 나머지 브라우저에서는 지원이 부족하다는 점이 있습니다. 때문에 이전 버전에 브라우저에서도 동작할 수 있도록 web component관련 polyfill을 추가해야 합니다.

* Web components는 다음과 같은 네가지 요소로 구성되어 있습니다.
 * Shadow DOM - Web components에서 해당 요소를 캡슐화하여 컨텐츠와 표현을 분리하는 역할
 * HTML Template - 요소를 표현할 마크업을 정의하고 재사용하는 역할
 * Custom Element - 사용자가 새로운 HTML 요소를 만들 수 있게 하거나 기존의 HTML 요소의 기능을 확장시킬 수 있게 하는 역할
 * HTML Imports - Custom Element가 정의된 외부의 HTML 파일을 가져오는 역할