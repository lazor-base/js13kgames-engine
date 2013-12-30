(function(navigator, window, document) {
	// name: engineclient

	// variables
	var arrayProto = Array.prototype;
	/**
	 * Converts functions into a module with events.
	 *
	 * @method Module
	 *
	 * @param  {Function} fn Uninitialized function to convert into a module.
	 */
	 // end variables

	 // functions
	function Module(fn) {
		return fn({
			on: function(name, callback) {
				document.addEventListener(name, function(event) {
					if (event.detail === undefined) {
						callback();
					} else if (event.detail[0] !== undefined) {
						callback.apply(window, event.detail); // should be accessible as arguments, not as an array
					} else {
						callback.call(window, event.detail); // only one argument
					}
				}, false);
			},
			emit: function(name) {
				var args = arrayProto.splice.call(arguments, 1, arguments.length - 1); // all arguments but the name
				var myEvent = new CustomEvent(name, {
					detail: args
				});
				document.dispatchEvent(myEvent);
			}
		});
	}
	window.Module = Module;
	return Module(function(event) {
		// config
		var hardware = {};
		var actions = 0;
		var actionNames = [];
		var undefined = void 0;

		//control
		var addEventListener = "addEventListener";
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

		// GUI
		var isReady = false;

		// Draw
		var canvas, context;

		// help
		var shift = arrayProto.shift;
		var push = arrayProto.push;

		// list
		var NULL = null;
		var created = 0;
		var LENGTH = "length";
		var NEXT = "next";
		var ARRAY = "array";
		var oldArrays = [];
		var types = {
			u8: Uint8Array,
			u16: Uint16Array,
			u32: Uint32Array,
			s8: Int8Array,
			s16: Int16Array,
			s32: Int32Array,
			f32: Float32Array,
			f64: Float64Array
		};

		// loop
		var stop = true;
		var currentTick = 0;
		var lastTick = 0;
		var intervals = [];
		var intervalTicks = [];
		var loop;

		// physics
		var axes = [];
		var smallest = {};

		// player
		var uniqueId = 0;
		var players = linked();

		var playerOneCanUseController = false;
		var totalControllers = 0;
		var playerOneUsingGamepad = false;
		var usedGamePads = [];

		// riffwave
		var oldData = [];

		// struct
		var structList = {};
		var structId = 0;

		//time
		var now = Date.now;



		// config

		function bind(type, id, action, keyCode) {
			var uniqueId = "" + type + id;
			hardware[type][uniqueId].set(action, keyCode);
		}

		function unbind(type, id, action) {
			bind(type, id, action, -1);
		}

		function binding(type, id, action) {
			return hardware[type][uniqueId].get(action);
		}

		function matchKey(type, id, keyCode) {
			var uniqueId = "" + type + id;
			var result = hardware[type][uniqueId].each(function(key, action) {
				if (key === keyCode) {
					return action;
				}
			});
			if (result === undefined) {
				return false;
			}
			return result;
		}

		function action() {
			actions = +arguments.length;
		}

		function input(type, id) {
			var uniqueId = "" + type + id;
			if (!hardware[type]) {
				hardware[type] = {};
			}
			if (!hardware[type][uniqueId]) {
				hardware[type][uniqueId] = LIST_GET(actions, "s8");
			}
		}

		// control

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
			var mousex = 0;
			var mousey = 0;
			if (e.pageX || e.pageY) {
				mousex = e.pageX;
				mousey = e.pageY;
			} else if (e.clientX || e.clientY) {
				mousex = e.clientX;
				mousey = e.clientY;
			}
			changeKey(eventType(e.type), 0, MOUSE_X, mousex);
			changeKey(eventType(e.type), 0, MOUSE_Y, mousey);
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
			return arrayProto.filter.call(a, function(i) {
				return arrayProto.indexOf.call(b, i) > -1;
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
					// LIST_PUT(oldGamePadIds);
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
			var action = matchKey(type, id, keyCode);
			if (action !== false) { // only proceed if this key is bound to an action
				var player = PLAYER_FIND(type, id);
				if (!player) {
					// player one is registered by the engine, so this would be a new player using a controller.
					player = PLAYER_REGISTER(-1, -1, id);
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
				node[addEventListener]("mousedown", pressEvent);
				node[addEventListener]("mouseup", releaseEvent);
				node[addEventListener]("mousemove", moveEvent);
				node[addEventListener]("mousewheel", scrollEvent);
			}
			if (type === KEYBOARD) {
				node[addEventListener]("keydown", pressEvent);
				node[addEventListener]("keyup", releaseEvent);
			}
		}

		// GUI

		function testGUI() {
			if (!isReady) {
				isReady = document.readyState === "complete";
				setTimeout(testGUI, 10);
			} else {
				event.emit("ready");
			}
		};
		setTimeout(testGUI, 10);

		function getGUI(id) {
			return document.getElementById(id);
		}

		function putGUI(node, parent) {
			if (!parent) {
				parent = document.body;
			}
			return parent.appendChild(node);
		}

		function makeGUI(name) {
			return document.createElement(name);
		}

		function setGUI(element, nameValueList, value) {
			if (value) {
				element.setAttribute(nameValueList, value);
			} else {
				for (var i = 0; i < nameValueList.length; i += 2) {
					element.setAttribute(nameValueList[i], nameValueList[i + 1]);
				}
			}
		}

		function removeGUI(node) {
			node.parentNode.removeChild(node);
		}

		function template(template, vars) {
			var result = template;
			for (var attr in vars) {
				result = result.replace(new RegExp("{{" + attr + "}}", 'g'), vars[attr]);
			}
			return result;
		}

		// draw
		event.on("ready", function() {
			canvas = makeGUI("canvas");
			canvas.width = 820;
			canvas.height = 720;
			putGUI(canvas);
			context = canvas.getContext("2d");
		});

		function poly(entity, context, fillColor, strokeColor) {
			context.beginPath();
			var vertices = getVertices(entity);
			context.moveTo(vertices.get(X), vertices.get(Y));
			for (i = 2; i < vertices.length; i += 2) {
				context.lineTo(vertices.get(i + X), vertices.get(i + Y));
			}
			context.lineTo(vertices.get(X), vertices.get(Y));
			putList(vertices);
			// context.beginPath();
			// context.rect(-(entity.get(WIDTH) / 2), -(entity.get(HEIGHT) / 2), entity.get(WIDTH), entity.get(HEIGHT));
			context.fillStyle = fillColor;
			context.fill();
			context.lineWidth = 2;
			context.strokeStyle = strokeColor;
			context.stroke();
			context.closePath();
		}

		function setupDraw(entity, context, callback) {
			var x = entity.get(X);
			var y = entity.get(Y);
			var angle = entity.get(ANGLE) || 0;
			context.save();
			context.translate(x, y);
			context.rotate(angle * Math.PI / 180);
			callback(entity, context);
			context.restore();
		}

		function clear() {
			context.clearRect(0, 0, canvas.width, canvas.height);
		}

		// help
		/**
		 * A replacement for Array.splice which doesnt return an array if there is only one item.
		 *
		 * @method
		 *
		 * @returns {Function}
		 */
		var Splice = (function() {
			var helper = [];
			var returnItems = [];
			var id = 0;
			return function(array, index, howMany) {
				helper[LENGTH] = 0;
				returnItems[LENGTH] = 0;
				id = 0;
				while (array[LENGTH]) {
					var item = shift.call(array);
					if (id >= index && id <= index + howMany) {
						returnItems.push(item);
					} else {
						helper.push(item);
					}
					id++
				}
				while (helper[LENGTH]) {
					push.call(array, helper.shift())
				}
				return returnItems.pop();
			};
		}());

		function itemRemove(array, item) {
			var index = 0;
			if (item !== undefined) {
				index = array.indexOf(item);
			}
			return indexRemove(array, index);
		}

		function indexRemove(array, index) {
			return Splice(array, index, 1);
		}

		function has(array, item) {
			return array.indexOf(item) > -1;
		}

		// list
		/**
		 * Helper function to get byte size of each array, since the text is lengthy.
		 *
		 * @method  size
		 *
		 * @param   {String} description   first character indicates signed with u[nsigned] or s[igned], second character indicates float with f[loat] or i[nt] followed by a number indicating size
		 *
		 * @returns {Number}
		 */

		function size(description) {
			return types[description].BYTES_PER_ELEMENT;
		}

		/**
		 * Multipurpose function to either store an old array, or return an old array for reuse.
		 * If recycling an array, leave all parameters but the first one empty. If selecting an
		 * array, fill all parameters.
		 *
		 * @method  recycle
		 *
		 * @param   {Number} array         old array to store, OR, Number of entries in the array
		 * @param   {String} description   first character indicates signed with u[nsigned] or s[igned], second character indicates float with f[loat] or i[nt] followed by a number indicating size
		 *
		 * @returns {}        [description]
		 */

		function putList(array, description) {
			if (array && !description) {
				if (!HELP_HAS(oldArrays, array)) {
					oldArrays.push(array);
				}
			} else if (oldArrays[LENGTH] && array && description) {
				var firstElement = oldArrays[0];
				var element = oldArrays.shift();
				do {
					if (element.buffer.byteLength === array * size(description)) {
						element.each(function(item, index) {
							element.set(index, 0);
						});
						return element;
					}
					oldArrays.push(element);
					element = oldArrays.shift();
				} while (element !== firstElement);
				oldArrays.push(element);
				return false;
			} else {
				return false;
			}
		}
		/**
		 * Reuse a recycled typedArray or make a new one if we don't have the right size.
		 *
		 * @method  get
		 *
		 * @param   {Number} entries        Number of entries in the array
		 * @param   {String} description    first character indicates signed with u[nsigned] or s[igned], second character indicates float with f[loat] or i[nt] followed by a number indicating size
		 *
		 * @returns {Object}         New typedList Object
		 */

		function getList(entries, description) {
			var result = putList(entries, description);
			if (!result) {
				result = new Node(entries, description);
			}
			result.view(description);
			return result;
		}

		/**
		 * Starts up a new typedList Object.
		 *
		 * @method  Node
		 *
		 * @param   {Number} entries        Number of entries in the array
		 * @param   {String} description    first character indicates signed with u[nsigned] or s[igned], second character indicates float with f[loat] or i[nt] followed by a number indicating size
		 *
		 * @returns {Object}         New typedList Object
		 */

		function Node(entries, description) {
			created++;
			this.buffer = new ArrayBuffer(entries * size(description));
		}

		Node.prototype = {
			next: NULL,
			prev: NULL,
			list: NULL,
			get length() {
				return this[ARRAY][LENGTH]
			},
			each: function(fn) {
				for (var i = 0; i < this[LENGTH]; i++) {
					var result = fn(this[ARRAY][i], i, this[ARRAY]);
					if (result !== undefined) {
						return result;
					}
				}
			},
			view: function(description) {
				return this[ARRAY] = new types[description](this.buffer);
			},
			set: function(index, value) {
				this[ARRAY][index] = value;
			},
			get: function(index) {
				return this[ARRAY][index];
			},
			remove: removeList
		};

		/**
		 * Remove a node from a linkedList
		 *
		 * @method  remove
		 *
		 */

		function removeList() {
			var node = this;
			var next = node[NEXT];
			var previous = node.prev;
			next.prev = previous;
			previous[NEXT] = next;
			node[NEXT] = NULL;
			node.prev = NULL;
			node.list = NULL;
			putList(node);
		}

		/**
		 * Adds a node or nodes to a linkedList
		 *
		 * @method  push
		 *
		 */

		function pushList() {
			var linkedList = this;
			for (var i = 0; i < arguments[LENGTH]; i++) {
				var previous = linkedList.last;
				var next = arguments[i];
				if (!linkedList.first) {
					// we need to set the first node
					linkedList.first = next;
				} else {
					// if the previous node exists, point it to the new node
					previous[NEXT] = next;
				}
				next.prev = previous;
				next.list = linkedList;
				linkedList.last = next;
			}
		}

		function eachList(fn) {
			var item = this.first;
			do {
				var result = fn(item);
				item = item[NEXT];
				if (result !== undefined) {
					return result;
				}
			} while (item !== null);
		}

		/**
		 * Creates a new linkedList
		 *
		 * @method  linked
		 *
		 * @returns {Object}
		 */

		function linked(description, entries) {
			var list = {
				push: pushList,
				each: eachList,
				first: NULL,
				last: NULL
			};
			if (description) {
				list.get = function() {
					var result = getList(entries, description);
					this.push(result);
					return result;
				};
			}
			return list;
		}

		// loop

		function nextFrame(callback) {
			if (typeof requestAnimationFrame === "function") {
				return requestAnimationFrame(callback);
			} else {
				return setTimeout(callback, 1000 / 60);
			}
		};

		function go(bool) {
			stop = !bool;
			if (bool) {
				loop = nextFrame(run);
			}
		}

		function run() {
			if (stop === false) {
				lastTick = currentTick;
				currentTick = TIME_MICRO();
				for (var i = 0; i < intervals.length; i++) {
					if (stop) {
						return true;
					}
					var interval = parseInt(intervals[i], 10);
					if (currentTick - intervalTicks[i] >= interval) {
						var deltaTime = currentTick - intervalTicks[i];
						intervalTicks[i] = currentTick;
						event.emit(intervals[i], deltaTime);
					}
				}
				loop = nextFrame(run);
			}
		}

		function every(interval, callback) {
			if (intervals.indexOf("" + interval) === -1) {
				intervals.push("" + interval);
				intervalTicks.push(TIME_MICRO());
			}
			event.on("" + interval, callback);
		}

		// physics

		var numbers = getList(2, "f32");
		numbers.set(0, 9e9);
		numbers.set(1, Math.PI / 180);

		function dot(vector1, vector2) {
			return (getValue(vector1, X) * getValue(vector2, X)) + (getValue(vector1, Y) * getValue(vector2, Y));
		}

		function getOverlap(vector1, vector2) {
			return Math.min(getValue(vector1, Y), getValue(vector2, Y)) - Math.max(getValue(vector1, X), getValue(vector2, X));
		}

		function overlapping(vector1, vector2) {
			return !(getValue(vector1, X) > getValue(vector2, Y) || getValue(vector2, X) > getValue(vector1, Y));
		}

		function getf32List(size) {
			return getList(size, "f32");
		}

		function putInList() {
			for (var i = 0; i < arguments.length; i++) {
				putList(arguments[i]);
			}
		}

		function getValue(list, index) {
			return list.get(index);
		}

		function setValue(list, index, value) {
			return list.set(index, value);
		}

		function setXY(list, x, y, increment) {
			increment = increment || 0;
			setValue(list, increment + X, x);
			setValue(list, increment + Y, y);
		}

		function test(entity1, entity2) {
			// Minimum Translation Vector (MTV)
			var MTV = getf32List(3);
			var axis = getf32List(2);
			axes.length = 0;
			var vertices1 = getVertices(entity1, TRUE);
			var vertices2 = getVertices(entity2, TRUE);
			axes.push(getAxes(vertices1), getAxes(vertices2));
			for (var i = 0; i < axes.length; i++) {
				for (var e = 0; e < axes[i].length; e += 2) {
					setXY(axis, getValue(axes[i], e + X), getValue(axes[i], e + Y))
					// project both shapes onto the axis
					var projection1 = project(axis, entity1, vertices1);
					var projection2 = project(axis, entity2, vertices2);

					// do the projections overlap?
					if (!overlapping(projection1, projection2)) {
						// then we can guarantee that the shapes do not overlap
						putInList(projection1, projection2, axes[0], axes[1], axis, MTV, vertices1, vertices2)
						return false;
					} else {
						// get the overlap
						var projectionOverlap = getOverlap(projection1, projection2);
						putInList(projection1, projection2)
						// check for minimum
						if (projectionOverlap < getValue(numbers, 0)) {
							// then set this one as the smallest
							setXY(MTV, getValue(axis, X), getValue(axis, Y))
							setValue(MTV, 2, projectionOverlap);
						}
					}
				}
			}
			// if we get here then we know that every axis had overlap on it
			// so we can guarantee an intersection
			putInList(axes[0], axes[1], axis, vertices1, vertices2)
			return MTV;
		}

		function project(axis, entity, vertices) {
			var vector = getf32List(2);
			setXY(vector, getValue(vertices, X), getValue(vertices, Y))
			var min = dot(axis, vector);
			var max = min;
			for (var i = 0; i < vertices.length; i += 2) {
				setXY(vector, getValue(vertices, i + X), getValue(vertices, i + Y))
				var projection = dot(axis, vector);
				if (projection < min) {
					min = projection;
				} else if (projection > max) {
					max = projection;
				}
			}
			var offset = dot(axis, entity);
			setXY(vector, min + offset, max + offset)
			return vector;
		}

		function getVertices(entity, rotated) {
			// counter clockwise vertices
			var width = (getValue(entity, WIDTH) / 2);
			var height = (getValue(entity, HEIGHT) / 2);
			var vertices = getf32List(8);
			setValue(vertices, 0, -width); // top left
			setValue(vertices, 1, -height);
			setValue(vertices, 2, +width); // top right
			setValue(vertices, 3, -height);
			setValue(vertices, 4, +width); // bottom right
			setValue(vertices, 5, +height);
			setValue(vertices, 6, -width); // bottom left
			setValue(vertices, 7, +height);
			if (rotated) {
				return rotate(vertices, entity);
			}
			return vertices;
		}

		function getAxes(vertices) {
			var length = vertices.length;
			var axes = getf32List(length);
			for (var i = 0; i < length; i += 2) {
				var vector1 = getf32List(2);
				var vector2 = getf32List(2);
				setXY(vector1, getValue(vertices, i + X), getValue(vertices, i + Y))
				var e = i + 2;
				if (e === length) {
					e = 0;
				}
				setXY(vector2, getValue(vertices, e + X), getValue(vertices, e + Y))
				var edge = subtract(vector1, vector2);
				var normal = perpendicular(edge);
				setXY(axes, getValue(normal, X), getValue(normal, Y), i)
				putInList(normal);
			}
			return axes;
		}

		function rotate(vertices, entity) {
			for (var i = 0; i < vertices.length; i += 2) {
				var x = getValue(vertices, i + X);
				var y = getValue(vertices, i + Y);
				var angle = getValue(entity, ANGLE) * getValue(numbers, 1);
				setXY(vertices, ((x * Math.cos(angle)) - (y * Math.sin(angle))), ((x * Math.sin(angle)) + (y * Math.cos(angle))), i)
			}
			return vertices;
		}

		function perpendicular(vector) {
			// pretty sure you need to detect what is the run and what is the rise in order to do -run/rise for an angled polygon. eg y may be run and x may be rise, if its flipped 90 degrees.
			var x = getValue(vector, X);
			var y = getValue(vector, Y);
			setXY(vector, y, -x)
			return normalize(vector);
		}

		function normalize(vector) {
			var lengthSquared = dot(vector, vector);
			var length = Math.sqrt(lengthSquared);
			if (length > 0) {
				setXY(vector, getValue(vector, X) / length, getValue(vector, Y) / length)
			}
			return vector;
		}

		function subtract(vector1, vector2) {
			var result = getf32List(2);
			setXY(result, getValue(vector1, X) - getValue(vector2, X), getValue(vector1, Y) - getValue(vector2, Y))
			putInList(vector1, vector2);
			return result;
		}

		// player

		function register(mouse, keyboard, gamepad) {
			var player = LIST_GET(6 + actions, "s8");
			player.set(LOCALID, uniqueId);
			player.set(REMOTEID, -1);
			player.set(PING, 30);
			player.set(MOUSE, mouse);
			player.set(KEYBOARD, keyboard);
			player.set(GAMEPAD, gamepad);
			uniqueId++;
			players.push(player);
			return player;
		}

		function find(type, id) {
			return players.each(function(player) {
				if (player.get(type) === id) {
					return player;
				}
			}) || false;
		}

		function onGamePadConnect(gamePadId) {
			console.log("gamepad connected")
			totalControllers++;
			playerOneCanUseController = unusedControllers();
		}

		function onGamePadDisconnect(gamePadId) {
			console.log("gamepad disconnected")
			totalControllers--;
			if (gamePadInUse(gamePadId)) {
				// gamepad in use, disconnect that user.
				disconnectPlayer(gamePadId);
			}
			playerOneCanUseController = unusedControllers();
		}

		function gamePadInUse(gamePadId) {
			if (gamePadId === -1) {
				return true;
			}
			return has(usedGamePads, gamePadId);
		}

		function disconnectPlayer(gamePadId) {
			var player = find(GAMEPAD, gamePadId);
			if (player.same(LOCALID, 0)) {
				playerOneSwapInput();
				return false;
			}
			emit("disconnect", player);
			player.remove();
			if (gamePadInUse(gamePadId)) {
				itemRemove(usedGamePads, gamePadId); // remove the gamepad id from used gamepads
			}
		}

		function connectPlayer(gamePadId) {
			var player = register(-1, -1, gamePadId);
			if (!gamePadInUse(gamePadId)) {
				usedGamePads.push(gamePadId); // reserve this gamepad as used.
			}
			event.emit("connect", player);
		}

		function playerOneSwapInput() {
			var playerOne = find(KEYBOARD, 0);
			if (playerOne.same(GAMEPAD, -1)) {
				// if player one isnt using a gamepad yet, lets find him one.
				for (var i = 0; i < gamepads.length; i++) {
					var gamepad = gamepads[i].index;
					if (!gamePadInUse(gamepad)) {
						playerOne.set(GAMEPAD, gamepad);
						usedGamePads.push(gamepad); // reserve this gamepad as used.
						playerOneUsingGamepad = true;
						event.emit("change", playerOne);
						return true;
					}
				}
			} else {
				// reset back to keyboard
				if (gamePadInUse(playerOne.get(GAMEPAD))) {
					itemRemove(usedGamePads, playerOne.gamePadId); // remove the gamepad id from used gamepads
				}
				playerOne.set(GAMEPAD, -1);
				playerOneUsingGamepad = false;
				event.emit("change", playerOne);
				return true;
			}
		}

		function togglePlayer(gamePadId) {
			//player pressed start button on controller
			var player = find(GAMEPAD, gamePadId);
			if (player !== false) {
				// this player is already connected, disconnect them
				disconnectPlayer(gamePadId);
			}
			if (player === false) {
				// no players are using this gamepad, add a new player
				connectPlayer(gamePadId);
			}
			playerOneCanUseController = unusedControllers();
		}

		function isLocal(remoteId) {
			if (find(REMOTEID, remoteId)) {
				return true;
			}
			return false;
		}

		function unusedControllers() {
			if (gamepads.length > 0 && gamepads.length > usedGamePads.length) {
				return true;
			}
			return false;
		}

		function initPlayer() {
			playerOneCanUseController = unusedControllers();
			event.on("connect", onGamePadConnect);
			event.on("disconnect", onGamePadDisconnect);
		}

		// riffwave
		var FastBase64 = (function() {

			var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
			var encLookup = [];

			for (var i = 0; i < 4096; i++) {
				encLookup[i] = chars[i >> 6] + chars[i & 0x3F];
			}

			function Encode(src) {
				var len = src.length;
				var dst = '';
				var i = 0;
				while (len > 2) {
					n = (src[i] << 16) | (src[i + 1] << 8) | src[i + 2];
					dst += encLookup[n >> 12] + encLookup[n & 0xFFF];
					len -= 3;
					i += 3;
				}
				if (len > 0) {
					var n1 = (src[i] & 0xFC) >> 2;
					var n2 = (src[i] & 0x03) << 4;
					if (len > 1) n2 |= (src[++i] & 0xF0) >> 4;
					dst += chars[n1];
					dst += chars[n2];
					if (len == 2) {
						var n3 = (src[i++] & 0x0F) << 2;
						n3 |= (src[i] & 0xC0) >> 6;
						dst += chars[n3];
					}
					if (len == 1) dst += '=';
					dst += '=';
				}
				return dst;
			} // end Encode
			return {
				Encode: Encode
			};
		}());

		function u32ToArray(i) {
			return [i & 0xFF, (i >> 8) & 0xFF, (i >> 16) & 0xFF, (i >> 24) & 0xFF];
		}

		function u16ToArray(i) {
			return [i & 0xFF, (i >> 8) & 0xFF];
		}

		function split16bitArray(data) {
			var r = [];
			var j = 0;
			var len = data.length;
			for (var i = 0; i < len; i++) {
				r[j++] = data[i] & 0xFF;
				r[j++] = (data[i] >> 8) & 0xFF;
			}
			return r;
		}

		function make(audioData, waveInfo) {
			waveInfo = waveInfo || get();
			waveInfo[BLOCKALIGN] = (waveInfo[NUMCHANNELS] * waveInfo[BITSPERSAMPLE]) >> 3;
			waveInfo[BYTERATE] = waveInfo[BLOCKALIGN] * waveInfo[SAMPLERATE];
			waveInfo[SUBCHUNK2SIZE] = audioData.length * (waveInfo[BITSPERSAMPLE] >> 3);
			waveInfo[CHUNKSIZE] = 36 + waveInfo[SUBCHUNK2SIZE];

			var wav = waveInfo[CHUNKID].concat(
			u32ToArray(waveInfo[CHUNKSIZE]),
			waveInfo[FORMAT],
			waveInfo[SUBCHUNK1ID],
			u32ToArray(waveInfo[SUBCHUNK1SIZE]),
			u16ToArray(waveInfo[AUDIOFORMAT]),
			u16ToArray(waveInfo[NUMCHANNELS]),
			u32ToArray(waveInfo[SAMPLERATE]),
			u32ToArray(waveInfo[BYTERATE]),
			u16ToArray(waveInfo[BLOCKALIGN]),
			u16ToArray(waveInfo[BITSPERSAMPLE]),
			waveInfo[SUBCHUNK2ID],
			u32ToArray(waveInfo[SUBCHUNK2SIZE]), (waveInfo[BITSPERSAMPLE] == 16) ? split16bitArray(audioData) : audioData);
			oldData.push(waveInfo);
			return 'data:audio/wav;base64,' + FastBase64.Encode(wav);
		}

		function get() {
			if (oldData.length) {
				var result = oldData.shift();
			} else {
				var result = [];
			}
			result.push( // 						OFFSET  SIZE NOTES
			[0x52, 0x49, 0x46, 0x46], // 		0 		4    "RIFF" = 0x52494646
			0, // 								4 		4    36+SubChunk2Size = 4+(8+SubChunk1Size)+(8+SubChunk2Size)
			[0x57, 0x41, 0x56, 0x45], // 		8 		4    "WAVE" = 0x57415645
			[0x66, 0x6d, 0x74, 0x20], // 		12		4    "fmt " = 0x666d7420
			16, // 								16		4    16 for PCM
			1, // 								20		2    PCM = 1
			1, // 								22		2    Mono = 1, Stereo = 2...
			8000, // 							24		4    8000, 44100...
			0, // 								28		4    SampleRate*NumChannels*BitsPerSample/8
			0, // 								32		2    NumChannels*BitsPerSample/8
			8, // 								34		2    8 bits = 8, 16 bits = 16
			[0x64, 0x61, 0x74, 0x61], // 		36		4    "data" = 0x64617461
			0 // 								40		4    data size = NumSamples*NumChannels*BitsPerSample/8
			);
			return result;
		}

		function length(ms, waveInfo) {
			var data = get();
			var sampleRate = (waveInfo && waveInfo[SAMPLERATE]) || data[SAMPLERATE];
			oldData.push(data);
			// length of data needed to last for 'ms' length
			return (ms / 1000) * sampleRate;
		}

		// struct

		function makeStruct(length, type) {
			structId++;
			structList[structId] = LIST_LINKED(type, length);
			return structId;
		}
		// function setStruct(id)

		function getStruct(id) {
			return structList[id];
		}

		// time

		function nowTime() {
			return now();
		}

		var micro = (function() {
			var loadTime;
			var performance = window.performance;
			if (performance && performance.now) {
				return function() {
					return performance.now();
				};
			} else {
				loadTime = now();
				return function() {
					return now() - loadTime;
				};
			}
		}())



		window.Config = {
			input: input,
			action: action,
			matchKey: matchKey,
			binding: binding,
			unbind: unbind,
			bind: bind
		};

		window.Control = {
			preventDefault: preventDefault,
			on: event.on,
			emit: event.emit,
			listen: listen,
			init: initControl
		};

		window.Entity = {};

		window.GUI = {
			template: template,
			remove: removeGUI,
			put: putGUI,
			get: getGUI,
			make: makeGUI,
			set: setGUI,
			on: event.on,
			emit: event.emit
		};

		window.Draw = {
			get canvas() {
				return canvas;
			},
			clear: clear,
			poly: poly,
			setup: setupDraw
		};

		window.Help = {
			itemRemove: itemRemove,
			indexRemove: indexRemove,
			has: has,
			splice: Splice
		};

		window.List = {
			size: size,
			get: getList,
			put: putList,
			linked: linked
		};

		window.Loop = {
			go: go,
			every: every,
			on: event.on,
			emit: event.emit,
		};

		window.Physics = {
			test: test,
			getVertices: getVertices
		};

		window.Player = {
			length: 6,
			register: register,
			find: find,
			init: initPlayer,
			isLocal: isLocal,
			togglePlayer: togglePlayer,
		};

		window.RiffWave = {
			length: length,
			get: get,
			make: make
		};

		window.Struct = {
			make: makeStruct,
			get: getStruct
		};

		window.Time = {
			now: nowTime,
			micro: micro
		};

		GUI_ON("ready", function() {
			Game.setup();
			register(0, 0, -1);
			initPlayer();
			Game.start();
		});
	});
}(navigator, window, document));