// requires server.js and typedList.js

var Message = Module(function(event) {
	// name: message

	// variables
	var messageQueue = [];
	var targetQueue = [];
	var message = [];
	var indexes = [];
	var arrays = [
		[],
		[],
		[],
		[],
		[],
		[],
		[]
	];
	var encoders = {};
	var decoders = {};
	var codes = {
		scheme: [],
		name: []
	};
	for (var type in List.types) {
		encoders[type] = encoder(type);
		decoders[type] = decoder(type);
	}
	// end variables

	// functions
	function splice(array, start, howMany) {
		return Array.prototype.splice.call(array, start, howMany);
	}

	function register(type) {
		codes[type].concat(splice(arguments, 1, arguments.length));
		return codes[type].length;
	}

	function decoder(description) {
		var bytes = LIST_SIZE(description);
		var arr = LIST_GET(1, description);
		var char = new Uint8Array(arr.buffer);
		return function(string, offset) {
			// Again, pay attention to endianness
			// here in production code.
			for (var i = 0; i < bytes; ++i) {
				char[i] = string.charCodeAt(offset + i);
			}

			return arr.get(0);
		};
	};

	function encoder(description) {
		var arr = LIST_GET(1, description);
		var char = new Uint8Array(arr.buffer);
		return function(number) {
			arr.set(0, number);
			// In production code, please pay
			// attention to endianness here.
			return String.fromCharCode.apply(String, char);
		};
	};

	function encode(encoderArray, array) {
		var result = "";
		for (var i = 0; i < array.length; i++) {
			result += encoders[encoderArray[i]](array[i]);
		}
		return result;
	}

	function decode(string) {
		var charactersRead = 0;
		while (charactersRead < string.length) {
			var message = arrays.shift();
			message.length = 0;
			message.push(str.charCodeAt(charactersRead));
			charactersRead++;
			var decodeScheme = str.charCodeAt(charactersRead);
			var decoderArray = codes.scheme[decodeScheme];
			charactersRead++;
			for (var i = 0; i < decoderArray.length; i++) {
				message.push(decoders[decoderArray[i]](string, charactersRead));
				charactersRead += LIST_SIZE(decoderArray[i]);
			}
			// when we've finished, fire off an event.
			this.emit.apply(this, message);
			arrays.push(message)
		}
	}
	/**
	 * Call this function to send a message
	 *
	 * @method  send
	 *
	 * @param   {String} name         Must be a preregistered name. Refer to register()
	 * @param   {Number} decodeScheme Must be a preregistered scheme. Refer to register()
	 *
	 */

	function send(name, decodeScheme, target) {
		var name = name.charCodeAt(codes.name.indexOf(name));
		var encoderArray = codes.scheme[decodeScheme];
		var decodeScheme = String.charCodeAt(decodeScheme);
		var data = encode(encoderArray, splice(arguments, 2, arguments.length));
		messageQueue.push(name + decodeScheme + data);
		targetQueue.push(target);
	}

	/**
	 * Send all currently pooled messages
	 *
	 * @method  ship
	 *
	 */

	function ship() {
		while (targetQueue.length) {
			message.length = 0;
			var target = targetQueue[0];
			for (var i = 0; i < targetQueue.length; i++) {
				if (targetQueue[i] === target) {
					indexes.push(i);
				}
			}
			while (indexes.length) {
				var index = indexes.shift();
				HELP_REMOVE_INDEX(targetQueue, index);
				message.push(HELP_REMOVE_INDEX(messageQueue, index));
			}
			server.send(message.join(""), target);
		}
		messageQueue.length = 0;
	}

	/**
	 * Call dock() when a message is received.
	 *
	 * @method  dock
	 *
	 * @param   {String} string Received string.
	 *
	 */

	function dock(string) {
		console.log(string)
		decode(string);
	}
	// end functions

	// other
	// end other

	return {
		// return
		register: register,
		send: send,
		dock: dock,
		ship: ship,
		on: event.on,
		emit: event.emit,
		// end return
	};
});
if (typeof module !== "undefined") {
	module.exports = Message;
}