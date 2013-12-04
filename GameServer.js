var Game = Module(function(event) {
	var test1, test2;

	function start() {

		Loop.every(0, function(deltaTime) {
			//move
			// test1.set(TURNSPEED, 10)
			var turnAngle = test1.get(ANGLE) + test1.get(TURNSPEED);
			var reverse = turnAngle;
			turnAngle = Math.abs(turnAngle) % 360;
			if (reverse < 0) {
				turnAngle = 360 - turnAngle;
			}
			var xSpeed = test1.get(YSPEED) * Math.cos(turnAngle * Math.PI / 180);
			var ySpeed = test1.get(YSPEED) * Math.sin(turnAngle * Math.PI / 180);
			// var ySpeed = -test1.get(YSPEED)
			// var xSpeed = test1.get(XSPEED)
			test1.set(X, test1.get(X) + xSpeed);
			test1.set(Y, test1.get(Y) + ySpeed);
			test1.set(ANGLE, turnAngle);
			//then physics
			var result = Physics.test(test1, test2);
			List.put(result);
		});
		Loop.go(true);
		Server.on("connection",function(socket) {
			console.log("socket connected")
		})
	}

	function setup() {
		test1 = List.get(10, "f32");
		test1.set(X, 10);
		test1.set(Y, 10);
		test1.set(ANGLE, 0);
		test1.set(WIDTH, 30);
		test1.set(HEIGHT, 10);
		test1.set(XSPEED, 0);
		test1.set(YSPEED, 0);
		test1.set(TURNSPEED, 0);

		test2 = List.get(10, "f32");
		test2.set(X, 170);
		test2.set(Y, 90);
		test2.set(ANGLE, 0);
		test2.set(WIDTH, 200);
		test2.set(HEIGHT, 50);
		test2.set(XSPEED, 0);
		test2.set(YSPEED, 0);
		test2.set(TURNSPEED, 0);
	}
	return {
		setup: setup,
		start: start,
		ip: ""
	};
});
if (typeof module !== "undefined") {
	module.exports = Game;
}