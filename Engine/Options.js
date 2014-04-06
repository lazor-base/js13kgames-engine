Module(function() {
	"use strict";
	// name: Options
	// targets: Client
	// filenames: Engine
	// variables

	var defaultOptionsObject = IO_READ("config.json");
	var conciseOptions;

	// end variables
	// functions

	function defaultOptions() {
		if (!conciseOptions) {
			conciseOptions = {};
			for (var i=0;i<defaultOptionsObject.options;i++) {
				var option = defaultOptionsObject.options[i];
				if(!conciseOptions[option.category]) {
					conciseOptions[option.category] = {};
				}
				conciseOptions[option.category][option.id] = option.value;
			}
		}
		return conciseOptions;
	}

	// end functions
	// other

	// end other
	return {
		// return
		defaults: defaultOptions
		// end return
	};
});