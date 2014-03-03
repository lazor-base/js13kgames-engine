var Command = Module(function(event) {
	// name: List
	// target: Client,Server
	// filenames: Engine,Command

	// variables
	var commandList = [];
	var commandStructId;
	var commandStruct;
	// end variables

	// functions

	function processCommand(deltaTime) {
		commandStruct.each(function(command) {
			executeCommand(command, deltaTime);
		});
	}

	function newCommand(remoteId, ping, timeStamp, action, value) {
		var command = commandStruct.get();
		command.set(COMMAND_REMOTE_ID, remoteId);
		command.set(COMMAND_PING, ping);
		command.set(COMMAND_TIMESTAMP, timeStamp);
		command.set(COMMAND_ACTION, action);
		command.set(COMMAND_VALUE, value);
		return executeCommand(command);
	}

	function executeCommand(command, deltaTime) {
		var timeStamp = command.get(COMMAND_TIMESTAMP);
		if (time.now() >= timeStamp) {
			EMIT_EVENT("executeCommand", command, deltaTime, TIME_NOW() - timeStamp);
			LIST_PUSH(command);
			return true;
		} else {
			return false;
		}
	}

	function pushCommand(command) {
		return executeCommand(command);
	}

	// end functions
	// other
	DRAW_ON("RenderReady", function() {
		commandStructId = STRUCT_MAKE(5, "f32");
		commandStruct = STRUCT_GET(commandStructId);

	});
	// end other

	return {
		// returns
		process: processCommand,
		on: event.on,
		make: newCommand,
		// end returns
	};
});
if (typeof module !== "undefined") {
	module.exports = Command;
}