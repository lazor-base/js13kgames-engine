var Time = Module(function() {
	// name: Time
	// target: Client
	// filenames: Engine

	// variables
	var now = Date.now;
	// end variables

	// functions

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
	}());
	// end functions

	// other
	// end other

	return {
		// return
		now: nowTime,
		micro: micro
		// end return
	};
});