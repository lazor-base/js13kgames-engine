var Structures = Module(function() {
	"use strict";
	// name: Structures
	// targets: Client
	// filenames: Engine

	// variables
	var uniqueStructures = {};
	var Mode = IDLE_MODE;
	var constructionId = 0;
	// end variables

	// functions

	function defaultStructureDraw(graphic, structure, x, y, z) {
		var structureWidth = structure[STRUCTURE_WIDTH];
		var structureDepth = structure[STRUCTURE_DEPTH];
		graphic.width = structureWidth;
		graphic.height = structureDepth;
		var style = structure[STRUCTURE_COLOR];
		graphic.beginFill(style, 1);
		graphic.drawRect(x, z, structureWidth, structureDepth);
		graphic.endFill();
	}

	function defineStructure(id, name, description, width, height, depth, color, health, textureFn) {
		if (uniqueStructures[id]) {
			throw new Error("Structure ID already exists");
		}
		var structure = new Uint16Array(STRUCTURE_DEFINITION_ENTRIES);
		structure[STRUCTURE_ID] = id;
		structure[STRUCTURE_WIDTH] = width;
		structure[STRUCTURE_HEIGHT] = height;
		structure[STRUCTURE_DEPTH] = depth;
		structure[STRUCTURE_COLOR] = color;
		structure[STRUCTURE_HEALTH] = health;
		structure.name = name;
		structure.description = description;
		structure.drawFn = textureFn || defaultStructureDraw;
		uniqueStructures[id] = structure;
	}

	function placeStructure() {
		if (Mode === IDLE_MODE) {
			return false;
		} else if (Mode === PLACEMENT_MODE) {
			var yIndex = CHUNK_HAS_SPACE(uniqueStructures[constructionId]);
			if (yIndex !== -1) {
				var structure = new Int16Array(STRUCTURE_ENTRIES);
				structure.set(uniqueStructures[constructionId]);
				var positionWithinChunkX = CHUNK_POSITION_X % CHUNK_DIMENTION;
				var positionWithinChunkZ = CHUNK_POSITION_Z % CHUNK_DIMENTION;
				if (positionWithinChunkX < 0) {
					positionWithinChunkX += CHUNK_DIMENTION;
				}
				if (positionWithinChunkZ < 0) {
					positionWithinChunkZ += CHUNK_DIMENTION;
				}
				structure[STRUCTURE_X] = positionWithinChunkX;
				structure[STRUCTURE_Y] = yIndex;
				structure[STRUCTURE_Z] = positionWithinChunkZ;
				structure.drawFn = uniqueStructures[constructionId].drawFn;
				CHUNK_ADD_STRUCTURE(structure);
				Mode = IDLE_MODE;
				return true;
			}
			return null;
		}
	}

	function eventListener(e) {
		constructionId = parseInt(e.target.getAttribute("data-id"), 10);
		Mode = PLACEMENT_MODE;
	}

	function makeStructuresGUI() {
		var structuresDiv = GUI_MAKE("div");
		if (GUI_GET("structures") === null) {
			GUI_SET(structuresDiv, "id", "structures");
			GUI_PUT(structuresDiv);
		}
		structuresDiv = GUI_GET("structures");
		for (var attr in uniqueStructures) {
			var button = GUI_MAKE("button");
			GUI_SET(button, "data-id", attr);
			button.innerHTML = uniqueStructures[attr].name;
			button.addEventListener("click", eventListener, false);
			GUI_PUT(button, structuresDiv);
		}
	}

	function getStructure(id) {
		return uniqueStructures[id];
	}
	// end functions

	// other
	// end other

	return {
		// return
		define: defineStructure,
		set: placeStructure,
		get: getStructure,
		gui: makeStructuresGUI
		// end return
	};
});
if (typeof module !== "undefined") {
	module.exports = Structures;
}