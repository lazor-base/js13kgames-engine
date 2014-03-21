var Game = Module(function() {
	"use strict";
	// name: Game
	// targets: Client
	// filenames: Game
	// variables
	// end variables
	// functions

	function start() {
		var mainMenu = STATE_NEW(0, 0, true, function() {
			console.log("entered main menu");
		}, function() {
			console.log("exiting main menu");
		}, function() {
			console.log("obscuring main menu");
		}, function() {
			console.log("revealed main menu");
		}, function() {
			// update
		}, function() {
			document.write("Main Menu");
		});
		var loading = STATE_NEW(1, 9, true, function() {
			console.log("entered Loading");
		}, function() {
			console.log("exiting Loading");
		}, function() {
			console.log("obscuring Loading");
		}, function() {
			console.log("revealed Loading");
		}, function() {
			// update
		}, function() {
			document.write("Loading");
		});
		var game = STATE_NEW(2, 1, true, function() {
			console.log("entered Game");
		}, function() {
			console.log("exiting Game");
		}, function() {
			console.log("obscuring Game");
		}, function() {
			console.log("revealed Game");
		}, function() {
			// update
		}, function() {
			document.write("Game");
		});
		var pauseMenu = STATE_NEW(3, 2, false, function() {
			console.log("entered Pause Menu");
		}, function() {
			console.log("exiting Pause Menu");
		}, function() {
			console.log("obscuring Pause Menu");
		}, function() {
			console.log("revealed Pause Menu");
		}, function() {
			// update
		}, function() {
			document.write("Pause Menu");
		});
		STATE_ACTIVATE(mainMenu);
		STATE_ACTIVATE(loading);
		STATE_ACTIVATE(mainMenu);
		STATE_DEACTIVATE(loading);
		STATE_ACTIVATE(game);
		STATE_ACTIVATE(pauseMenu);
		STATE_DEACTIVATE(pauseMenu);
		STATE_PREVIOUS();


		// var lastX = 0;
		// var lastY = 0;
		// var deltaX = 0;
		// var deltaY = 0;
		// var clickXLocation = 0;
		// var clickYLocation = 0;
		// var click = 0;
		// CONTROL_ON("change", function(localId, action, value) {
		// 	if (action === SCROLL_Y) {
		// 		var change = CHUNK_MOVE(null, value, null);
		// 		if (change) {
		// 			CHUNK_DIVIDE_SCREEN();
		// 		}
		// 	}
		// 	if (action === MOUSE_X) {
		// 		deltaX = value - lastX;
		// 		lastX = value;
		// 		if (click === 1) {
		// 			CHUNK_MOVE(deltaX, null, null);
		// 		}
		// 		CHUNK_MAP_MOUSE("X", value);
		// 	}
		// 	if (action === MOUSE_Y) {
		// 		deltaY = value - lastY;
		// 		lastY = value;
		// 		if (click === 1) {
		// 			CHUNK_MOVE(null, null, deltaY);
		// 		}
		// 		CHUNK_MAP_MOUSE("Y", value);
		// 	}
		// 	if (action === MOUSE_LEFT) {
		// 		if (value === 1) {
		// 			CHUNK_PLACE();
		// 		}
		// 	}
		// 	if (action === MOUSE_RIGHT) {
		// 		clickXLocation = lastX;
		// 		clickYLocation = lastY;
		// 		click = value;
		// 		if (value === 0) {
		// 			CHUNK_DIVIDE_SCREEN();
		// 		}
		// 	}
		// });
		// CONTROL_TRUE_MOUSE_DATA(true, MOUSE_X, MOUSE_Y);
		// CHUNK_DIVIDE_SCREEN(true);
		// GUI_ON("resize", function() {
		// 	CHUNK_DIVIDE_SCREEN();
		// });
		// LOOP_EVERY("frame", function() {
		// 	DRAW_RENDER();
		// });
		// // setTimeout(function() {
		// // console.warn("STOPPING TIME")
		// // console.timelineEnd();
		// // console.profileEnd();
		// // LOOP_GO(false);
		// // }, 1000);
		// // console.timeline();
		// // console.profile();
		// LOOP_GO(true);
		// STRUCTURES_GUI();
	}

	function setup() {
		// CONFIG_ACTION(MOUSE_X, MOUSE_Y, MOUSE_LEFT, MOUSE_RIGHT, SCROLL_Y);
		// CONFIG_INPUT(MOUSE, 0);
		// CONFIG_BIND(MOUSE, 0, MOUSE_X, MOUSE_MOVE_X);
		// CONFIG_BIND(MOUSE, 0, MOUSE_Y, MOUSE_MOVE_Y);
		// CONFIG_BIND(MOUSE, 0, MOUSE_LEFT, MOUSE_LEFT_CLICK);
		// CONFIG_BIND(MOUSE, 0, MOUSE_RIGHT, MOUSE_RIGHT_CLICK);
		// CONFIG_BIND(MOUSE, 0, SCROLL_Y, MOUSE_WHEEL_Y);
		// CONTROL_LISTEN(document, MOUSE);
		// BLOCK_MAKE(BLOCK0, BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
		// BLOCK_MAKE(BLOCK1, BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
		// STRUCTURES_DEFINE(STRUCTURE0, "S", "Small Structure", BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE, "#FF0000", 0xFF0000, 1);
		// STRUCTURES_DEFINE(STRUCTURE1, "L", "Large Structure", BLOCK_SIZE * 2, BLOCK_SIZE * 2, BLOCK_SIZE * 2, "#0000FF", 0x0000FF, 1);
	}

	function systems() {
		SYSTEM_DEFINE_SYSTEM(S_SHAPE, false, new Uint16Array(STRUCTURE_ENTRIES), S_TYPED_ARRAY, function(width, height, depth) {
			return new Uint16Array([width, height, depth]);
		}, function(data) {
			return new Uint16Array(data);
		});
		SYSTEM_DEFINE_SYSTEM(S_POSITION, true, new Int32Array(POSITION_ENTRIES), S_TYPED_ARRAY, function(x, y, z) {
			return new Int32Array([x, y, z]);
		}, function(data) {
			return new Int32Array(data);
		});
		SYSTEM_DEFINE_SYSTEM(S_DESCRIPTION, false, "description", S_STRING, function(description) {
			return description;
		}, function(data) {
			return data;
		});
		SYSTEM_DEFINE_SYSTEM(S_COLOR, false, ["#000000", 0xFF0000], S_ARRAY, function(hexidecimal, decimal) {
			return [hexidecimal, decimal];
		}, function(data) {
			return [data[0], data[1]];
		});
		SYSTEM_DEFINE_SYSTEM(S_ID, false, 0, S_NUMBER, function(number) {
			return number;
		}, function(data) {
			return data;
		});
		SYSTEM_DEFINE_SYSTEM(S_DRAW, false, function() {}, S_FUNCTION, function(fn) {
			return fn;
		}, function(data) {
			return data;
		});
		SYSTEM_DEFINE_SYSTEM(S_SYMBOL, false, "description", S_STRING, function(description) {
			return description;
		}, function(data) {
			return data;
		});
		SYSTEM_READY();
	}
	// end functions
	// other
	// end other

	return {
		// return
		setup: setup,
		systems: systems,
		start: start
		// end return
	};
});
if (typeof module !== "undefined") {
	module.exports = Game;
}