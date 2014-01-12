var Command = Module(function() {

	var commandList = [];
	var history = [];
	var executeListeners = [];

	function forEach(fn) {
		for (var i = 0; i < commandList.length; i++) {
			fn(commandList[i], i, commandList);
		}
	}



	function process(deltaTime) {
		function processCommands(command, index, commandList) {
			execute(command, false, deltaTime);
		}
		forEach(processCommands);
	}

	function execute(command, notYetPushed, deltaTime) {
		if (time.now() >= command[TIMESTAMP]) {
			for (var i = 0; i < executeListeners.length; i++) {
				executeListeners[i](command, deltaTime, time.now() - command[TIMESTAMP]);
			}
			if (!notYetPushed) {
				history.push(HELP_ITEM_REMOVE(commandList, command));
			}
		} else {
			return false;
		}
	}

	function push(command) {
		if (execute(command, true) === false) {
			commandList.push(command);
			return true;
		}
	}

	function onExecute(fn) {
		executeListeners.push(fn);
	}

	return {
		forEach: forEach,
		process: process,
		onExecute: onExecute,
		push: push
	};
});
if (typeof module !== "undefined") {
	module.exports = Command;
}