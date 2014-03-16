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
		var structureWidth = structure.get(S_SHAPE, WIDTH);
		var structureDepth = structure.get(S_SHAPE, DEPTH);
		graphic.width = structureWidth;
		graphic.height = structureDepth;
		var style = structure.get(S_COLOR, DEC);
		graphic.beginFill(style, 1);
		graphic.drawRect(x, z, structureWidth, structureDepth);
		graphic.endFill();
		graphic.beginFill(0x000000, 1);
		graphic.drawRect(x + 3, z + 3, structureWidth - 6, structureDepth - 6);
		graphic.endFill();
	}

	function defineStructure(id, symbol, description, width, height, depth, colorString, color, health, textureFn) {
		if (uniqueStructures[id]) {
			throw new Error("Structure ID already exists");
		}
		var structure = SYSTEM_DEFINE_CHILD(id, STRUCTURE);
		structure.set(S_ID, id);
		structure.set(S_SHAPE, WIDTH, width);
		structure.set(S_SHAPE, HEIGHT, height);
		structure.set(S_SHAPE, DEPTH, depth);
		structure.set(S_COLOR, HEX, colorString);
		structure.set(S_COLOR, DEC, color);
		structure.set(S_SYMBOL, symbol);
		structure.set(S_DESCRIPTION, description);
		structure.set(S_DRAW, textureFn || defaultStructureDraw);
		uniqueStructures[id] = structure;
	}

	function placeStructure(xPosition, zPosition) {
		if (Mode === IDLE_MODE) {
			return false;
		} else if (Mode === PLACEMENT_MODE) {
			var yIndex = CHUNK_HAS_SPACE(uniqueStructures[constructionId]);
			if (yIndex !== -1) {
				var structure = SYSTEM_CLONE_ENTITY(constructionId);
				var positionWithinChunkX = xPosition % CHUNK_DIMENTION;
				var positionWithinChunkZ = zPosition % CHUNK_DIMENTION;
				if (positionWithinChunkX < 0) {
					positionWithinChunkX += CHUNK_DIMENTION;
				}
				if (positionWithinChunkZ < 0) {
					positionWithinChunkZ += CHUNK_DIMENTION;
				}
				structure.set(S_POSITION, X, positionWithinChunkX);
				structure.set(S_POSITION, Y, yIndex);
				structure.set(S_POSITION, Z, positionWithinChunkZ);
				CHUNK_ADD_STRUCTURE(positionWithinChunkX, yIndex, positionWithinChunkZ, structure);
				Mode = IDLE_MODE;
				return true;
			}
			return null;
		}
	}

	function eventListener(e) {
		constructionId = parseInt(e.target.getAttribute("data-id"), 10);
		Mode = PLACEMENT_MODE;
		CHUNK_PLACE(uniqueStructures[constructionId]);
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
			button.innerHTML = uniqueStructures[attr].get(S_DESCRIPTION);
			button.addEventListener("click", eventListener, false);
			GUI_PUT(button, structuresDiv);
		}
	}

	function getStructure(id) {
		return uniqueStructures[id];
	}
	// end functions

	// other
	SYSTEM_ON("systemReady", function() {
		var structureEntity = SYSTEM_DEFINE_PARENT(STRUCTURE);
		structureEntity.addSystem(S_SHAPE, [BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE]);
		structureEntity.addSystem(S_POSITION, [0, 0, 0]);
		structureEntity.addSystem(S_ID, [0]);
		structureEntity.addSystem(S_COLOR, ["#000000", 0x000000]);
		structureEntity.addSystem(S_DESCRIPTION, ["Structure"]);
		structureEntity.addSystem(S_SYMBOL, ["S"]);
		structureEntity.addSystem(S_DRAW, [defaultStructureDraw]);
	});
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