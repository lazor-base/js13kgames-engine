var Structure = Module(function(event) {
	// name: Structure
	// targets: Client
	// filenames: Engine

	// variables
	var structures = {};
	// end variables

	// functions

	function defaultStructureDraw(graphic, structure, x, y, z, heightMapData, structureData) {
		var structureWidth = structure[BLOCK_WIDTH];
		var structureDepth = structure[BLOCK_DEPTH];
		graphic.width = structureWidth;
		graphic.height = structureDepth;
		var style = color(y);
		graphic.beginFill(style, 1);
		graphic.drawRect(x, z, structureWidth, structureDepth);
		graphic.endFill();
	}

	function color(number) {
		var hex = (15 - number).toString(16);
		var string = hex + hex + hex + hex + hex + hex;
		return parseInt(string, 16);
	}

	function makeStructure(id, width, height, depth, textureFn) {
		if (structures[id]) {
			throw new Error("Structure ID already exists");
		}
		var structure = new Uint16Array(4);
		structure[BLOCK_ID] = id;
		structure[BLOCK_WIDTH] = width;
		structure[BLOCK_HEIGHT] = height;
		structure[BLOCK_DEPTH] = depth;
		structure.drawFn = textureFn || defaultBlockDraw;
		structures[id] = structure;
	}

	function getStructure(id) {
		return structures[id];
	}
	// end functions

	// other
	// end other

	return {
		// return
		make: makeStructure,
		get: getStructure
		// end return
	};
})