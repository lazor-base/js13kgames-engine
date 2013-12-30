var Game = Module(function(event) {
	// name: gameclientserver

	// variables
	var test1, test2;
	// end variables

	// functions
	function start() {
		CONTROL_ON("change", function(localId, action, value, player) {
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
		LOOP_EVERY(0, function(deltaTime) {
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
			var result = PHYSICS_TEST(test1, test2);
			var color = "black";
			if (result) {
				color = "red";
			}
			LIST_PUT(result);
			//then draw
			Draw.clear();
			Draw.setup(test2, function(context) {
				Draw.rect(test2, "lightgrey", "black");
			});
			Draw.setup(test1, function(context) {
				Draw.rect(test1, color, color);
			});
		});
		LOOP_GO(true);
	}

	function setup() {
		CONFIG_ACTION(TURNCW, TURNCCW, MOVEUP, MOVEDOWN);
		CONFIG_INPUT(KEYBOARD, 0);
		CONFIG_BIND(KEYBOARD, 0, TURNCW, "D".charCodeAt(0));
		CONFIG_BIND(KEYBOARD, 0, MOVEUP, "W".charCodeAt(0));
		CONFIG_BIND(KEYBOARD, 0, TURNCCW, "A".charCodeAt(0));
		CONFIG_BIND(KEYBOARD, 0, MOVEDOWN, "S".charCodeAt(0));
		CONTROL_LISTEN(Draw.canvas, KEYBOARD);
		test1 = LIST_GET(10, "f32");
		test1.set(X, 10);
		test1.set(Y, 10);
		test1.set(ANGLE, 0);
		test1.set(WIDTH, 30);
		test1.set(HEIGHT, 10);
		test1.set(XSPEED, 0);
		test1.set(YSPEED, 0);
		test1.set(TURNSPEED, 0);

		test2 = LIST_GET(10, "f32");
		test2.set(X, 170);
		test2.set(Y, 90);
		test2.set(ANGLE, 0);
		test2.set(WIDTH, 200);
		test2.set(HEIGHT, 50);
		test2.set(XSPEED, 0);
		test2.set(YSPEED, 0);
		test2.set(TURNSPEED, 0);
		document.createElement("canvas");
	}
	// end functions

	// other
	// end other

	return {
		// return
		setup: setup,
		start: start,
		ip: "127.0.0.1"
		// end return
	};
});