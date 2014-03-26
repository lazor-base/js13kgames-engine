var Game = Module(function() {
	"use strict";
	// name: Game
	// targets: Client
	// filenames: Game
	// variables
	// end variables
	// functions

	function start() {
		// setTimeout(function() {
		// console.warn("STOPPING TIME")
		// console.timelineEnd();
		// console.profileEnd();
		// LOOP_GO(false);
		// }, 1000);
		// console.timeline();
		// console.profile();
		STATE_ACTIVATE(GAME_STATE);
		STATE_ACTIVATE(GAME_INTERFACE_STATE);
		STATE_DEACTIVATE(LOADING_STATE);
	}

	function setup() {
		CONFIG_ACTION(MOUSE_X, MOUSE_Y, MOUSE_LEFT, MOUSE_RIGHT, SCROLL_Y);
		CONFIG_INPUT(MOUSE, 0);
		CONFIG_BIND(MOUSE, 0, MOUSE_X, MOUSE_MOVE_X);
		CONFIG_BIND(MOUSE, 0, MOUSE_Y, MOUSE_MOVE_Y);
		CONFIG_BIND(MOUSE, 0, MOUSE_LEFT, MOUSE_LEFT_CLICK);
		CONFIG_BIND(MOUSE, 0, MOUSE_RIGHT, MOUSE_RIGHT_CLICK);
		CONFIG_BIND(MOUSE, 0, SCROLL_Y, MOUSE_WHEEL_Y);
		CONTROL_LISTEN(document, MOUSE);
		BLOCK_MAKE(BLOCK0, BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
		BLOCK_MAKE(BLOCK1, BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
		STRUCTURES_DEFINE(STRUCTURE0, "S", "Small Structure", BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE, "#FF0000", 0xFF0000, 1);
		STRUCTURES_DEFINE(STRUCTURE1, "L", "Large Structure", BLOCK_SIZE * 2, BLOCK_SIZE * 2, BLOCK_SIZE * 2, "#0000FF", 0x0000FF, 1);
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