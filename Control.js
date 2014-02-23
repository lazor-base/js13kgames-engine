var Control = (function(navigator) {
	// name: Control
	// targets: Client
	// filenames: Engine

	return Module(function(event) {
		// variables
		var addEventListener = "addEventListener";
		var LENGTH = "length";
		var disabled = false;
		var polling = false;
		var prevRawGamepadTypes = [];
		var prevTimestamps = [];
		var gamepads = [];
		var oldGamePadIds = [];
		var gamePadIds = [];
		var i = 0;
		var mousex = 0;
		var mousey = 0;
		// end variables

		// functions

		function eventType(type) {
			if (type.indexOf("mouse") > -1) {
				return MOUSE;
			}
			if (type.indexOf("key") > -1) {
				return KEYBOARD;
			}
		}


		function pressEvent(e) {
			changeKey(eventType(e.type), 0, e.which, ACTIVE, e);
		}

		function releaseEvent(e) {
			changeKey(eventType(e.type), 0, e.which, INACTIVE, e);
		}

		function scrollEvent(e) {
			changeKey(eventType(e.type), 0, MOUSE_WHEEL_X, e.wheelDeltaX, e);
			changeKey(eventType(e.type), 0, MOUSE_WHEEL_Y, e.wheelDeltaY, e);
		}

		function moveEvent(e) {
			if (e.pageX || e.pageY) {
				mousex = e.pageX;
				mousey = e.pageY;
			} else if (e.clientX || e.clientY) {
				mousex = e.clientX;
				mousey = e.clientY;
			}
			// changeKey(eventType(e.type), 0, MOUSE_MOVE_X, mousex, e);
			// changeKey(eventType(e.type), 0, MOUSE_MOVE_Y, mousey, e);
		}

		function touchMoveEvent(e) {
			if (e.touches[0].pageX || e.touches[0].pageY) {
				mousex = e.touches[0].pageX;
				mousey = e.touches[0].pageY;
			} else if (e.touches[0].clientX || e.touches[0].clientY) {
				mousex = e.touches[0].clientX;
				mousey = e.touches[0].clientY;
			}
			// changeKey(eventType("mouse"), 0, MOUSE_MOVE_X, mousex, e);
			// changeKey(eventType("mouse"), 0, MOUSE_MOVE_Y, mousey, e);
		}

		function mouseChangeEvent(type, id, keyCode, value, e) {
			if (e && e.preventDefault) {
				e.preventDefault();
			}
			PLAYER_FIND(type, id, function(player) {
				// console.log(player.get(PLAYER_LENGTH + action), value, player.get(PLAYER_LENGTH + action) !== value)
				if (player.get(PLAYER_LENGTH + action) !== value) { // we only want to submit a change if the value is different
					player.set(PLAYER_LENGTH + action, value);
					sendEvent(player.get(LOCALID), action, value, player);
				}
			});
		}

		function startPolling() {
			if (!polling) {
				polling = true;
				LOOP_EVERY(15, poll);
			}
		}

		function stopPolling() {
			polling = false;
		}

		function poll() {
			if (polling) {
				pollStatus();
			}
		}

		function initControl() {
			// (The preceding two clauses are for Chrome.)
			var gamepadSupportAvailable = !! navigator.webkitGetGamepads;

			if (!gamepadSupportAvailable) {
				// No gamepad api avilable, disable it so it doesnt get in the way.
				disabled = true;
			} else {

				// Since Chrome only supports polling, we initiate polling loop straight
				// away.
				if ( !! navigator.webkitGetGamepads) {
					startPolling();
				}
			}
		}

		function pollStatus() {
			pollGamepads();
			// the following is used to check if there has been a change to the button inputs in chrome.
			for (var index in gamepads) {
				var gamepad = gamepads[index];

				// Don’t do anything if the current timestamp is the same as previous
				// one, which means that the state of the gamepad hasn’t changed.
				// This is only supported by Chrome right now, so the first check
				// makes sure we’re not doing anything if the timestamps are empty
				// or undefined.
				if (gamepad.timestamp && (gamepad.timestamp !== prevTimestamps[index])) {
					prevTimestamps[index] = gamepad.timestamp;
					EMIT_EVENT("gamepadChange", gamepad);
				}
			}
		}

		function compare(a, b) {
			var proto = Array.prototype;
			return proto.filter.call(a, function(i) {
				return proto.indexOf.call(b, i) > -1;
			});
		}

		function pollGamepads() {

			// Get the array of gamepads – the first method (function call)
			// is the most modern one, the second is there for compatibility with
			// slightly older versions of Chrome, but it shouldn’t be necessary
			// for long.
			var rawGamepads = (navigator.webkitGetGamepads && navigator.webkitGetGamepads());

			if (rawGamepads) {
				// We don’t want to use rawGamepads coming straight from the browser,
				// since it can have “holes” (e.g. if you plug two gamepads, and then
				// unplug the first one, the remaining one will be at index [1]).
				gamepads[LENGTH] = 0;

				// We only refresh the display when we detect some gamepads are new
				// or removed; we do it by comparing raw gamepad table entries to
				// “undefined.”
				var gamepadsChanged = false;

				for (i = 0; i < rawGamepads[LENGTH]; i++) {
					if (typeof rawGamepads[i] !== prevRawGamepadTypes[i]) {
						gamepadsChanged = true;
						prevRawGamepadTypes[i] = typeof rawGamepads[i];
					}

					if (rawGamepads[i]) {
						gamepads.push(rawGamepads[i]);
					}
				}

				// Ask the tester to refresh the visual representations of gamepads
				// on the screen.
				if (gamepadsChanged) {
					//find which gamepads were added and which were removed
					gamePadIds[LENGTH] = 0;
					for (i = 0; i < gamepads[LENGTH]; i++) {
						gamePadIds[i] = gamepads[i].index;
					}
					var removed = compare(oldGamePadIds, gamePadIds);
					var added = compare(gamePadIds, oldGamePadIds);
					// LIST_PUT(oldGamePadIds);
					oldGamePadIds = gamePadIds;
					for (i = 0; i < removed[LENGTH]; i++) {
						EMIT_EVENT("disconnect", removed[i]); // pass the gamepad ID
					}
					for (i = 0; i < added[LENGTH]; i++) {
						EMIT_EVENT("connect", added[i]); // pass the gamepad ID
					}
				}
			}
		}

		function fixAxes(axes, percent) {
			if (axes < 0) {
				return Math.ceil(axes - percent);
			} else {
				return Math.floor(axes + percent);
			}
		}


		function testGamepad(gamepad) {
			var hardwareId = gamepad.index;

			// throttle the analogue stick values so that they don't change so often
			for (i = 0; i < gamepad.axes[LENGTH]; i++) {
				fixAxes(gamepad.axes[i], 35 / 100);
			}

			// run through each of the buttons
			for (i = 0; i < gamepad.buttons[LENGTH]; i++) {
				// 4 axes are first, followed by the buttons, since we have an axes at 0 and a button at 0.
				var action = gamepad.axes[LENGTH] + i;
				changeKey(GAMEPAD, hardwareId, action, gamepad.buttons[i]);
			}

			// run through each of the axes
			for (i = 0; i < gamepad.axes[LENGTH]; i++) {
				changeKey(GAMEPAD, hardwareId, i, gamepad.axes[i]);
			}
		}

		function changeKey(type, id, keyCode, value, e) {
			CONFIG_MATCH_KEY(type, id, keyCode, function(action) {
				if (e && e.preventDefault) {
					e.preventDefault();
				}
				PLAYER_FIND(type, id, function(player) {
					// console.log(player.get(PLAYER_LENGTH + action), value, player.get(PLAYER_LENGTH + action) !== value)
					if (player.get(PLAYER_LENGTH + action) !== value || (type === MOUSE && (keyCode === MOUSE_WHEEL_X || keyCode === MOUSE_WHEEL_Y))) { // we only want to submit a change if the value is different
						player.set(PLAYER_LENGTH + action, value);
						sendEvent(player.get(LOCALID), action, value, player);
					}
				});
			});
		}

		function sendEvent(localId, action, value, player) {
			EMIT_EVENT("change", localId, action, value, player);
		}

		function touchStart(e) {
			var touches = e.changedTouches;
			changeKey(MOUSE, 0, MOUSE_LEFT_CLICK, ACTIVE, e);
		}

		function touchEnd(e) {
			var touches = e.changedTouches;
			changeKey(MOUSE, 0, MOUSE_LEFT_CLICK, INACTIVE, e);
		}

		function listen(node, type) {
			if (type === MOUSE) {
				node[addEventListener]("mousedown", pressEvent);
				node[addEventListener]("mouseup", releaseEvent);
				node[addEventListener]("mousemove", moveEvent);
				node[addEventListener]("mousewheel", scrollEvent);
				node[addEventListener]("touchstart", touchStart);
				node[addEventListener]("touchend", touchEnd);
				node[addEventListener]("touchmove", touchMoveEvent);
				LOOP_EVERY(0, function() {
					changeKey(MOUSE, 0, MOUSE_MOVE_X, mousex);
					changeKey(MOUSE, 0, MOUSE_MOVE_Y, mousey);
				})
			}
			if (type === KEYBOARD) {
				node[addEventListener]("keydown", pressEvent);
				node[addEventListener]("keyup", releaseEvent);
			}
		}
		// end functions

		// other
		event.on("gamepadChange", testGamepad);
		// end other

		return {
			// return
			get gamepads() {
				return gamepads
			},
			on: event.on,
			emit: event.emit,
			listen: listen,
			init: initControl
			// end return
		};
	});
}(navigator));
if (typeof module !== "undefined") {
	module.exports = Control;
}