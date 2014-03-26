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
	// end variables
	// functions

	function states() {
		MAIN_MENU_STATE = STATE_NEW(MAIN_MENU, MAIN_MENU_DEPTH, true, function() {
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
		GAME_INTERFACE_STATE = STATE_NEW(GAME_INTERFACE, GAME_INTERFACE_DEPTH, false, function() {
			var structuresDiv;
			if (GUI_GET("UI_GAME_INTERFACE") === null) {
				structuresDiv = UI_GAME_INTERFACE().el;
				GUI_PUT(structuresDiv);
				STRUCTURES_EACH(function(structure) {
					var button = UI_BUTTON(structure.get(S_DESCRIPTION), structure.get(S_ID));
					GUI_PUT(button.el, structuresDiv);
				});
			}
			GUI_GET("UI_GAME_INTERFACE").classList.remove("hidden");
		}, function() {
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
		LOADING_STATE = STATE_NEW(LOADING, LOADING_DEPTH, true, function() {
			var loadPage = GUI_GET("loading");
			if (!loadPage) {
				loadPage = UI_LOADING_PAGE("Loading...");
				// loadPage = GUI_MAKE("div");
				// GUI_SET(loadPage, "id", "loading");
				// GUI_PUT(loadPage);
			}
			loadPage = GUI_GET("loading");
			loadPage.classList.remove("hidden");
		}, function() {
			var loadPage = GUI_GET("loading");
			loadPage.classList.add("hidden");
		}, function() {}, function() {}, function() {}, function() {});
		GAME_STATE = STATE_NEW(GAME, GAME_DEPTH, true, function() {
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
			});
			CONTROL_TRUE_MOUSE_DATA(true, MOUSE_X, MOUSE_Y);
			CHUNK_DIVIDE_SCREEN(true);
			GUI_ON("resize", function() {
				CHUNK_DIVIDE_SCREEN();
			});
		}, function() {
			console.log("exiting Game");
		}, function() {
			console.log("obscuring Game");
			LOOP_GO(false);
		}, function() {
			console.log("revealed Game");
			LOOP_GO(true);
		}, function() {
			// update
		}, function() {
			DRAW_RENDER();
		});
		// STATE_ACTIVATE(mainMenu);
		STATE_ACTIVATE(LOADING_STATE);
		// STATE_ACTIVATE(mainMenu);
		// STATE_ACTIVATE(game);
		// STATE_DEACTIVATE(loadScreen);
		// STATE_ACTIVATE(pauseMenu);
		// STATE_ACTIVATE(pauseMenu2);
		// STATE_DEACTIVATE(pauseMenu);
		// STATE_PREVIOUS();
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