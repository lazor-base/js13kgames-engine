var List = Module(function() {
	// name: List
	// target: Client,Test
	// filenames: Engine,Engine
	// variables
	var NULL = null;
	var created = 0;
	var LENGTH = "length";
	var NEXT = "next";
	var ARRAY = "array";
	var oldArrays = [];
	var types = {
		u4: Uint8Array,
		u8: Uint8Array,
		u12: Uint16Array,
		u16: Uint16Array,
		u32: Uint32Array,
		s8: Int8Array,
		s16: Int16Array,
		s32: Int32Array,
		f32: Float32Array,
		f64: Float64Array
	};
	var buffers = {
		i4: new ArrayBuffer((4 / 8) * 10240),
		i8: new ArrayBuffer((8 / 8) * 10240),
		i12: new ArrayBuffer((12 / 8) * 10240),
		i16: new ArrayBuffer((16 / 8) * 10240),
		i32: new ArrayBuffer((32 / 8) * 10240)
	};
	var usedIndexes = {
		i4: [],
		i8: [],
		i12: [],
		i16: [],
		i32: []
	};
	var maxValue = {
		i4: Math.pow(2, 4) - 1,
		i8: Math.pow(2, 8) - 1,
		i12: Math.pow(2, 12) - 1,
		i16: Math.pow(2, 16) - 1,
		i32: Math.pow(2, 32) - 1
	};
	// end variables

	// functions

	function getFunctions(view, bufferView, index, sign) {
		if (["32", "16", "8"].indexOf(view) > -1) {
			return bufferView[index];
		} else if (view === "12") {
			// return getInt12(index, bufferView);
			return getBits(12, index, bufferView, sign);
		} else if (view === "4") {
			// return getInt4(index, bufferView);
			return getBits(4, index, bufferView, sign);
		}
	}

	function setFunctions(view, bufferView, index, value) {
		if (["32", "16", "8"].indexOf(view) > -1) {
			bufferView[index] = value;
		} else if (view === "12") {
			// setInt12(index, value, bufferView);
			setBits(12, index, value, bufferView);
		} else if (view === "4") {
			// setInt4(index, value, bufferView);
			setBits(4, index, value, bufferView);
		}
	}

	function pad(width, string, padding) {
		return (width <= string.length) ? string : pad(width, padding + string, padding)
	}

	function changeCharacter(string, index, value) {
		return string.substr(0, index) + value + string.substr(index + 1);
	}

	function toBinaryString(decimal, padding) {
		return pad(padding, parseFloat(decimal, 10).toString(2), "0").replace("-", "").replace("+", "");
	}

	function toDecimal(binary) {
		if (binary.indexOf(".") > -1) {
			return parseFloat(binary, 2);
		} else {
			return parseInt(binary, 2);
		}
	}

	function getBit(index, bufferView) {
		var decimal = bufferView[index >> 3];
		var binary = toBinaryString(decimal, 8);
		var offset = 7 - (index & 7); // keeps the number below 8
		return parseInt(binary[offset], 10);
	};

	function setBit(index, value, bufferView) {
		var offset = 7 - (index & 7); // keeps the number below 8
		var decimal = bufferView[index >> 3];
		var binary = toBinaryString(decimal, 8);
		binary = changeCharacter(binary, offset, value);
		bufferView[index >> 3] = toDecimal(binary);
		var decimal = bufferView[index >> 3];
	};

	function getBits(bits, index, bufferView, sign) {
		var startIndex = Math.floor(((index * bits)) / 8);
		var number = "";
		for (var i = 0; i < bits; i++) {
			var offset = (index * bits) + i;
			number += "" + getBit(offset, bufferView);
		}
		return toDecimal((sign || "+") + number);
	}

	function setBits(bits, index, value, bufferView) {
		var startIndex = Math.floor(((index * bits)) / 8);
		var binaryValue = toBinaryString(value, bits);
		for (var i = 0; i < bits; i++) {
			var offset = (index * bits) + i;
			setBit(offset, binaryValue[i], bufferView);
		}
	}

	function size(description) {
		return types[description].BYTES_PER_ELEMENT;
	}

	function cleanList(list) {
		for (var i = 0; i < list.array.length; i++) {
			list.array[i] = 0;
		}
		return list;
	}



	function putList(array) {
		if (array) {
			if (!HELP_HAS(oldArrays, array)) {
				var next = array[NEXT];
				var previous = array.prev;
				var list = array.list;
				if (next) {
					next.prev = previous;
				}
				if (previous) {
					previous[NEXT] = next;
				}
				if (list) {
					if (list.first === array) {
						if (next) {
							list.first = next;
						}
					}
					if (list.last === array) {
						if (prev) {
							list.last = prev;
						}
					}
				}
				array[NEXT] = NULL;
				array.prev = NULL;
				array.list = NULL;
				for (var i = 0; i < array.indexes.length; i++) {
					var index = array.indexes[i];
					array.set(i, 0);

					var arrayToSplice = usedIndexes["i" + nameOf(array.views[i])];
					var itemToRemove = arrayToSplice.indexOf(index);
					arrayToSplice.splice(itemToRemove, 1);
				}
				array.indexes.length = 0;
				array.views.length = 0;
				oldArrays.push(array);
			}
		} else {
			return false;
		}
	}


	function getList() {
		var args = arguments;
		var result;

		if (oldArrays.length > 0) {
			result = oldArrays.pop();
		} else {
			result = new Node();
		}
		result.setup.apply(result, args);
		return result;
	}

	function nameOf(description) {
		return description.charAt(1) + description.charAt(2);
	}

	function Node() {}

	Node.prototype = {
		next: NULL,
		prev: NULL,
		list: NULL,
		setup: function(entries, description) {
			var args = arguments;
			this.indexes = [];
			this.views = [];
			var length = 0;
			var type = "";
			var index = -1;
			var found = false;
			var entriesIsString = typeof entries === "string";
			if (entriesIsString) {
				length = args.length;
			} else {
				length = entries;
			}
			for (var i = 0; i < length; i++) {
				if (entriesIsString) {
					type = "i" + nameOf(args[i]);
				} else {
					type = "i" + nameOf(description);
				}
				index = -1;
				found = false;
				while (found === false) {
					index++;
					if (!HELP_HAS(usedIndexes[type], index)) {
						found = true;
						usedIndexes[type].push(index);
						this.indexes.push(index);
						if (entriesIsString) {
							this.views.push(args[i]);
						} else {
							this.views.push(description);
						}
					}
				}
			}

		},
		get length() {
			return this.views[LENGTH];
		},
		each: function(fn) {
			for (var i = 0; i < this.views[LENGTH]; i++) {
				fn(this.get(i), i);
			}
		},
		set: function(index, value) {
			var internalIndex = this.indexes[index];
			var view = this.views[index];
			var bufferView = new types[view](buffers["i" + nameOf(view)]);
			var maximum = maxValue["i" + nameOf(view)];
			if (value > maximum) {
				value = maximum;
			} else if (value < 0 && value < -maximum) {
				value = -maximum;
			}
			return setFunctions(nameOf(view), bufferView, internalIndex, value);
		},
		get: function(index, sign) {
			var internalIndex = this.indexes[index];
			var view = this.views[index];
			// console.log(view, this.views, index)
			var bufferView = new types[view](buffers["i" + nameOf(view)]);
			return getFunctions(nameOf(view), bufferView, internalIndex, sign);
		}
	};


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
		var item;
		var previous = null;
		var item = this.first;
		var next = item[NEXT];
		do {
			fn(item);
			previous = item;
			if (item.list === null) {
				if (previous === null) {
					if (this.first !== item) {
						item = this.first
					} else {
						item = null;
					}
				} else {
					if (previous[NEXT] !== item) {
						item = previous[NEXT];
					} else {
						item = null;
					}
				}
			} else {
				if (item[NEXT]) {
					item = item[NEXT];
				} else {
					item = null;
				}
			}
		} while (item !== null);
	}



	function linked() {
		var args = arguments;
		var list = {
			push: pushList,
			each: eachList,
			first: NULL,
			last: NULL
		};
		if (args.length > 0) {
			list.get = function() {
				var result = getList.apply(this, args);
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
		clean: cleanList,
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