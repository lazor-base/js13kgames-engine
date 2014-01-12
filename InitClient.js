var Module = Module || null;
var Load = Load || null;
var Init = (function(Module, Load) {
	var GAME = "Game";
	var CONFIG = "Config";
	var CONTROL = "Control";
	var PLAYER = "Player";
	var COMMAND = "Command";
	var ENTITY = "Entity";
	var LIST = "List";
	var LOOP = "Loop";
	var TIME = "Time";
	var PHYSICS = "Physics";
	var _GUI = "GUI";
	var DRAW = "Draw";
	var RIFFWAVE = "RiffWave";

	function startGame() {
		GUI_ON("ready", function() {
			Game.setup();
			PLAYER_REGISTER(0, 0, -1);
			PLAYER_INIT();
			Game.start();
		});
	}

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

		function scriptsReady() {
			scriptsLength--;
			if (scriptsLength === 0) {
				event.emit("loadLocal");
			}
		}

		function error() {
			console.error("LOAD_ERROR");
		}

		function local(address, id, fn) {
			var script = document.getElementById(id);
			if (!script) {
				script = document.createElement("script");
				script.setAttribute("id", id);
			}
			script.setAttribute("src", address);
			script.onload = fn;
			script.onerror = error;
			document.head.appendChild(script);
		}

		var fn = function() {
			var args = arguments;
			scriptsLength = args.length;
			for (var i = 0; i < args.length; i++) {
				var scriptName = "./" + args[i] + ".js";
				local(scriptName, args[i], scriptsReady)
			}
			return this;
		};

		fn.on = event.on;
		fn.emit = event.emit;
		return fn;
	});

	Load(COMMAND, CONFIG, CONTROL, ENTITY, GAME, LIST, LOOP, PLAYER, TIME, PHYSICS, _GUI, DRAW, RIFFWAVE);
	Load.on("loadLocal", startGame);
}(Module, Load));