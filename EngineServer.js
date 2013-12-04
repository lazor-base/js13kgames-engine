var Engine = (function() {
	process.on("uncaughtException", function(err) {
		console.error(err.message, err.stack);
	});
	var SERVER = "Server";
	var GAME = "Game";
	var PLAYER = "Player";
	var COMMAND = "Command";
	var ENTITY = "Entity";
	var LIST = "List";
	var LOOP = "Loop";
	var MESSAGE = "Message";
	var TIME = "Time";
	var PHYSICS = "Physics";

	// time
	var now = Date.now;
	var serverTime = now();

	// Help
	var LENGTH = "length";
	var arrayProto = Array.prototype;
	var shift = arrayProto.shift;
	var push = arrayProto.push;

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
		if (typeof item !== "undefined") {
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

	function nowTime() {
		return now();
	}

	var micro = (function() {
		var getNanoSeconds, hrtime, loadTime;
		var performance = window.performance;
		var process = process;
		if (performance && performance.now) {
			return function() {
				return performance.now();
			};
		} else if (process && process.hrtime) {
			hrtime = process.hrtime;
			getNanoSeconds = function() {
				var hr;
				hr = hrtime();
				return hr[0] * 1e9 + hr[1];
			};
			loadTime = getNanoSeconds();
			return function() {
				return (getNanoSeconds() - loadTime) / 1e6;
			};
		} else {
			loadTime = now();
			return function() {
				return now() - loadTime;
			};
		}
	}());

	/**
	 * Converts functions into a module with events.
	 *
	 * @method Module
	 *
	 * @param  {Function} fn Uninitialized function to convert into a module.
	 */

	function Module(fn) {
		if (typeof global !== "undefined") {
			return module.exports = fn(new(require("events").EventEmitter));
		} else {
			return fn({
				on: function(name, callback) {
					document.addEventListener(name, function(event) {
						if (event.detail === undefined) {
							callback();
						} else if (typeof event.detail[0] !== "undefined") {
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
	}

	global.Module = Module;

	global[TIME] = {
		now: nowTime,
		micro: micro
	};

	global.Help = {
		itemRemove: itemRemove,
		indexRemove: indexRemove,
		has: has,
		splice: Splice
	};

	var pre = "./";
	var post = ".js";
	global[SERVER] = require(pre + SERVER + post);
	global[COMMAND] = require(pre + COMMAND + post);
	global[ENTITY] = require(pre + ENTITY + post);
	global[LIST] = require(pre + LIST + post);
	global[LOOP] = require(pre + LOOP + post);
	global[MESSAGE] = require(pre + MESSAGE + post);
	global[GAME] = require(pre + GAME + post);
	global[PHYSICS] = require(pre + PHYSICS + post);
	global.Server.start();
	global.Game.setup();
	global.Game.start();
}());
if (typeof module !== "undefined") {
	module.exports = Engine;
}