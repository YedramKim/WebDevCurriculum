##버전 관리 시스템은 왜 필요한가요?
버전 관리 시스템은 파일 변화를 시간에 따라 기록했다가 나중에 특정 시점의 버전을 다시 꺼내올 수 있는 시스템입니다.
버전 관리 시스템을 사용하면 프로젝트를 예전 상태로 되돌리거나, 파일을 잃어버리거나 잘못 고쳤을 때도 쉽게 복구할 수 있습니다.

##git 외의 버전관리 시스템에는 무엇이 있나요? git은 그 시스템과 어떤 점이 다르며, 어떤 장점을 가지고 있나요?
* 로컬 버전 관리

	간단한 데이터베이스를 사용하여 파일의 변경정보를 관리하는 방식입니다.


* 중앙집중식 버전 관리

	파일을 관리하는 서버(저장소)가 별도로 있고 클라이언트가 서버에서 파일을 받아 사용할 수 있습니다.
	하지만 서버에서 문제가 발생하면, 백업과 협업이 불가능합니다.


* 분산 버전 관리 시스템(git)

 	클라이언트가 저장소 자체를 복제하게 하는 방식으로 git이 바로 이 분산 버전 관리 시스템중 하나입니다.
 	분산 버전 관리 시스템을 사용하면 서버에 문제가 생길 경우 이 복제물로 작업이 가능하며 서버를 복원할 수도 있습니다.
	또한 리모트 저장소가 존재해서 다양한 그룹과 다양한 방법으로 협업이 가능합니다.


##git의 `clone`/`add`/`commit`/`push`/`pull`/`branch`/`stash` 명령은 무엇이며 어떨 때 이용하나요? 그리고 어떻게 사용하나요?

####clone

```
git clone <저장소 URL>
```
* `clone`은 저장소를 복제해서 가져오는 명령어로 외부에서 저장소를 가져올 때 사용합니다.
	
####add
```
git add <파일이름>
```
* 'add'는 파일을 git저장소에 추가하는 명령어 입니다.


####commit
* `commit`은 간단히 말하자면 현재 상태를 git저장소에 저장하는 명령입니다.
```
git commit
```
* 위의 명령으로 커밋을 하면 창이 열리면서 커밋 메시지를 입력받습니다.
```
git commit -m <커밋 메시지>
```
* 위의 명령으로 커밋 메시지를 입력할 수 있습니다.

####push
```
git push <원격 저장소 이름> <보내줄 브랜치>
```
* `push`는 git저장소의 작업 내용을 원격 저장소에 보내는 명령입니다.
* 원격 저장소를 가져온 경우, 원격 저장소 이름이 origin으로 설정되어 있습니다.

####pull
```
git pull
```
* `pull`은 원격 저장소의 내용을 받아와서 업데이트를 하는 명령어로, 다른 사람이 작업한 내용을 가져올 수도 있습니다.

####branch
```
git branch <생성할 브랜치 이름>
```
* 개발을 하다보면 기존에 개발하던 부분과 다른 부분을 개발해야하는 상황이 발생합니다.
* 이럴 때, 서로 독립적으로 개발을 진행하기 위해 브랜치를 만듭니다.

####stash
```
git stash
```
* 작업 도중에 커밋하지 않고 다른 브랜치로 이동하거나 새로 pull하거나 할 때 `stash` 명령을 이용해서 지금까지의 작업을 잠시 백업하고 마지막 커밋 상황으로 돌려놓을 수 있습니다.
```
git stash pop
```
* 다시 작업하던 내용을 복구하고자 할 경우에는 `stash pop`을 하면 됩니다.