var Control = (function(navigator, window, document) {
	// name: control

	return Module(function(event) {
		// variables
		var addEventListener = "addEventListener";
		var LENGTH = "length";
		var disabled = false;
		var polling = false;
		var prevRawGamepadTypes = [];
		var prevTimestamps = [];
		var gamePadListeners = [];
		var gamepads = [];
		var usedGamePads = [];
		var oldGamePadIds = [];
		var gamePadIds = [];
		var listenNode;
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

		function preventDefault(e) {
			e.preventDefault();
		}


		function pressEvent(e) {
			preventDefault(e);
			changeKey(eventType(e.type), 0, e.which, ACTIVE);
		}

		function releaseEvent(e) {
			preventDefault(e);
			changeKey(eventType(e.type), 0, e.which, INACTIVE);
		}

		function scrollEvent(e) {
			preventDefault(e);
			changeKey(eventType(e.type), 0, WHEEL_X, e.wheelDeltaX);
			changeKey(eventType(e.type), 0, WHEEL_Y, e.wheelDeltaY);
		}

		function moveEvent(e) {
			preventDefault(e);
			if (event.offsetX || event.offsetX == 0) { //for webkit browser like safari and chrome
				var mousex = event.offsetX;
				var mousey = event.offsetY;
			} else if (event.layerX || event.layerX == 0) { // for mozilla firefox
				var mousex = event.layerX;
				var mousey = event.layerY;
			}
			changeKey(eventType(e.type), 0, MOUSE_X, mousex);
			changeKey(eventType(e.type), 0, MOUSE_Y, mousey);
		}

		function startPolling() {
			if (!polling) {
				polling = true;
				Loop.every(15, poll);
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
			for (var i in gamepads) {
				var gamepad = gamepads[i];

				// Don’t do anything if the current timestamp is the same as previous
				// one, which means that the state of the gamepad hasn’t changed.
				// This is only supported by Chrome right now, so the first check
				// makes sure we’re not doing anything if the timestamps are empty
				// or undefined.
				if (gamepad.timestamp && (gamepad.timestamp !== prevTimestamps[i])) {
					prevTimestamps[i] = gamepad.timestamp;
					event.emit("gamepadChange", gamepad);
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

				for (var i = 0; i < rawGamepads[LENGTH]; i++) {
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
					for (var i = 0; i < gamepads[LENGTH]; i++) {
						gamePadIds[i] = gamepads[i].index;
					}
					var removed = compare(oldGamePadIds, gamePadIds);
					var added = compare(gamePadIds, oldGamePadIds);
					// List.put(oldGamePadIds);
					oldGamePadIds = gamePadIds;
					for (var i = 0; i < removed[LENGTH]; i++) {
						event.emit("disconnect", removed[i]); // pass the gamepad ID
					}
					for (var i = 0; i < added[LENGTH]; i++) {
						event.emit("connect", added[i]); // pass the gamepad ID
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

		event.on("gamepadChange", gamepad);

		function gamepad(gamepad) {
			var hardwareId = gamepad.index;

			// throttle the analogue stick values so that they don't change so often
			for (var i = 0; i < gamepad.axes[LENGTH]; i++) {
				fixAxes(gamepad.axes[i], 35 / 100);
			}

			// run through each of the buttons
			for (var i = 0; i < gamepad.buttons[LENGTH]; i++) {
				// 4 axes are first, followed by the buttons, since we have an axes at 0 and a button at 0.
				var action = gamepad.axes[LENGTH] + i;
				changeKey(GAMEPAD, hardwareId, action, gamepad.buttons[i]);
			}

			// run through each of the axes
			for (var i = 0; i < gamepad.axes[LENGTH]; i++) {
				changeKey(GAMEPAD, hardwareId, i, gamepad.axes[i]);
			}
		}

		function changeKey(type, id, keyCode, value) {
			var action = Config.matchKey(type, id, keyCode);
			if (action !== false) { // only proceed if this key is bound to an action
				var player = Player.find(type, id);
				if (!player) {
					// player one is registered by the engine, so this would be a new player using a controller.
					player = Player.register(-1, -1, id);
				}
				if (player.get(Player[LENGTH] + action) !== value) { // we only want to submit a change if the value is different
					player.set(Player[LENGTH] + action, value);
					sendEvent(player.get(LOCALID), action, value, player);
				}
			}
		}

		function sendEvent(localId, action, value, player) {
			event.emit("change", localId, action, value, player);
		}

		function listen(node, type) {
			if (type === MOUSE) {
				document[addEventListener]("mousedown", pressEvent);
				document[addEventListener]("mouseup", releaseEvent);
				document[addEventListener]("mousemove", moveEvent);
				document[addEventListener]("mousewheel", scrollEvent);
			}
			if (type === KEYBOARD) {
				document[addEventListener]("keydown", pressEvent);
				document[addEventListener]("keyup", releaseEvent);
			}
		}
		// end functions 

		// other
		// end other

		return {
			// return
			preventDefault: preventDefault,
			on: event.on,
			emit: event.emit,
			listen: listen,
			init: initControl
			// end return
		};
	});
}(navigator, window, document));
if (typeof module !== "undefined") {
	module.exports = Control;
}