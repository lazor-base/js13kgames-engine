var Structure = Module(function(event) {
	// name: Structure
	// targets: Client
	// filenames: Engine

	// variables
	var structures = {};
	// end variables

	// functions

	function defaultStructureDraw(graphic, structure, x, y, heightMapData, blockData) {
		graphic.width = structure.get(BLOCK_WIDTH);
		graphic.height = structure.get(BLOCK_DEPTH);
		graphic.beginFill(color(heightMapData), 1);
		graphic.drawRect(x, y, structure.get(BLOCK_WIDTH), structure.get(BLOCK_DEPTH));
		graphic.endFill();
	}

	function color(number) {
		var hex = (15 - number).toString(16);
		var string = hex + hex + hex + hex + hex + hex;
		return parseInt(string, 16);
	}

	function makeStructure(id, width, height, depth, textureFn) {
		if (blocks[id]) {
			throw new Error("Structure ID already exists");
		}
		var structure = LIST_GET(4, UINT16);
		structure.set(BLOCK_ID, id);
		structure.set(BLOCK_WIDTH, width);
		structure.set(BLOCK_HEIGHT, height);
		structure.set(BLOCK_DEPTH, depth);
		structure.drawFn = textureFn || defaultStructureDraw;
		structures[id] = structure;
	}

	function getStructure(id) {
		return blocks[id];
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