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
	var types = {};
	types[UINT4] = Uint8Array;
	types[UINT8] = Uint8Array;
	types[UINT12] = Uint16Array;
	types[UINT16] = Uint16Array;
	types[UINT32] = Uint32Array;
	types[INT8] = Int8Array;
	types[INT16] = Int16Array;
	types[INT32] = Int32Array;
	types[FLOAT32] = Float32Array;
	types[FLOAT64] = Float64Array;
	var buffers = {
		i4: new ArrayBuffer((1048576 * 4) / 8),
		i8: new ArrayBuffer((1048576 * 8) / 8),
		i12: new ArrayBuffer((10240 * 12) / 8),
		i16: new ArrayBuffer((524288 * 16) / 8),
		i32: new ArrayBuffer((10240 * 32) / 8)
	};
	var usedIndexes = {
		i4: new Uint8Array((1048576 * 1) / 8),
		i8: new Uint8Array((1048576 * 1) / 8),
		i12: new Uint8Array((10240 * 1) / 8),
		i16: new Uint8Array((524288 * 1) / 8),
		i32: new Uint8Array((10240 * 1) / 8)
	};
	var lastSelectedNumbers = {
		i4: -1,
		i8: -1,
		i12: -1,
		i16: -1,
		i32: -1
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

	function translate(description) {
		if (description === UINT4) {
			return "i4";
		} else if (description % UINT8 === 0) {
			return "i8";
		} else if (description % UINT16 === 0) {
			return "i16";
		} else if (description % UINT32 === 0) {
			return "i32";
		} else if (description === UINT12) {
			return "i12";
		} else if (description === FLOAT64) {
			return "i64";
		}
	}

	function getFunctions(view, bufferView, index) {
		if (view === "i8" || view === "i16" || view === "i32") {
			return bufferView[index];
		} else if (view === "i12") {
			return getBits(12, index, bufferView);
		} else if (view === "i4") {
			return getBits(4, index, bufferView);
		}
	}

	function setFunctions(view, bufferView, index, value) {
		if (view === "i8" || view === "i16" || view === "i32") {
			bufferView[index] = value;
		} else if (view === "i12") {
			setBits(12, index, value, bufferView);
		} else if (view === "i4") {
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

	function get8bit(index, bufferView) {
		var v = bufferView[index >> 3];
		if (v === undefined) {
			return NaN;
		}
		var off = index & 0x7;
		return (v >> (7 - off)) & 1;
	}

	function set8bit(index, value, bufferView) {
		var off = index & 0x7;
		if (value) {
			bufferView[index >> 3] |= (0x80 >> off);
		} else {
			bufferView[index >> 3] &= ~ (0x80 >> off);
		}
	}

	function setBit(index, value, bufferView) {
		var offset = 7 - (index & 7); // keeps the number below 8
		var decimal = bufferView[index >> 3];
		var binary = toBinaryString(decimal, 8);
		binary = changeCharacter(binary, offset, value);
		bufferView[index >> 3] = toDecimal(binary);
		var decimal = bufferView[index >> 3];
	};

	function getBits(bits, index, bufferView) {
		var startIndex = Math.floor(((index * bits)) / 8);
		var number = "";
		for (var i = 0; i < bits; i++) {
			var offset = (index * bits) + i;
			number += "" + getBit(offset, bufferView);
		}
		return toDecimal(number);
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
		for (var i = 0; i < list.views[LENGTH]; i++) {
			list.set(i, 0);
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
					var name = array.types[i];
					var arrayToSplice = usedIndexes[name];
					// arrayToSplice[index] = 0;
					set8bit(index, 0, arrayToSplice);
				}
				array.indexes.length = 0;
				array.views.length = 0;
				oldArrays.push(array);
			}
		} else {
			return false;
		}
	}


	function getList(entries, description) {
		if(typeof description === "string") {
			console.trace();
			throw new Error("Expected description to be a number, instead it was:"+description)
		}
		var result;

		if (oldArrays.length > 0) {
			result = oldArrays.pop();
		} else {
			result = new Node();
		}
		result.setup(entries, description);
		return result;
	}

	function nameOf(description) {
		return description.charAt(1) + description.charAt(2);
	}

	function Node() {}

	function indexOf(array, item) {
		var length = array.length;
		for (var i = length; i--;) {
			if (array[i] === item) {
				return i;
			}
		}
		return -1;
	}

	Node.prototype = {
		next: NULL,
		prev: NULL,
		list: NULL,
		setup: function(entries, description) {
			var index = -1;
			var found = false;
			if (this.indexes) {
				this.indexes.length = entries;
				this.views.length = entries;
				this.types.length = entries;
			} else {
				this.indexes = [];
				this.views = [];
				this.types = [];
			}
			var type = translate(description);
			for (var i = 0; i < entries; i++) {
				index = lastSelectedNumbers[type] + 1;
				found = false;
				var result = get8bit(index, usedIndexes[type]);
				if (result === 0) { // not used
					set8bit(index, 1, usedIndexes[type]);
					this.indexes[i] = (index);
					this.views[i] = (description);
					this.types[i] = (type);
				} else {
					var restart = false;
					while (found === false) {
						index++;
						if (index > 1279) {
							if (restart) {
								throw new Error("There are no more indexes in :" + type)
							}
							restart = true;
							index = 0;
						}
						if (get8bit(index, usedIndexes[type]) === 0) {
							found = true;
							set8bit(index, 1, usedIndexes[type]);
							this.indexes[i] = (index);
							this.views[i] = (description);
							this.types[i] = (type);
						}
					}
				}
				lastSelectedNumbers[type] = index;
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
			if(index >= this.indexes.length) {
				console.trace();
				throw new Error("Index out of bounds!")
			}
			if(index === undefined) {
				console.trace();
				throw new Error("Undefined index!");
			}
			var internalIndex = this.indexes[index];
			var view = this.views[index];
			var name = this.types[index];
			var bufferView = new types[view](buffers[name]);
			var maximum = maxValue[name];
			if (value > maximum) {
				value = maximum;
			} else if (value < 0 && value < -maximum) {
				value = -maximum;
			}
			return setFunctions(name, bufferView, internalIndex, value);
		},
		get: function(index) {
			if(index >= this.indexes.length) {
				console.trace();
				throw new Error("Index out of bounds!")
			}
			if(index === undefined) {
				console.trace();
				throw new Error("Undefined index!");
			}
			var internalIndex = this.indexes[index];
			var view = this.views[index];
			var name = this.types[index];
			var bufferView = new types[view](buffers[name]);
			return getFunctions(name, bufferView, internalIndex);
		},
		toString: function() {
			var string = "[";
			for (var i = 0; i < this.views[LENGTH]; i++) {
				string += this.get(i);
				if (i + 1 !== this.views[LENGTH]) {
					string += ", ";
				}
			}
			string += "]";
			return string;
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