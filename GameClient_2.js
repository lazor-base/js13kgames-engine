var Game = Module(function(event) {
	// na_me: Game
	// targets: Client
	// filenames: Game
	// variables
	var test1, test2;
	// end variables
	// functions

	function start() {
		CONTROL_ON("change", function(localId, action, value, player) {
			if (action === MOVEUP) {
				test1.set(VELOCITY_Y, value);
			}
			if (action === TURNCW) {
				// test1.set(TURNSPEED, value);
			}
			if (action === TURNCCW) {
				// test1.set(TURNSPEED, -value);
			}
			if (action === TURNCW) {
				test1.set(VELOCITY_X, value);
			}
			if (action === TURNCCW) {
				test1.set(VELOCITY_X, -value);
			}
			if (action === MOVEDOWN) {
				test1.set(VELOCITY_Y, -value);
			}
			// console.log(action, value)

			// console.log(localId, action, value, player)
		});
		LOOP_EVERY(0, function(deltaTime) {
			//move
			// test1.set(TURNSPEED, 10)
			// var turnAngle = test1.get(ANGLE) + test1.get(TURNSPEED);
			// var reverse = turnAngle;
			// turnAngle = Math.abs(turnAngle) % 360;
			// if (reverse < 0) {
			// turnAngle = 360 - turnAngle;
			// }
			// var xSpeed = test1.get(VELOCITY_Y) * Math.cos(turnAngle * Math.PI / 180);
			// var ySpeed = test1.get(VELOCITY_Y) * Math.sin(turnAngle * Math.PI / 180);
			var ySpeed = -test1.get(VELOCITY_Y)
			var xSpeed = test1.get(VELOCITY_X)
			test1.set(X, test1.get(X) + xSpeed);
			test1.set(Y, test1.get(Y) + ySpeed);
			// test1.set(ANGLE, turnAngle);
			//then physics
			var redraw = false;
			PHYSICS_TEST(test1, test2, function(MTV) {
				if (MTV) {
					if (test1.get(COLOR) !== 0xFF0000) {
						test1.set(COLOR, 0xFF0000);
						redraw = true;
					}
				} else {
					if (test1.get(COLOR) !== 0x000000) {
						test1.set(COLOR, 0x000000);
						redraw = true;
					}
				}
				if (redraw) {
					Draw.setup(test1, DRAW_GET_GRAPHIC(test1.get(SPRITE_ID)), function(entity, sprite) {
						Draw.poly(test1, sprite);
					});
				}
				//then draw
				// Draw.clear();
				DRAW_MOVE(DRAW_GET_GRAPHIC(test2.get(SPRITE_ID)), test2);
				DRAW_MOVE(DRAW_GET_GRAPHIC(test1.get(SPRITE_ID)), test1);
			});
		});
		LOOP_GO(true);
		// (function() {
		// 	console.timeline();
		// 	console.profile();
		// 	setTimeout(function() {
		// 		LOOP_GO();
		// 		console.timelineEnd();
		// 		console.profileEnd();
		// 	}, 3000);
		// })();

	}

	function setup() {
		CONFIG_ACTION(TURNCW, TURNCCW, MOVEUP, MOVEDOWN);
		CONFIG_INPUT(KEYBOARD, 0);
		CONFIG_BIND(KEYBOARD, 0, TURNCW, "D".charCodeAt(0));
		CONFIG_BIND(KEYBOARD, 0, MOVEUP, "W".charCodeAt(0));
		CONFIG_BIND(KEYBOARD, 0, TURNCCW, "A".charCodeAt(0));
		CONFIG_BIND(KEYBOARD, 0, MOVEDOWN, "S".charCodeAt(0));
		CONTROL_LISTEN(document, KEYBOARD);
		test2 = LIST_GET(10, "f32");
		test2.set(X, 170);
		test2.set(Y, 90);
		test2.set(ANGLE, 0);
		test2.set(WIDTH, 200);
		test2.set(HEIGHT, 50);
		test2.set(VELOCITY_X, 0);
		test2.set(VELOCITY_Y, 0);
		test2.set(TURNSPEED, 0);
		test2.set(COLOR, 0xAAAAAA);
		test2.set(SPRITE_ID, DRAW_NEW_GRAPHIC(function(graphic) {
			Draw.setup(test2, graphic, function(entity, sprite) {
				Draw.poly(test2, sprite);
			});
		}));
		test1 = LIST_GET(10, "f32");
		// test1 = LIST_GET("f32", "f32", "s16", "u8", "u8", "s8", "s8", "s8", "u8", "u32");
		test1.set(X, 10);
		test1.set(Y, 10);
		test1.set(ANGLE, 0);
		test1.set(WIDTH, 30);
		test1.set(HEIGHT, 10);
		test1.set(VELOCITY_X, 0);
		test1.set(VELOCITY_Y, 0);
		test1.set(TURNSPEED, 0);
		test1.set(COLOR, 0x000000);
		test1.set(SPRITE_ID, DRAW_NEW_GRAPHIC(function(graphic) {
			Draw.setup(test1, graphic, function(entity, sprite) {
				Draw.poly(test1, sprite);
			});
		}));

	}
	// end functions
	// other
	// end other

	return {
		// return
		setup: setup,
		start: start
		// end return
	};
});