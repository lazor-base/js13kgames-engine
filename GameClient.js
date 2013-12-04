var Game = Module(function(event) {
	var test1, test2;

	function start() {
		Control.on("change", function(localId, action, value, player) {
			if (action === MOVEUP) {
				test1.set(YSPEED, value);
			}
			if (action === TURNCW) {
				test1.set(TURNSPEED, value);
			}
			if (action === TURNCCW) {
				test1.set(TURNSPEED, -value);
			}
			if (action === TURNCW) {
				// test1.set(XSPEED, value);
			}
			if (action === TURNCCW) {
				// test1.set(XSPEED, -value);
			}
			if (action === MOVEDOWN) {
				test1.set(YSPEED, -value);
			}

			// console.log(localId, action, value, player)
		});
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
			var color = "black";
			if (result) {
				color = "red";
			}
			List.put(result);
			//then draw
			Draw.clear();
			Draw.setup(test2, function(context) {
				Draw.poly(test2, "lightgrey", "black");
			});
			Draw.setup(test1, function(context) {
				Draw.poly(test1, color, color);
			});
		});
		Loop.go(true);
	}

	function setup() {
		Config.action(TURNCW, TURNCCW, MOVEUP, MOVEDOWN);
		Config.input(KEYBOARD, 0);
		Config.bind(KEYBOARD, 0, TURNCW, "D".charCodeAt(0));
		Config.bind(KEYBOARD, 0, MOVEUP, "W".charCodeAt(0));
		Config.bind(KEYBOARD, 0, TURNCCW, "A".charCodeAt(0));
		Config.bind(KEYBOARD, 0, MOVEDOWN, "S".charCodeAt(0));
		Control.listen(Draw.canvas, KEYBOARD);
		test1 = List.get(10, "f32");
		test1.set(X, 10);
		test1.set(Y, 10);
		test1.set(ANGLE, 0);
		test1.set(WIDTH, 30);
		test1.set(HEIGHT, 10);
		test1.set(XSPEED, 0);
		test1.set(YSPEED, 0);
		test1.set(TURNSPEED, 0);
		test1.set(SIDES, 4);

		test2 = List.get(10, "f32");
		test2.set(X, 170);
		test2.set(Y, 90);
		test2.set(ANGLE, 0);
		test2.set(WIDTH, 200);
		test2.set(HEIGHT, 50);
		test2.set(XSPEED, 0);
		test2.set(YSPEED, 0);
		test2.set(TURNSPEED, 0);
		test2.set(SIDES, 3);
		document.createElement("canvas");
	}
	return {
		setup: setup,
		start: start,
		ip: "127.0.0.1"
	};
});