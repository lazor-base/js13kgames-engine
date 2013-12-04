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
					if(event.detail === undefined) {
						callback();
					} else if (typeof event.detail[0] !== "undefined") {
						callback.apply(window, event.detail); // should be accessible as arguments, not as an array
					} else {
						callback.call(window, event.detail); // only one argument
					}
				}, false);
			},
			emit: function(name) {
				var args = Array.prototype.splice.call(arguments, 1, arguments.length - 1); // all arguments but the name
				var myEvent = new CustomEvent(name, {
					detail: args
				});
				document.dispatchEvent(myEvent);
			}
		});
	}
}
if (typeof module !== "undefined") {
	module.exports = Module;
}