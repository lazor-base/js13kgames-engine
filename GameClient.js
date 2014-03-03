var Game = Module(function() {
	"use strict";
	// name: Game
	// targets: Client
	// filenames: Game
	// variables
	// end variables
	// functions

	function start() {
		var lastX = 0;
		var lastY = 0;
		var deltaX = 0;
		var deltaY = 0;
		var clickXLocation = 0;
		var clickYLocation = 0;
		var click = 0;
		CONTROL_ON("change", function(localId, action, value) {
			if (action === SCROLL_Y) {
				var change = CHUNK_MOVE(null, value, null);
				if (change) {
					CHUNK_DIVIDE_SCREEN();
				}
			}
			if (action === MOUSE_X) {
				deltaX = value - lastX;
				lastX = value;
				if (click === 1) {
					CHUNK_MOVE(deltaX, null, null);
				}
				CHUNK_MAP_MOUSE("X", value);
			}
			if (action === MOUSE_Y) {
				deltaY = value - lastY;
				lastY = value;
				if (click === 1) {
					CHUNK_MOVE(null, null, deltaY);
				}
				CHUNK_MAP_MOUSE("Y", value);
			}
			if (action === MOUSE_LEFT) {
				clickXLocation = lastX;
				clickYLocation = lastY;
				if (value === 1) {
					var result = STRUCTURES_PLACE();
					if (result === false) {
						click = value;
					}
				}
				if (value === 0) {
					click = value;
					// CONTROL_TRUE_MOUSE_DATA(false, MOUSE_X, MOUSE_Y);
					CHUNK_DIVIDE_SCREEN();
				}
			}
		});
		CONTROL_TRUE_MOUSE_DATA(true, MOUSE_X, MOUSE_Y);
		CHUNK_DIVIDE_SCREEN(true);
		GUI_ON("resize", function() {
			CHUNK_DIVIDE_SCREEN();
		});
		LOOP_EVERY("frame", function() {
			DRAW_RENDER();
			// console.clear();
		});
		// setTimeout(function() {
		// console.warn("STOPPING TIME")
		// console.timelineEnd();
		// console.profileEnd();
		// LOOP_GO(false);
		// }, 1000);
		// console.timeline();
		// console.profile();
		LOOP_GO(true);
		STRUCTURES_GUI();
		// var worker = new Worker('WebWorker.js');

		// worker.addEventListener('message', function(e) {
		// 	console.log('Worker said: ', e.data);
		// }, false);

		// worker.postMessage('Hello World'); // Send data to our worker.
	}

	function setup() {
		CONFIG_ACTION(MOUSE_X, MOUSE_Y, MOUSE_LEFT, SCROLL_Y);
		CONFIG_INPUT(MOUSE, 0);
		CONFIG_BIND(MOUSE, 0, MOUSE_X, MOUSE_MOVE_X);
		CONFIG_BIND(MOUSE, 0, MOUSE_Y, MOUSE_MOVE_Y);
		CONFIG_BIND(MOUSE, 0, MOUSE_LEFT, MOUSE_LEFT_CLICK);
		CONFIG_BIND(MOUSE, 0, SCROLL_Y, MOUSE_WHEEL_Y);
		CONTROL_LISTEN(document, MOUSE);
		BLOCK_MAKE(0, BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
		BLOCK_MAKE(1, BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
		STRUCTURES_DEFINE(0, "S", "Small Structure", "", BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE, 0xFF0000, "#FF0000", 1);
		STRUCTURES_DEFINE(1, "L", "Large Structure", "", BLOCK_SIZE * 2, BLOCK_SIZE * 2, BLOCK_SIZE * 2, 0x0000FF, "#0000FF", 1);
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
if (typeof module !== "undefined") {
	module.exports = Game;
}