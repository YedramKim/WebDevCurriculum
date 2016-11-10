var server = require("./lib/express"); // express 서버
var tools = require("./lib/tools"); // 난수 함수 및 랜덤 문자열 생성 함수 등

var io = require("socket.io").listen(server);

var Room = function(name) {
	this.name = name;
	this.people = 0;
	this.shapes = {};
}

//도형 처리
var Shape = function(shape, id, x, y) {
	this.shape = shape;
	this.id = id;
	this.x = x;
	this.y = y;
}

//전체 방목록
var rooms = [];

//방목록 표시
var room = io.of("/room");
room.on("connection", function(socket) {
	var sockets = this;
	var sketchSockets = this.sketchSocket;

	socket.on("get rooms", function(){
		socket.emit("send rooms", rooms);
	});

	socket.on("create room", function(room){ //방 생성
		room = new Room(room);
		room.idx = rooms.length;
		rooms.push(room);

		//방이 생성된 것을 알림과 동시에 자신도 방에 입장(방의 인덱스 번호 전달)
		socket.broadcast.emit("created room", room);
		socket.emit("complete create room", rooms.indexOf(room));
	});
});

//스케치보드
var sketch = io.of("/sketch");
sketch.on("connection", function(socket) {
	var sockets = this;
	var roomSockets = this.roomSocket;
	var room = null; // 자신의 방의 정보
	var shapes = null; // 자신의 방의 도형들의 정보
	var roomIdx = null; // 방의 인덱스 번호
	var roomName = "";

	//방이 존재하는지 검사
	socket.on("check room", function(idx) {
		var length = rooms.length;

		room = rooms[idx];
		if(!room) { // 해당방이 존재하지 않을경우
			socket.emit("not exist room");
			return;
		}

		shapes = room.shapes;

		roomIdx = idx;
		roomName = idx + room.name;
		socket.join(roomName);
		socket.emit("set room", {
			name : room.name,
			shapes : room.shapes
		});

		room.people++;

		//자신의 방에 들어왔다는 것을 방 목록 소켓에 전합니다.
		roomSockets.emit("room update", {
			idx : roomIdx,
			people : room.people
		});
		return;
	});

	//방을 떠날 때 방 점검
	socket.on("disconnect", function() {
		if(roomIdx === null) {
			return;
		}

		socket.leave(roomName);
		room.people--;

		//모두가 나갔으면 삭제
		if(room.people === 0) {

			rooms[roomIdx] = undefined;
			roomSockets.emit("remove room", roomIdx);
		}else {
			//자신의 방에 들어왔다는 것을 방 목록 소켓에 전합니다.
			roomSockets.emit("room update", {
				idx : roomIdx,
				people : room.people
			});
		}
	});

	//유저가 도형을 생성했을 때
	socket.on("create shape", function(data) {
		var length = shapes.length;

		var id = "";
		var uniqueName = false;
		do{ // 중복되지 않는 이름 생성
			uniqueName = false;
			id = tools.createRandomString(5);
		}while(shapes[id]);

		var shape = new Shape(data.shape, id, data.x, data.y);
		room.shapes[id] = shape;

		socket.broadcast.in(roomName).emit("set shape", shape);
		socket.emit("return shape", shape);
	});

	//유저가 키를 눌렀을 때
	socket.on("keydown", function(data){
		var length = shapes.length;
		var id = data.id;
		var speed = 4;

		var shape = shapes[id];
		if(!shape){ // 존재하지 않을 경우 종료
			return;
		}

		if(data.left === 1) {
			shape.x -= speed;
		}else if(data.right === 1){
			shape.x += speed;
		}

		if(data.top === 1){
			shape.y -= speed;
		}else if(data.bottom === 1){
			shape.y += speed;
		}

		sockets.in(roomName).emit("move shape", {
			id : id,
			x : shape.x,
			y : shape.y
		});
	});

	socket.on("delete shape", function(id) {
		delete shapes[id];
		socket.broadcast.in(roomName).emit("deleted shape", id);
	});

});

room.sketchSocket = sketch;
sketch.roomSocket = room;