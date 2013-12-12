var Struct = Module(function(event) {
	var structList = {};
	var structId = 0;

	function makeStruct(length, type) {
		structList[structId++] = List.linked(type, length);
		return structId;
	}
	// function setStruct(id)

	function getStruct(id) {
		return structList[id];
	}
	return {
		make: makeStruct,
		get: getStruct
	};
});