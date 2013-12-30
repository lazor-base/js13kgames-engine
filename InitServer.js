var Module = Module || null;
var Load = Load || null;
var Init = (function(Module, Load) {
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

	function startGame() {
		Server.start();
		GUI_ON("ready", function() {
			Game.setup();
			PLAYER_REGISTER(0, 0, -1);
			PLAYER_INIT();
			Game.start();
		});
	}

	process.on("uncaughtException", function(err) {
		console.error(err.message, err.stack);
	});
	var Help = global.Help = require("./Help.js");
	var Module = global.Module = require("./Module.js");
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

		var fn = function() {
			var args = arguments;
			scriptsLength = args.length;
			for (var i = 0; i < args.length; i++) {
				var scriptName = "./" + args[i] + ".js";
				global[args[i]] = require(scriptName);
				scriptsReady();
			}
			return this;
		};

		fn.on = event.on;
		fn.emit = event.emit;
		return fn;
	});

	Load(SERVER, COMMAND, ENTITY, LIST, LOOP, MESSAGE, TIME, GAME, PHYSICS);
	Load.on("loadLocal", startGame);
}(Module, Load));
if (typeof module !== "undefined") {
	module.exports = Init;
}