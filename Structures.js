var Structure = Module(function(event) {
	// name: Structure
	// targets: Client
	// filenames: Engine

	// variables
	var structures = {};
	var Mode = IDLE_MODE;
	// end variables

	// functions

	function defaultStructureDraw(graphic, structure, x, y, z, heightMapData, structureData) {
		var structureWidth = structure[STRUCTURE_WIDTH];
		var structureDepth = structure[STRUCTURE_DEPTH];
		graphic.width = structureWidth;
		graphic.height = structureDepth;
		var style = color(y);
		graphic.beginFill(style, 1);
		graphic.drawRect(x, z, structureWidth, structureDepth);
		graphic.endFill();
	}

	function defineStructure(id, width, height, depth, color, health, textureFn) {
		if (structures[id]) {
			throw new Error("Structure ID already exists");
		}
		var structure = new Uint16Array(STRUCTURE_DEFINITION_ENTRIES);
		structure[STRUCTURE_ID] = id;
		structure[STRUCTURE_WIDTH] = width;
		structure[STRUCTURE_HEIGHT] = height;
		structure[STRUCTURE_DEPTH] = depth;
		structure[STRUCTURE_COLOR] = color;
		structure[STRUCTURE_HEALTH] = health;
		structure.drawFn = textureFn || defaultBlockDraw;
		structures[id] = structure;
	}

	function placeStructure(id, x, y, z) {
		var structure = new Uint16Array(STRUCTURE_ENTRIES);
		structure.set(structures[id]);
		structure[STRUCTURE_X] = x;
		structure[STRUCTURE_Y] = y;
		structure[STRUCTURE_Z] = z;
		return structure;
	}

	function getStructure(id) {
		return structures[id];
	}
	// end functions

	// other
	// end other

	return {
		// return
		define: defineStructure,
		set: placeStructure,
		get: getStructure
		// end return
	};
})