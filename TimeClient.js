var Time = Module(function(event) {
	var now = Date.now;

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
	return {
		now: nowTime,
		micro: micro
	};
});