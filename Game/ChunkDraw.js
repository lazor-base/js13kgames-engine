var Chunk = Module(function() {
	"use strict";
	// name: Chunk
	// targets: Client
	// filenames: Engine

	// variables
	var tempBuilding = new PIXI.Graphics();
	var crosshatch = new PIXI.Graphics();
	// var miniMap = new PIXI.Graphics();
	var layeredGraphics = [];
	var layeredText = [];
	for (var i = 0; i < CHUNK_HEIGHT; i++) {
		layeredGraphics.push(new PIXI.Graphics());
		layeredText.push(new PIXI.DisplayObjectContainer());
	}
	var text;
	// end variables

	// functions
	function tempBuildingDrawFn() {
		tempBuilding.clear();
		var xCoordinate = (Math.round(((mouseX - offsetXPixels) - BLOCK_SIZE / 2) / BLOCK_SIZE) * BLOCK_SIZE) + offsetXPixels;
		var zCoordinate = (Math.round(((mouseZ - offsetZPixels) - BLOCK_SIZE / 2) / BLOCK_SIZE) * BLOCK_SIZE) + offsetZPixels;
		var space = checkForSpace(structureDetails);
		var structureWidth = structureDetails.get(S_SHAPE, WIDTH);
		var structureDepth = structureDetails.get(S_SHAPE, DEPTH);
		tempBuilding.width = structureWidth;
		tempBuilding.height = structureDepth;
		var style = 0x00FF00;
		if (space === -1) {
			style = 0xFF0000;
		}
		tempBuilding.beginFill(style, 1);
		tempBuilding.drawRect(xCoordinate, zCoordinate, structureWidth, structureDepth);
		tempBuilding.endFill();
		tempBuilding.beginFill(0x000000, 1);
		tempBuilding.drawRect(xCoordinate + 5, zCoordinate + 5, structureWidth - 10, structureDepth - 10);
		tempBuilding.endFill();
	}

	function drawTempBuilding(force) {
		if (force && buildMode === PLACEMENT_MODE) {
			tempBuildingDrawFn();
		} else {
			if (buildMode !== PLACEMENT_MODE || (oldMouseXBlocks === mouseXBlocks && oldMouseZBlocks === mouseZBlocks)) {
				return false;
			}
			tempBuildingDrawFn();
		}
	}

	function renderPosition(fn, positionX, positionZ) {
		var width = window.innerWidth;
		var height = window.innerHeight;
		var chunkPixelSize = BLOCK_SIZE * CHUNK_DIMENTION;
		var verticalChunks = height / chunkPixelSize;
		var horizontalChunks = width / chunkPixelSize;
		for (var r = -1; r < verticalChunks + 1; r++) {
			for (var t = -1; t < horizontalChunks + 1; t++) {
				if (positionX !== undefined && positionZ !== undefined) {
					if (-offsetXChunks + t === positionX && -offsetZChunks + r === positionZ) {
						fn(t, r);
					}
				} else {
					fn(t, r);
				}
			}
		}
	}

	function color(number) {
		var hex = (15 - number);
		if (hex === 0) {
			return 0x000000;
		} else if (hex === 1) {
			return 0x111111;
		} else if (hex === 2) {
			return 0x222222;
		} else if (hex === 3) {
			return 0x333333;
		} else if (hex === 4) {
			return 0x444444;
		} else if (hex === 5) {
			return 0x555555;
		} else if (hex === 6) {
			return 0x666666;
		} else if (hex === 7) {
			return 0x777777;
		} else if (hex === 8) {
			return 0x888888;
		} else if (hex === 9) {
			return 0x999999;
		} else if (hex === 10) {
			return 0xAAAAAA;
		} else if (hex === 11) {
			return 0xBBBBBB;
		} else if (hex === 12) {
			return 0xCCCCCC;
		} else if (hex === 13) {
			return 0xDDDDDD;
		} else if (hex === 14) {
			return 0xEEEEEE;
		} else if (hex === 15) {
			return 0xFFFFFF;
		}
	}

	function drawBlock(heightMapData, chunk, x, y, z, xCoordinate, zCoordinate) {
		var internalCoordinate = getCoordinate(x, y, z);
		var blockId = chunk.Blocks[internalCoordinate];
		var blockIdAbove = chunk.Blocks[getCoordinate(x, y - 1 || 0, z)];
		if (blockId) {
			var blockData = chunk.BlockData[internalCoordinate] || 0;
			if (!blockCache[blockId]) {
				blockCache[blockId] = BLOCK_GET(blockId);
			}
			var block = blockCache[blockId];
			block.get(S_DRAW)(layeredGraphics[y], block, xCoordinate, y, zCoordinate, heightMapData, blockData);
			if (blockIdAbove > 0) {
				crosshatch.lineStyle(2, 0xff0000, 0.5);
				crosshatch.beginFill(0xFF7E00, 1);
				crosshatch.drawRect(xCoordinate + 1, zCoordinate + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
				crosshatch.endFill();
				crosshatch.moveTo(xCoordinate, zCoordinate);
				crosshatch.lineTo(xCoordinate + BLOCK_SIZE, zCoordinate + BLOCK_SIZE);
				crosshatch.lineStyle(0, 0, 0);
			}
			// var miniMapX = (xCoordinate / BLOCK_SIZE) * 4;
			// var miniMapZ = (zCoordinate / BLOCK_SIZE) * 4;
			// if (miniMapX > -1 && miniMapX < miniMap.width && miniMapZ > -1 && miniMapZ < miniMap.height) {
				// var style = color(y);
				// miniMap.beginFill(style, 1);
				// miniMap.drawRect(miniMapX, miniMapZ, 4, 4);
				// miniMap.endFill();
			// }
		}
	}

	function drawPartialChunk(chunk, x, z, chunkX, chunkZ, drawX, drawZ) {
		var heightMapCoordinate = getCoordinate(x, null, z);
		var heightMapData = chunk.HeightMap[heightMapCoordinate];
		var xCoordinate = (x * BLOCK_SIZE) + (drawX * BLOCK_SIZE * CHUNK_DIMENTION) + offsetXPixels + (offsetXBlocks * BLOCK_SIZE);
		var zCoordinate = (z * BLOCK_SIZE) + (drawZ * BLOCK_SIZE * CHUNK_DIMENTION) + offsetZPixels + (offsetZBlocks * BLOCK_SIZE);
		if (offsetYBlocks > heightMapData) {
			var y = getLowestBlock(chunk, x, z);
			return drawBlock(heightMapData, chunk, x, y, z, xCoordinate, zCoordinate);
		} else { // if we aren't looking underground, run this
			return drawBlock(heightMapData, chunk, x, heightMapData, z, xCoordinate, zCoordinate);
		}
	}

	function drawChunk(chunk, drawX, drawZ) {
		if (!chunk.Renderable) {
			return false;
		}
		// console.time("render Chunk");
		var chunkX = chunk.Data[CHUNK_X];
		var chunkZ = chunk.Data[CHUNK_Z];
		for (var z = 0; z < CHUNK_DIMENTION; z++) {
			for (var x = 0; x < CHUNK_DIMENTION; x++) {
				drawPartialChunk(chunk, x, z, chunkX, chunkZ, drawX, drawZ);
			}
		}
		var text = new PIXI.Text(chunkX + "," + chunkZ, {
			font: "50px Arial",
			fill: "red"
		});
		text.position.x = (drawX * BLOCK_SIZE * CHUNK_DIMENTION) + offsetXPixels + (offsetXBlocks * BLOCK_SIZE);
		text.position.y = (drawZ * BLOCK_SIZE * CHUNK_DIMENTION) + offsetZPixels + (offsetZBlocks * BLOCK_SIZE);
		layeredText[0].addChild(text);
		// console.timeEnd("render Chunk");
	}

	function drawStructures(chunk, drawX, drawZ) {
		for (var i = 0; i < chunk.Structures.length; i++) {
			var structure = chunk.Structures[i];
			var structureY = structure.get(S_POSITION, Y);
			var structureX = structure.get(S_POSITION, X);
			var structureZ = structure.get(S_POSITION, Z);
			var xCoordinate = (structureX * BLOCK_SIZE) + (drawX * BLOCK_SIZE * CHUNK_DIMENTION) + offsetXPixels + (offsetXBlocks * BLOCK_SIZE);
			var zCoordinate = (structureZ * BLOCK_SIZE) + (drawZ * BLOCK_SIZE * CHUNK_DIMENTION) + offsetZPixels + (offsetZBlocks * BLOCK_SIZE);
			var structureDefinition = STRUCTURES_GET(structure.get(S_ID));
			structureDefinition.get(S_DRAW)(layeredGraphics[structureY], structure, xCoordinate, structureY, zCoordinate);
			var text = new PIXI.Text(structureDefinition.get(S_SYMBOL), {
				font: ((structure.get(S_SHAPE, WIDTH) + structure.get(S_SHAPE, DEPTH)) / (2)) + "px Arial",
				fill: "darkgrey"
			});
			text.position.x = xCoordinate + (structure.get(S_SHAPE, WIDTH) / 5);
			text.position.y = zCoordinate - (structure.get(S_SHAPE, DEPTH) / CHUNK_HEIGHT);
			layeredText[structureY].addChild(text);
		}
	}
	// end functions

	// other
	GUI_ON("RenderReady", function() {
		text = new PIXI.Text(0 + "," + 0, {
			font: "50px Arial",
			fill: "red"
		});
		text.position.x = 10;
		text.position.y = 20;
		for (var i = 15; i > -1; i--) {
			DRAW_STAGE.addChild(layeredGraphics[i]);
			DRAW_STAGE.addChild(layeredText[i]);
		}
		// miniMap.width = Math.ceil(window.innerWidth / BLOCK_SIZE) * 4;
		// miniMap.height = Math.ceil(window.innerHeight / BLOCK_SIZE) * 4;
		// miniMap.position.x = window.innerWidth - miniMap.width - 5;
		// miniMap.position.y = 5;
		DRAW_STAGE.addChild(crosshatch);
		crosshatch.alpha = 0.25;
		DRAW_STAGE.addChild(tempBuilding);
		// DRAW_STAGE.addChild(miniMap);
		tempBuilding.alpha = 0.25;
		DRAW_STAGE.addChild(text);
	});
	// end other

	return {
		//return
		draw: drawChunk
		//end return
	};
});
if (typeof module !== "undefined") {
	module.exports = Chunk;
}