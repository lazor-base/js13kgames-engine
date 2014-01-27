var Config = Module(function() {
	// name: Config
	// targets: Client
	// filenames: Engine

	// variables
	var hardware = {};
	var actions = 0;
	// end variables

	// functions
	function bind(type, id, action, keyCode) {
		var uniqueId = "" + type + id;
		hardware[type][uniqueId].set(action, keyCode);
	}

	function unbind(type, id, action) {
		bind(type, id, action, -1);
	}

	function binding(type, uniqueId, action) {
		return hardware[type][uniqueId].get(action);
	}

	function matchKey(type, id, keyCode, match) {
		var uniqueId = "" + type + id;
		var result = hardware[type][uniqueId].each(function(key, action) {
			if (key === keyCode) {
				match(action);
			}
		});
	}

	function action() {
		actions =+ arguments.length;
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
	// end functions

	// other
	// end other

	return {
		// return
		get length() {
			return actions;
		},
		input: input,
		action: action,
		matchKey: matchKey,
		binding: binding,
		unbind: unbind,
		bind: bind
		// end return
	};
});
if (typeof module !== "undefined") {
	module.exports = Config;
}