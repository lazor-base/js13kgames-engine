// name: list

var List = Module(function() {
	// variables
	var NULL = null;
	var created = 0;
	var LENGTH = "length";
	var NEXT = "next";
	var ARRAY = "array";
	var oldArrays = [];
	var types = {
		u8: Uint8Array,
		u16: Uint16Array,
		u32: Uint32Array,
		s8: Int8Array,
		s16: Int16Array,
		s32: Int32Array,
		f32: Float32Array,
		f64: Float64Array
	};
	// end variables

	/**
	 * Helper function to get byte size of each array, since the text is lengthy.
	 *
	 * @method  size
	 *
	 * @param   {String} description   first character indicates signed with u[nsigned] or s[igned], second character indicates float with f[loat] or i[nt] followed by a number indicating size
	 *
	 * @returns {Number}
	 */

	 // functions
	function size(description) {
		return types[description].BYTES_PER_ELEMENT;
	}

	/**
	 * Multipurpose function to either store an old array, or return an old array for reuse.
	 * If recycling an array, leave all parameters but the first one empty. If selecting an
	 * array, fill all parameters.
	 *
	 * @method  recycle
	 *
	 * @param   {Number} array         old array to store, OR, Number of entries in the array
	 * @param   {String} description   first character indicates signed with u[nsigned] or s[igned], second character indicates float with f[loat] or i[nt] followed by a number indicating size
	 *
	 * @returns {}        [description]
	 */

	function putList(array, description) {
		if (array && !description) {
			if (!Help.has(oldArrays, array)) {
				oldArrays.push(array);
			}
		} else if (oldArrays[LENGTH] && array && description) {
			var firstElement = oldArrays[0];
			var element = oldArrays.shift();
			do {
				if (element.buffer.byteLength === array * size(description)) {
					element.each(function(item,index) {
						element.set(index,0);
					});
					return element;
				}
				oldArrays.push(element);
				element = oldArrays.shift();
			} while (element !== firstElement);
			oldArrays.push(element);
			return false;
		} else {
			return false;
		}
	}
	/**
	 * Reuse a recycled typedArray or make a new one if we don't have the right size.
	 *
	 * @method  get
	 *
	 * @param   {Number} entries        Number of entries in the array
	 * @param   {String} description    first character indicates signed with u[nsigned] or s[igned], second character indicates float with f[loat] or i[nt] followed by a number indicating size
	 *
	 * @returns {Object}         New typedList Object
	 */

	function getList(entries, description) {
		var result = putList(entries, description);
		if (!result) {
			result = new Node(entries, description);
		}
		result.view(description);
		return result;
	}

	/**
	 * Starts up a new typedList Object.
	 *
	 * @method  Node
	 *
	 * @param   {Number} entries        Number of entries in the array
	 * @param   {String} description    first character indicates signed with u[nsigned] or s[igned], second character indicates float with f[loat] or i[nt] followed by a number indicating size
	 *
	 * @returns {Object}         New typedList Object
	 */

	function Node(entries, description) {
		created++;
		this.buffer = new ArrayBuffer(entries * size(description));
	}

	Node.prototype = {
		next: NULL,
		prev: NULL,
		list: NULL,
		get length() {
			return this[ARRAY][LENGTH]
		},
		each: function(fn) {
			for (var i = 0; i < this[LENGTH]; i++) {
				var result = fn(this[ARRAY][i], i, this[ARRAY]);
				if (typeof result !== "undefined") {
					return result;
				}
			}
		},
		view: function(description) {
			return this[ARRAY] = new types[description](this.buffer);
		},
		set: function(index, value) {
			this[ARRAY][index] = value;
		},
		get: function(index) {
			return this[ARRAY][index];
		},
		remove: removeList
	};

	/**
	 * Remove a node from a linkedList
	 *
	 * @method  remove
	 *
	 */

	function removeList() {
		var node = this;
		var next = node[NEXT];
		var previous = node.prev;
		next.prev = previous;
		previous[NEXT] = next;
		node[NEXT] = NULL;
		node.prev = NULL;
		node.list = NULL;
		putList(node);
	}

	/**
	 * Adds a node or nodes to a linkedList
	 *
	 * @method  push
	 *
	 */

	function pushList() {
		var linkedList = this;
		for (var i = 0; i < arguments[LENGTH]; i++) {
			var previous = linkedList.last;
			var next = arguments[i];
			if (!linkedList.first) {
				// we need to set the first node
				linkedList.first = next;
			} else {
				// if the previous node exists, point it to the new node
				previous[NEXT] = next;
			}
			next.prev = previous;
			next.list = linkedList;
			linkedList.last = next;
		}
	}

	function eachList(fn) {
		var item = this.first;
		do {
			var result = fn(item);
			item = item[NEXT];
			if (typeof result !== "undefined") {
				return result;
			}
		} while (item !== null);
	}

	/**
	 * Creates a new linkedList. Specify type and length to make all lists in the chain the same.
	 *
	 * @method  linked
	 *
	 * @returns {Object}
	 */

	function linked(description, entries) {
		var list = {
			push: pushList,
			each: eachList,
			first: NULL,
			last: NULL
		};
		if (description) {
			list.get = function() {
				var result = getList(entries, description);
				this.push(result);
				return result;
			};
		}
		return list;
	}
	// end functions

	// other
	// end other

	return {
		// return
		size: size,
		get: getList,
		put: putList,
		linked: linked
		// end return
	};
});
if (typeof module !== "undefined") {
	module.exports = List;
}