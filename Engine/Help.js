var Help = (function() {
	// name: Help
	// target: Client,Test
	// filenames: Engine,Engine

	// variables
	var LENGTH = "length";
	var array = [];
	var shift = array.shift;
	var push = array.push;
	// end variables

	// functions
	var Splice = (function() {
		var helper = [];
		var returnItems = [];
		var id = 0;
		return function(array, index, howMany) {
			helper[LENGTH] = 0;
			returnItems[LENGTH] = 0;
			id = 0;
			while (array[LENGTH]) {
				var item = shift.call(array);
				if (id >= index && id <= index + howMany) {
					returnItems.push(item);
				} else {
					helper.push(item);
				}
				id++;
			}
			while (helper[LENGTH]) {
				push.call(array, helper.shift());
			}
			return returnItems.pop();
		};
	}());

	function itemRemove(array, item) {
		var index = 0;
		if (typeof item !== "undefined") {
			index = array.indexOf(item);
		}
		return indexRemove(array, index);
	}

	function indexRemove(array, index) {
		return Splice(array, index, 1);
	}

	function has(array, item) {
		return Array.prototype.indexOf.call(array, item) > -1;
	}
	// end functions

	// other
	// end other

	return {
		// return
		itemRemove: itemRemove,
		indexRemove: indexRemove,
		has: has,
		splice: Splice
		// end return
	};


}());
if (typeof module !== "undefined") {
	module.exports = Help;
}