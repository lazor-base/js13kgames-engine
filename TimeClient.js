var Time = Module(function(event) {
	// name: timeclient

	// variables
	var now = Date.now;
	// variables

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
	}())
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