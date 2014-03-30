var Chunk = Module(function() {
	"use strict";
	// name: Chunk
	// targets: Client
	// filenames: Engine

	// variables
	var structureDetails = null;
	var buildMode = IDLE_MODE;
	var EnableStructureDebugging = false;
	// end variables

	// functions
	function addStructure(positionX, positionY, positionZ, structure) {
		var chunk = makeChunk(mouseXChunks, mouseZChunks);
		structureSize(structure, function(x, y, z) {
			var newChunk = findChunk((mouseXChunks * CHUNK_DIMENTION) + x, (mouseZChunks * CHUNK_DIMENTION) + z);
			var internalCoordinate = getCoordinate(mouseXBlocks + x, positionY + y, mouseZBlocks + z);
			newChunk.BlockData[internalCoordinate] = 1;
			if (newChunk.Modified === false) {
				newChunk.Modified = true;
			}
		});
		chunk.Structures.push(structure);
		renderPosition(function(positionX, positionZ) {
			console.log(positionX, positionZ);
			drawStructures(chunk, positionX, positionZ);
		}, mouseXChunks, mouseZChunks);
		buildMode = IDLE_MODE;
		tempBuilding.clear();
	}

	function structureSize(structure, fn) {
		var structureDepthInBlocks = resize(structure.get(S_SHAPE, DEPTH), BLOCK_SIZE);
		var structureWidthInBlocks = resize(structure.get(S_SHAPE, WIDTH), BLOCK_SIZE);
		var structureHeightInBlocks = resize(structure.get(S_SHAPE, HEIGHT), BLOCK_SIZE);
		for (var z = 0; z < structureDepthInBlocks; z++) {
			for (var x = 0; x < structureWidthInBlocks; x++) {
				for (var y = 1; y > -structureHeightInBlocks; y--) {
					var result = fn(x, y, z);
					if (result !== undefined) {
						return result;
					}
				}
			}
		}
	}

	function checkForSpace(structure) {
		if (EnableStructureDebugging) {
			console.clear();
		}
		var yIndex = 0;
		var chunk = makeChunk(mouseXChunks, mouseZChunks);
		var heightMapCoordinate = getCoordinate(mouseXBlocks, null, mouseZBlocks);
		if (chunk.HeightMap[heightMapCoordinate] - 1 > offsetYBlocks - 1) {
			yIndex = chunk.HeightMap[heightMapCoordinate] - 1;
		} else {
			yIndex = getLowestBlock(chunk, mouseXBlocks, mouseZBlocks) - 1; // we want to place above that block, not in it!
		}
		var internalCoordinate = getCoordinate(mouseXBlocks, yIndex, mouseZBlocks);
		if (EnableStructureDebugging) {
			console.log("Testing:", mouseXChunks + ",", mouseZChunks + ":", mouseXBlocks + ",", yIndex + ",", mouseZBlocks);
		}
		if (chunk.Blocks[internalCoordinate] === 0) {
			var result = structureSize(structure, function(x, y, z) {
				var newChunk = findChunk((mouseXChunks * CHUNK_DIMENTION) + mouseXBlocks + x, (mouseZChunks * CHUNK_DIMENTION) + mouseZBlocks + z);
				var currentX = positionWithinChunk(mouseXBlocks + x);
				var currentY = yIndex + y;
				var currentZ = positionWithinChunk(mouseZBlocks + z);
				internalCoordinate = getCoordinate(currentX, currentY, currentZ);
				if (newChunk.Modified) {
					if (EnableStructureDebugging) {
						console.log("Testing for structure, expecting 0 at:", currentX, currentY, currentZ, "found:", newChunk.BlockData[internalCoordinate]);
					}
					if (newChunk.BlockData[internalCoordinate] === 1) {
						if (EnableStructureDebugging) {
							console.warn("Cannot place structure at:", currentX, currentY, currentZ, "Reason: structure in the way");
						}
						return -1;
					}
				}
				if (y === 1) {
					if (EnableStructureDebugging) {
						console.log("Testing, expecting solid:", newChunk.Data[CHUNK_X] + ",", newChunk.Data[CHUNK_Z] + ":", (currentX) + ",", (currentY) + ",", currentZ, "result:", newChunk.Blocks[internalCoordinate]);
					}
					if (newChunk.Blocks[internalCoordinate] === 0) {
						if (EnableStructureDebugging) {
							console.warn("Cannot place structure at:", currentX, currentY, currentZ, "Reason: no block to build on");
						}
						return -1;
					}
				} else {
					if (EnableStructureDebugging) {
						console.log("Testing, expecting empty:", newChunk.Data[CHUNK_X] + ",", newChunk.Data[CHUNK_Z] + ":", (currentX) + ",", (currentY) + ",", currentZ, "result:", newChunk.Blocks[internalCoordinate]);
					}

				}
				if (newChunk.Blocks[internalCoordinate] > 0 && y < 1) {
					if (EnableStructureDebugging) {
						console.warn("Cannot place structure at:", currentX, currentY, currentZ, "Reason: block in the way");
					}
					return -1;
				}
			});
			if (result !== undefined) {
				return result;
			}
			return yIndex;
		} else {
			console.warn("Cannot place structure at:", mouseXBlocks, yIndex, mouseZBlocks, "Reason: block in the way");
			return -1;
		}
	}

	function initPlacementMode(structure) {
		if (structure) {
			buildMode = PLACEMENT_MODE;
			structureDetails = structure;
		} else {
			STRUCTURES_PLACE((mouseXChunks * CHUNK_DIMENTION) + (mouseXBlocks), (mouseZChunks * CHUNK_DIMENTION) + (mouseZBlocks));
		}
	}
	// end functions

	// other
	// end other

	return {
		//return
		addStruct: addStructure,
		check: checkForSpace,
		place: initPlacementMode
		//end return
	};
});
if (typeof module !== "undefined") {
	module.exports = Chunk;
}