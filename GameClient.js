var Game = Module(function(event) {
	// name: Game
	// targets: Client
	// filenames: Game
	// variables
	var hollow, solid;
	// end variables
	// functions

	function start() {
		var lastX = 0
		var lastY = 0;
		var deltaX = 0;
		var deltaY = 0;
		var clickXLocation = 0;
		var clickYLocation = 0;
		var click = 0;
		CONTROL_ON("change", function(localId, action, value, player) {
			if (action === SCROLL_Y) {
				var change = MAP_MOVE(null, value, null);
				if (change) {
					Map.divideScreen();
				}
			}
			if (action === MOUSE_X) {
				deltaX = value - lastX;
				lastX = value;
				if (click === 1) {
					MAP_MOVE(deltaX, null, null);
				}
			}
			if (action === MOUSE_LEFT) {
				click = value;
				clickXLocation = lastX;
				clickYLocation = lastY;
				if (value === 0) {
					Map.divideScreen();
				}
			}
			if (action === MOUSE_Y) {
				deltaY = value - lastY;
				lastY = value;
				if (click === 1) {
					MAP_MOVE(null, null, deltaY);
				}
			}
		});
		Map.divideScreen(true);
		GUI_ON("resize", function() {
			Map.divideScreen();
		});
		LOOP_EVERY(0, function(deltaTime) {
			// console.clear();
		});
		// setTimeout(function() {
			// console.warn("STOPPING TIME")
			// console.timelineEnd();
			// console.profileEnd();
			// LOOP_GO(false);
		// }, 1000);
		LOOP_GO(true);
		// console.timeline();
		// console.profile();
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