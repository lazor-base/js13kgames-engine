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
			if (action === MOVE_MOUSE_X) {
				deltaX = value - lastX;
				lastX = value;
				if (click === 1) {
					MAP_MOVE(deltaX, null, null)
				}
			}
			if (action === MOUSE_CLICK) {
				click = value;
				clickXLocation = lastX;
				clickYLocation = lastY;
				if(value === 0) {
					Map.divideScreen();
				}
			}
			if (action === MOVE_MOUSE_Y) {
				deltaY = value - lastY;
				lastY = value;
				if (click === 1) {
					MAP_MOVE(null, null, deltaY)
				}
			}
		});
		Map.divideScreen();
		GUI_ON("resize", function() {
			Map.divideScreen();
		});
		LOOP_EVERY(0, function(deltaTime) {

		});
		LOOP_GO(true);

	}

	function setup() {
		CONFIG_ACTION(MOVE_MOUSE_X, MOVE_MOUSE_Y, MOUSE_CLICK);
		CONFIG_INPUT(MOUSE, 0);
		CONFIG_BIND(MOUSE, 0, MOVE_MOUSE_X, MOUSE_X);
		CONFIG_BIND(MOUSE, 0, MOVE_MOUSE_Y, MOUSE_Y);
		CONFIG_BIND(MOUSE, 0, MOUSE_CLICK, LEFT_MOUSE);
		CONTROL_LISTEN(document, MOUSE);
		BLOCK_MAKE(0, BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE, function(graphic, x, y, color, alpha) {
			// graphic.width = BLOCK_SIZE;
			// graphic.height = BLOCK_SIZE;
			// graphic.beginFill(0x000000, 0);
			// graphic.drawRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
			// graphic.endFill();
		});
		BLOCK_MAKE(1, BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE, function(graphic, x, y, color, alpha) {
			graphic.width = BLOCK_SIZE;
			graphic.height = BLOCK_SIZE;
			graphic.beginFill(color, alpha);
			graphic.drawRect(x, y, BLOCK_SIZE, BLOCK_SIZE);
			graphic.endFill();
		});
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