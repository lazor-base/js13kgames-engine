/**
 * A client only script loader. pass strings as arguments, and listen for "load"
 *
 * @example
 * Load("file1.js","file2.js").on("load",function(){
 * 	// all javascript files have been parsed
 * });
 *
 * @method
 *
 * @param   {Object}   event Event system for this module.
 *
 * @returns {Function}       Returns a prepped Load function.
 */
var Load = Module(function(event) {
	var scriptsLength = 0;

	function name(text) {
		return text.replace(/\.(\w+)$/gi, '').replace(/^(.*)\//gi, '').replace(/\W/gi, "");
	}

	function getReady() {
		event.emit("loading");
	}

	event.on("loading", function() {
		scriptsLength--;
		if (scriptsLength === 0) {
			event.emit("load");
		}
	});

	var fn = function() {
		scriptsLength = arguments.length;
		for (var i = 0; i < arguments.length; i++) {
			var scriptName = name(arguments[i]);
			if (typeof global !== "undefined") {
				global[scriptName] = global.require(scriptName);
				getReady();
			} else {
				var script = document.getElementById(scriptName);
				if (!script) {
					script = document.createElement("script");
					script.setAttribute("id", scriptName);
				}
				script.setAttribute("src", arguments[i]);
				script.onload = getReady;
			}
		}
	};

	fn.on = event.on;
	fn.emit = event.emit;
	fn.get = function(name) {
		if (typeof global !== "undefined") {
			return global[name];
		} else {
			return window[name];
		}
	};

	return fn;
});