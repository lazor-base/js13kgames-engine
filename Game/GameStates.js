Module(function() {
	"use strict";
	// name: Game
	// targets: Client
	// filenames: Game
	// variables
	var MAIN_MENU_STATE;
	var LOADING_STATE;
	var GAME_STATE;
	var GAME_INTERFACE_STATE;
	var PAUSE_STATE;

	var lastX = 0;
	var lastY = 0;
	var deltaX = 0;
	var deltaY = 0;
	var clickXLocation = 0;
	var clickYLocation = 0;
	var click = 0;
	// end variables
	// functions

	function controls(localId, action, value) {
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
			if (value === 1) {
				CHUNK_PLACE();
			}
		}
		if (action === MOUSE_RIGHT) {
			clickXLocation = lastX;
			clickYLocation = lastY;
			click = value;
			if (value === 0) {
				CHUNK_DIVIDE_SCREEN();
			}
		}
		if (action === ESC && value === 1) {
			STATE_TOGGLE(PAUSE_STATE);
		}
	}

	function onScreenResize() {
		CHUNK_DIVIDE_SCREEN();
	}

	function states() {

		////////////////////////
		// PAUSE MENU STATE //
		////////////////////////
		PAUSE_STATE = STATE_NEW(PAUSE_MENU, PAUSE_MENU_DEPTH, false, function() {
			if (!GUI_GET("UI_PAUSE_MENU")) {
				UI_PAUSE_MENU();
			}
			GUI_GET("UI_PAUSE_MENU").classList.remove("hidden");
			console.log("entered pause menu");
		}, function() {
			GUI_GET("UI_PAUSE_MENU").classList.add("hidden");
			console.log("exiting pause menu");
		}, function() {
			GUI_GET("UI_PAUSE_MENU").classList.add("hidden");
			console.log("obscuring pause menu");
		}, function() {
			GUI_GET("UI_PAUSE_MENU").classList.remove("hidden");
			console.log("revealed pause menu");
		}, function() {
			// update
		}, function() {
			// document.write("Main Menu");
		});

		///////////////////////
		// MAIN MENU STATE //
		///////////////////////
		MAIN_MENU_STATE = STATE_NEW(MAIN_MENU, MAIN_MENU_DEPTH, true, function() {
			UI_GAME_MAIN_MENU();
			STATE_DEACTIVATE(LOADING_STATE);
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
			// document.write("Main Menu");
		});

		////////////////////////////
		// GAME INTERFACE STATE //
		////////////////////////////
		GAME_INTERFACE_STATE = STATE_NEW(GAME_INTERFACE, GAME_INTERFACE_DEPTH, false, function() {
			console.log("entered game interface");
			var structuresDiv;
			if (GUI_GET("UI_GAME_INTERFACE") === null) {
				structuresDiv = UI_GAME_INTERFACE().el;
				GUI_PUT(structuresDiv);
				STRUCTURES_EACH(function(structure) {
					var button = UI_BUTTON(structure.get(S_DESCRIPTION), structure.get(S_ID), STRUCTURES_EVENT);
					GUI_PUT(button.el, structuresDiv);
				});
			}
			GUI_GET("UI_GAME_INTERFACE").classList.remove("hidden");
		}, function() {
			console.log("exiting game interface");
			GUI_GET("UI_GAME_INTERFACE").classList.add("hidden");
		}, function() {
			console.log("obscuring game interface");
		}, function() {
			console.log("revealed game interface");
		}, function() {
			// update
		}, function() {
			// document.write("Main Menu");
		});

		/////////////////////
		// LOADING STATE //
		/////////////////////
		LOADING_STATE = STATE_NEW(LOADING, LOADING_DEPTH, true, function() {
			console.log("entered loading state");
			var loadPage = GUI_GET("UI_LOADING_PAGE");
			if (!loadPage) {
				loadPage = UI_LOADING_PAGE("Loading...");
			}
			loadPage = GUI_GET("UI_LOADING_PAGE");
			loadPage.classList.remove("hidden");
		}, function() {
			console.log("exiting loading page");
			var loadPage = GUI_GET("UI_LOADING_PAGE");
			loadPage.classList.add("hidden");
		}, function() {}, function() {}, function() {}, function() {});

		//////////////////
		// GAME STATE //
		//////////////////
		GAME_STATE = STATE_NEW(GAME, GAME_DEPTH, true, function() {
			console.log("entered Game");
			CONFIG_BIND(MOUSE, 0, MOUSE_X, MOUSE_MOVE_X);
			CONFIG_BIND(MOUSE, 0, MOUSE_Y, MOUSE_MOVE_Y);
			CONFIG_BIND(MOUSE, 0, MOUSE_LEFT, MOUSE_LEFT_CLICK);
			CONFIG_BIND(MOUSE, 0, MOUSE_RIGHT, MOUSE_RIGHT_CLICK);
			CONFIG_BIND(MOUSE, 0, SCROLL_Y, MOUSE_WHEEL_Y);
			CONFIG_BIND(KEYBOARD, 0, ESC, ESC_KEY_CODE);
			GUI_PUT(DRAW_RENDERER.view);
			DRAW_RENDERER.view.classList.remove("hidden");
			CONTROL_ON("change", controls);
			CONTROL_TRUE_MOUSE_DATA(true, MOUSE_X, MOUSE_Y);
			CHUNK_DIVIDE_SCREEN(true);
			GUI_ON("resize", onScreenResize);
			STATE_DEACTIVATE(LOADING_STATE);
		}, function() {
			LOOP_GO(false);
			console.log("exiting Game");
			CONFIG_UNBIND(MOUSE, 0, MOUSE_X);
			CONFIG_UNBIND(MOUSE, 0, MOUSE_Y);
			CONFIG_UNBIND(MOUSE, 0, MOUSE_LEFT);
			CONFIG_UNBIND(MOUSE, 0, MOUSE_RIGHT);
			CONFIG_UNBIND(MOUSE, 0, SCROLL_Y);
			CONFIG_UNBIND(KEYBOARD, 0, ESC);
			GUI_REMOVE(DRAW_RENDERER.view);
			CONTROL_OFF("change", controls);
			CONTROL_TRUE_MOUSE_DATA(false, MOUSE_X, MOUSE_Y);
			GUI_OFF("resize", onScreenResize);
		}, function() {
			LOOP_GO(false);
			// DRAW_RENDERER.view.classList.add("hidden");
			console.log("obscuring Game");
		}, function() {
			DRAW_RENDERER.view.classList.remove("hidden");
			console.log("revealed Game");
			LOOP_GO(true);
		}, function() {
			// update
		}, function() {
			DRAW_RENDER();
		});
		STATE_ACTIVATE(LOADING_STATE);
	}
	// end functions
	// other
	// end other

	return {
		// return
		states: states
		// end return
	};
});