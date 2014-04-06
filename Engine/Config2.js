Module(function() {
	"use strict";
	// name: Config
	// targets: Client
	// filenames: Engine
	// variables

	var defaultControls = IO_READ("keymap.json");
	var conciseKeys;

	// end variables
	// functions

	function defaultKeyMap() {
		if (!conciseKeys) {
			conciseKeys = {};
			for (var attr in defaultControls) {
				for (var i = 0; i < defaultControls[attr].controls; i++) {
					var option = defaultControls[attr].controls[i];
					if (!conciseKeys[option.category]) {
						conciseKeys[option.category] = {};
					}
					conciseKeys[attr][option.command] = option.keys;
				}
			}
		}
		return conciseKeys;
	}

	// end functions
	// other

	// end other
	return {
		// return
		defaults: defaultKeyMap
		// end return
	};
});