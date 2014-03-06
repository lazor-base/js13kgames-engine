var Chunk = Module(function() {
	"use strict";
	// name: Chunk
	// targets: Client
	// filenames: Engine

	// variables
	var chunks = {
		current: {},
		old: []
	};
	// var chunkHeight = CHUNK_HEIGHT;
	var numberOfBlocksPerAxis = CHUNK_DIMENTION;
	// var numberOfYChunks = chunkHeight / numberOfBlocksPerAxis;
	var numberOfBlocksPerChunk = numberOfBlocksPerAxis * numberOfBlocksPerAxis * numberOfBlocksPerAxis;
	var numberOfBlocksPerYAxis = numberOfBlocksPerAxis * numberOfBlocksPerAxis;
	var tempBuilding = new PIXI.Graphics();
	var miniMap = new PIXI.Graphics();
	var structureDetails = null;
	// var textHost = new PIXI.DisplayObjectContainer();
	var layeredGraphics = [];
	var layeredText = [];
	for (var i = 0; i < 16; i++) {
		layeredGraphics.push(new PIXI.Graphics());
		layeredText.push(new PIXI.DisplayObjectContainer());
	}
	var worker = new Worker('WebWorker.js');
	var onScreen = [];
	var blockCache = {};
	var mapOffsetX = 0;
	var mapOffsetY = 0;
	var viewPortX = 0;
	var viewPortY = 0;
	var viewPortZ = 0;
	var oldViewPortX = viewPortX;
	var oldViewPortY = viewPortY;
	var oldViewPortZ = viewPortZ;
	var oldWidth = 0;
	var oldHeight = 0;
	var firstRun = true;
	var text;
	var chunkMouseX = 0;
	var chunkMouseY = 0;
	var oldChunkMouseX = 0;
	var oldChunkMouseY = 0;
	var buildMode = IDLE_MODE;

	// end variables

	// functions

	function getCoordinate(x, y, z) {
		var result = ((y || 0) * numberOfBlocksPerAxis + z) * numberOfBlocksPerAxis + x;
		if (result < 0) {
			throw new Error("Attempt to index block out of range, " + x + "," + y + "," + z);
		}
		return result;
	}

	function addStructure(positionX, positionY, positionZ, structure) {
		var chunkX = resize(chunkMouseX, numberOfBlocksPerAxis);
		var chunkZ = resize(chunkMouseY, numberOfBlocksPerAxis);
		var structureDepthInBlocks = resize(structure[STRUCTURE_DEPTH], BLOCK_SIZE);
		var structureWidthInBlocks = resize(structure[STRUCTURE_WIDTH], BLOCK_SIZE);
		var structureHeightInBlocks = resize(structure[STRUCTURE_HEIGHT], BLOCK_SIZE);
		var chunk = makeChunk(chunkX, chunkZ);
		for (var z = 0; z < structureDepthInBlocks; z++) {
			for (var x = 0; x < structureWidthInBlocks; x++) {
				for (var y = 1; y > -structureHeightInBlocks; y--) {
					var newChunkX = resize(chunkMouseX + x, numberOfBlocksPerAxis);
					var newChunkZ = resize(chunkMouseY + z, numberOfBlocksPerAxis);
					var newChunk = makeChunk(newChunkX, newChunkZ);
					var newPositionWithinChunkX = (positionX + x) % CHUNK_DIMENTION;
					var newPositionWithinChunkZ = (positionZ + z) % CHUNK_DIMENTION;
					if (newPositionWithinChunkX < 0) {
						newPositionWithinChunkX += CHUNK_DIMENTION;
					}
					if (newPositionWithinChunkZ < 0) {
						newPositionWithinChunkZ += CHUNK_DIMENTION;
					}
					var internalCoordinate = getCoordinate(newPositionWithinChunkX, positionY + y, newPositionWithinChunkZ);
					newChunk.BlockData[internalCoordinate] = 1;
					if (newChunk.Modified === false) {
						newChunk.Modified = true;
					}
				}
			}
		}
		chunk.Structures.push(structure);
		drawStructures(chunk);
		buildMode = IDLE_MODE;
		tempBuilding.clear();
	}

	function getLowestBlock(chunk, x, z, optionalY) {
		var initialY = optionalY || viewPortY;
		for (var y = initialY; y < numberOfBlocksPerAxis; y++) {
			var internalCoordinate = getCoordinate(x, y, z);
			var blockId = chunk.Blocks[internalCoordinate];
			if (blockId) {
				return y;
			}
		}
		throw new Error("Unable to find lowest block, " + x + "," + initialY + "," + z);
	}

	function resize(original, divisor) {
		return Math.round((original - divisor / 2) / divisor);
	}

	function checkForSpace(structure) {
		var chunkX = resize(chunkMouseX, numberOfBlocksPerAxis);
		var chunkZ = resize(chunkMouseY, numberOfBlocksPerAxis);
		var structureDepthInBlocks = resize(structure[STRUCTURE_DEPTH], BLOCK_SIZE);
		var structureWidthInBlocks = resize(structure[STRUCTURE_WIDTH], BLOCK_SIZE);
		var structureHeightInBlocks = resize(structure[STRUCTURE_HEIGHT], BLOCK_SIZE);
		var positionWithinChunkX = chunkMouseX % CHUNK_DIMENTION;
		var positionWithinChunkZ = chunkMouseY % CHUNK_DIMENTION;
		if (positionWithinChunkX < 0) {
			positionWithinChunkX += CHUNK_DIMENTION;
		}
		if (positionWithinChunkZ < 0) {
			positionWithinChunkZ += CHUNK_DIMENTION;
		}
		var yIndex = 0;
		var chunk = makeChunk(chunkX, chunkZ);
		var heightMapCoordinate = getCoordinate(positionWithinChunkX, null, positionWithinChunkZ);
		if (chunk.HeightMap[heightMapCoordinate] - 1 > viewPortY - 1) {
			yIndex = chunk.HeightMap[heightMapCoordinate] - 1;
		} else {
			yIndex = getLowestBlock(chunk, positionWithinChunkX, positionWithinChunkZ) - 1; // we want to place above that block, not in it!
		}
		var internalCoordinate = getCoordinate(positionWithinChunkX, yIndex, positionWithinChunkZ);
		if (chunk.Blocks[internalCoordinate] === 0) {
			for (var z = 0; z < structureDepthInBlocks; z++) {
				for (var x = 0; x < structureWidthInBlocks; x++) {
					for (var y = 1; y > -structureHeightInBlocks; y--) {
						var newChunkX = resize(chunkMouseX + x, numberOfBlocksPerAxis);
						var newChunkZ = resize(chunkMouseY + z, numberOfBlocksPerAxis);
						var newChunk = makeChunk(newChunkX, newChunkZ);
						var newPositionWithinChunkX = (chunkMouseX + x) % CHUNK_DIMENTION;
						var newPositionWithinChunkZ = (chunkMouseY + z) % CHUNK_DIMENTION;
						if (newPositionWithinChunkX < 0) {
							newPositionWithinChunkX += CHUNK_DIMENTION;
						}
						if (newPositionWithinChunkZ < 0) {
							newPositionWithinChunkZ += CHUNK_DIMENTION;
						}
						internalCoordinate = getCoordinate(newPositionWithinChunkX, yIndex + y, newPositionWithinChunkZ);
						if (newChunk.Modified) {
							if (newChunk.BlockData[internalCoordinate] === 1) {
								// console.warn("Cannot place structure at:", positionWithinChunkX, yIndex + y, positionWithinChunkZ, "Reason: structure in the way");
								return -1;
							}
						}
						if (y === 1) {
							if (newChunk.Blocks[internalCoordinate] === 0) {
								// console.warn("Cannot place structure at:", chunkMouseX + x, yIndex + y, chunkMouseY + z, "Reason: no block to build on");
								return -1;
							}
						}
						if (newChunk.Blocks[internalCoordinate] > 0 && y < 1) {
							// console.warn("Cannot place structure at:", chunkMouseX + x, yIndex + y, chunkMouseY + z, "Reason: block in the way");
							return -1;
						}
					}
				}
			}
			return yIndex;
		} else {
			// console.warn("Cannot place structure at:", positionWithinChunkX, yIndex, positionWithinChunkZ, "Reason: block in the way");
			return -1;
		}
	}

	function drawTempBuilding() {
		if (buildMode !== PLACEMENT_MODE && (oldChunkMouseX === chunkMouseX || oldChunkMouseY === chunkMouseY)) {
			return false;
		}
		tempBuilding.clear();
		var chunkX = Math.round((chunkMouseX - numberOfBlocksPerAxis / 2) / numberOfBlocksPerAxis);
		var chunkZ = Math.round((chunkMouseY - numberOfBlocksPerAxis / 2) / numberOfBlocksPerAxis);
		var positionWithinChunkX = chunkMouseX % CHUNK_DIMENTION;
		var positionWithinChunkZ = chunkMouseY % CHUNK_DIMENTION;
		if (positionWithinChunkX < 0) {
			positionWithinChunkX += CHUNK_DIMENTION;
		}
		if (positionWithinChunkZ < 0) {
			positionWithinChunkZ += CHUNK_DIMENTION;
		}
		// var chunk = makeChunk(chunkX, chunkZ);
		var xCoordinate = (positionWithinChunkX * BLOCK_SIZE) + viewPortX - (chunkX * -(BLOCK_SIZE * CHUNK_DIMENTION));
		var zCoordinate = (positionWithinChunkZ * BLOCK_SIZE) + viewPortZ - (chunkZ * -(BLOCK_SIZE * CHUNK_DIMENTION));
		// var yCoordinate = getLowestBlock(chunk, xCoordinate, zCoordinate);
		var space = checkForSpace(structureDetails);
		// structureDetails.drawFn(tempBuilding, structureDetails, xCoordinate, getLowestBlock(chunk, xCoordinate, zCoordinate), zCoordinate);
		var structureWidth = structureDetails[STRUCTURE_WIDTH];
		var structureDepth = structureDetails[STRUCTURE_DEPTH];
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

	function mapMouse(type, value) {
		oldChunkMouseX = chunkMouseX;
		oldChunkMouseY = chunkMouseY;
		if (type === "X") {
			chunkMouseX = Math.round(((value - viewPortX) - BLOCK_SIZE / 2) / BLOCK_SIZE);

		} else {
			chunkMouseY = Math.round(((value - viewPortZ) - BLOCK_SIZE / 2) / BLOCK_SIZE);
		}
		if (text) {
			text.setText(chunkMouseX + "," + viewPortY + "," + chunkMouseY);
		}
		drawTempBuilding();
	}

	function moveViewPort(x, y, z) {
		var oldViewPortX = viewPortX;
		var oldViewPortY = viewPortY;
		var oldViewPortZ = viewPortZ;
		if (x !== null) {
			viewPortX += x;
			mapOffsetX += x;
			// graphics.position.x = mapOffsetX;
			// textHost.position.x = mapOffsetX;
			// tempBuilding.position.x = mapOffsetX;
			for (var i = 0; i < 16; i++) {
				layeredGraphics[i].position.x = mapOffsetX;
				layeredText[i].position.x = mapOffsetX;
			}
		}
		if (y !== null) {
			if (y < 0) {
				viewPortY--;
			} else {
				viewPortY++;
			}
			if (viewPortY > numberOfBlocksPerAxis - 2) { // always show ground (15) layer
				viewPortY = numberOfBlocksPerAxis - 2;
			}
			if (viewPortY < 0) {
				viewPortY = 0;
			}
			var result = false;
			for (var f = 0; f < 16; f++) {
				if (f < viewPortY - 1) {
					result = false;
				} else {
					result = true;
				}
				layeredGraphics[f].visible = result;
				layeredText[f].visible = result;
			}
		}
		if (z !== null) {
			viewPortZ += z;
			mapOffsetY += z;
			// graphics.position.y = mapOffsetY;
			// textHost.position.y = mapOffsetY;
			// tempBuilding.position.y = mapOffsetY;
			for (var e = 0; e < 16; e++) {
				layeredGraphics[e].position.y = mapOffsetY;
				layeredText[e].position.y = mapOffsetY;
			}
		}
		if (oldViewPortX !== viewPortX || oldViewPortY !== viewPortY || oldViewPortZ !== viewPortZ) {
			return true;
		}
		return false;
	}

	function makeChunk(positionX, positionZ) {
		var recycledChunk = false;
		if (chunks.current[positionX + "," + positionZ]) {
			return chunks.current[positionX + "," + positionZ];
		}
		var chunk;
		if (chunks.old.length) {
			recycledChunk = true;
			// console.time("recycled chunk")
			chunk = chunks.old.pop();
			chunk.Data = new Int8Array(4);
			chunk.BlockData = new Uint8Array(numberOfBlocksPerChunk);
		} else {
			// console.time("chunk")
			var data = new Int16Array(4);
			var biomes = new Uint8Array(numberOfBlocksPerYAxis);
			var height = new Uint8Array(numberOfBlocksPerYAxis);
			var blocks = new Uint16Array(numberOfBlocksPerChunk);
			var blockData = new Uint8Array(numberOfBlocksPerChunk);
			chunk = {
				Renderable: false,
				Data: data,
				Biomes: biomes,
				HeightMap: height,
				Blocks: blocks,
				BlockData: blockData,
				Structures: [],
				Modified: false
			};
		}
		chunk.Data[CHUNK_X] = positionX;
		chunk.Data[CHUNK_Z] = positionZ;
		worker.postMessage([BUILD_CHUNK, positionX, positionZ, chunk.Blocks.buffer, chunk.BlockData.buffer, chunk.HeightMap.buffer], [chunk.Blocks.buffer, chunk.BlockData.buffer, chunk.HeightMap.buffer]);
		chunks.current[positionX + "," + positionZ] = chunk;
		// console.timeEnd("recycled chunk");
		// console.timeEnd("chunk");
		return chunk;
	}

	function cleanChunks(attr) {
		if (onScreen.indexOf(attr) === -1) {
			if (chunks.current[attr] && chunks.current[attr].Renderable && chunks.current[attr].Modified === false) {
				chunks.current[attr].Renderable = false;
				chunks.old.push(chunks.current[attr]);
				chunks.current[attr] = null;
			}
		}
	}

	function Mixed(X, Z) {
		if (firstRun) {
			var chunk = makeChunk(X, Z);
			drawChunk(chunk);
			drawStructures(chunk);
		} else if (chunks.current[X + "," + Z] && chunks.current[X + "," + Z].Renderable) {
			drawChunk(chunks.current[X + "," + Z]);
			drawStructures(chunks.current[X + "," + Z]);
		} else {
			LOOP_QUEUE(5, function(X, Z) {
				var chunk = makeChunk(X, Z);
				drawChunk(chunk);
				drawStructures(chunk);
			}, [X, Z]);
		}
	}

	// function Staggered(X, Z) {
	// 	LOOP_QUEUE(5, function(X, Z) {
	// 		var chunk = makeChunk(X, Z);
	// 		drawChunk(chunk);
	// 		drawStructures(chunk);
	// 	}, [X, Z]);
	// }

	// function AllAtOnce(X, Z) {
	// 	var chunk = makeChunk(X, Z);
	// 	drawChunk(chunk);
	// 	drawStructures(chunk);
	// }

	function divideScreen(force) {
		// console.clear();
		// console.time("divide screen")
		onScreen.length = 0;
		var width = window.innerWidth;
		var height = window.innerHeight;
		var chunkPixelSize = BLOCK_SIZE * numberOfBlocksPerAxis;
		var verticalChunks = height / chunkPixelSize;
		var horizontalChunks = width / chunkPixelSize;
		var Xcoordinate = Math.floor(-viewPortX / chunkPixelSize);
		var Zcoordinate = Math.floor(-viewPortZ / chunkPixelSize);
		var differentX = oldViewPortX !== viewPortX;
		var differentY = viewPortY !== oldViewPortY;
		var differentZ = oldViewPortZ !== viewPortZ;
		var differentWidth = oldWidth !== width;
		var differentHeight = oldHeight !== height;
		var chunkChange = false;
		if (differentWidth || differentHeight || differentX || differentZ || force) {
			for (var i = -1; i < verticalChunks + 1; i++) {
				for (var e = -1; e < horizontalChunks + 1; e++) {
					onScreen.push((Xcoordinate + e) + "," + (Zcoordinate + i));
				}
			}

			for (var attr in chunks.current) {
				cleanChunks(attr);
			}
			chunkChange = true;
		}
		if (differentWidth || differentHeight || differentY || chunkChange || force) {
			// while (textHost.children.length) {
			// 	textHost.removeChild(textHost.children[0]);
			// }
			// graphics.clear();
			for (var f = 0; f < 16; f++) {
				while (layeredText[f].children.length) {
					layeredText[f].removeChild(layeredText[f].children[0]);
				}
				layeredGraphics[f].clear();
				layeredText[f].position.x = 0;
				layeredText[f].position.y = 0;
				layeredGraphics[f].position.x = 0;
				layeredGraphics[f].position.y = 0;
			}
			miniMap.clear();
			miniMap.beginFill(0x000000, 1);
			miniMap.drawRect(-5, -5, miniMap.width + 10, miniMap.height + 10);
			miniMap.endFill();
			// graphics.position.x = 0;
			// textHost.position.x = 0;
			// graphics.position.y = 0;
			// textHost.position.y = 0;
			tempBuilding.position.x = 0;
			tempBuilding.position.y = 0;
			drawTempBuilding();
			mapOffsetX = 0;
			mapOffsetY = 0;
			for (var r = -1; r < verticalChunks + 1; r++) {
				for (var t = -1; t < horizontalChunks + 1; t++) {
					var X = Xcoordinate + t;
					var Z = Zcoordinate + r;
					// optional Staggered or AllAtOnce
					Mixed(X, Z);
				}
			}
		}
		oldViewPortX = viewPortX;
		oldViewPortY = viewPortY;
		oldViewPortZ = viewPortZ;
		oldWidth = width;
		oldHeight = height;
		firstRun = false;
		// console.timeEnd("divide screen")
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
		if (blockId) {
			var blockData = chunk.BlockData[internalCoordinate] || 0;
			if (!blockCache[blockId]) {
				blockCache[blockId] = BLOCK_GET(blockId);
			}
			var block = blockCache[blockId];
			block.drawFn(layeredGraphics[y], block, xCoordinate, y, zCoordinate, heightMapData, blockData);
			var miniMapX = (xCoordinate / BLOCK_SIZE) * 4;
			var miniMapZ = (zCoordinate / BLOCK_SIZE) * 4;
			if (miniMapX > -1 && miniMapX < miniMap.width && miniMapZ > -1 && miniMapZ < miniMap.height) {
				var style = color(y);
				miniMap.beginFill(style, 1);
				miniMap.drawRect(miniMapX, miniMapZ, 4, 4);
				miniMap.endFill();
			}
		}
	}

	function drawPartialChunk(chunk, x, z, chunkX, chunkZ) {
		var heightMapCoordinate = getCoordinate(x, null, z);
		var heightMapData = chunk.HeightMap[heightMapCoordinate];
		var xCoordinate = (x * BLOCK_SIZE) + viewPortX - (chunkX * -(BLOCK_SIZE * CHUNK_DIMENTION));
		var zCoordinate = (z * BLOCK_SIZE) + viewPortZ - (chunkZ * -(BLOCK_SIZE * CHUNK_DIMENTION));
		if (viewPortY > heightMapData) {
			var y = getLowestBlock(chunk, x, z);
			return drawBlock(heightMapData, chunk, x, y, z, xCoordinate, zCoordinate);
		} else { // if we aren't looking underground, run this
			return drawBlock(heightMapData, chunk, x, heightMapData, z, xCoordinate, zCoordinate);
		}
	}

	function drawChunk(chunk) {
		if (!chunk.Renderable) {
			return false;
		}
		// console.time("render Chunk");
		var chunkX = chunk.Data[CHUNK_X];
		var chunkZ = chunk.Data[CHUNK_Z];
		for (var z = 0; z < numberOfBlocksPerAxis; z++) {
			for (var x = 0; x < numberOfBlocksPerAxis; x++) {
				drawPartialChunk(chunk, x, z, chunkX, chunkZ);
			}
		}
		// var text = new PIXI.Text(chunkX + "," + chunkZ, {
		// 	font: "50px Arial",
		// 	fill: "red"
		// });
		// text.position.x = viewPortX - (chunkX * -(BLOCK_SIZE * CHUNK_DIMENTION));
		// text.position.y = viewPortZ - (chunkZ * -(BLOCK_SIZE * CHUNK_DIMENTION));
		// textHost.addChild(text);
		// console.timeEnd("render Chunk");
	}

	function drawStructures(chunk) {
		var chunkX = chunk.Data[CHUNK_X];
		var chunkZ = chunk.Data[CHUNK_Z];
		for (var i = 0; i < chunk.Structures.length; i++) {
			var structure = chunk.Structures[i];
			var structureY = structure[STRUCTURE_Y];
			// var structureBase = structureY + (structure[STRUCTURE_HEIGHT] / BLOCK_SIZE);
			// if (structureBase > viewPortY) {
			var structureX = structure[STRUCTURE_X];
			var structureZ = structure[STRUCTURE_Z];
			var xCoordinate = (structureX * BLOCK_SIZE) + viewPortX - (chunkX * -(BLOCK_SIZE * CHUNK_DIMENTION));
			var zCoordinate = (structureZ * BLOCK_SIZE) + viewPortZ - (chunkZ * -(BLOCK_SIZE * CHUNK_DIMENTION));
			var structureDefinition = STRUCTURES_GET(chunk.Structures[i][STRUCTURE_ID]);
			structureDefinition.drawFn(layeredGraphics[structureY], structure, xCoordinate, structureY, zCoordinate);
			var text = new PIXI.Text(structureDefinition.symbol, {
				font: ((structure[STRUCTURE_WIDTH] + structure[STRUCTURE_HEIGHT]) / (2)) + "px Arial",
				fill: "darkgrey"
			});
			text.position.x = (structureX * BLOCK_SIZE) + viewPortX - (chunkX * -(BLOCK_SIZE * CHUNK_DIMENTION)) + (structure[STRUCTURE_WIDTH] / 5);
			text.position.y = (structureZ * BLOCK_SIZE) + viewPortZ - (chunkZ * -(BLOCK_SIZE * CHUNK_DIMENTION)) - (structure[STRUCTURE_HEIGHT] / 16);
			layeredText[structureY].addChild(text);
			// }
		}
	}

	function initPlacementMode(structure) {
		buildMode = PLACEMENT_MODE;
		structureDetails = structure;
	}
	// end functions

	// other
	GUI_ON("RenderReady", function() {
		// DRAW_STAGE.addChild(graphics);
		// DRAW_STAGE.addChild(textHost);
		text = new PIXI.Text(0 + "," + 0, {
			font: "50px Arial",
			fill: "red"
		});
		text.position.x = 10;
		text.position.y = 10;
		for (var i = 15; i > -1; i--) {
			DRAW_STAGE.addChild(layeredGraphics[i]);
			DRAW_STAGE.addChild(layeredText[i]);
		}
		miniMap.width = Math.ceil(window.innerWidth / BLOCK_SIZE) * 4;
		miniMap.height = Math.ceil(window.innerHeight / BLOCK_SIZE) * 4;
		miniMap.position.x = window.innerWidth - miniMap.width - 5;
		miniMap.position.y = 5;
		DRAW_STAGE.addChild(tempBuilding);
		DRAW_STAGE.addChild(miniMap);
		tempBuilding.alpha = 0.25;
		DRAW_STAGE.addChild(text);
	});
	worker.addEventListener('message', function(e) {
		if (e.data[OPERATION] === DEBUG) {
			console.log(e.msg);
		} else if (e.data[OPERATION] === CHUNK_COMPLETE) {
			var chunk = chunks.current[e.data[X_COORDINATE] + "," + e.data[Z_COORDINATE]];
			if (chunk) {
				chunk.HeightMap = new Uint8Array(e.data[HEIGHT_ARRAY]);
				chunk.Blocks = new Uint8Array(e.data[BLOCK_ARRAY]);
				chunk.BlockData = new Uint8Array(e.data[DATA_ARRAY]);
				chunk.Renderable = true;
				drawChunk(chunk);
			}
		}
	}, false);
	// end other

	return {
		//return
		get viewPortX() {
			return viewPortX;
		},
		get viewPortY() {
			return viewPortY;
		},
		get viewPortZ() {
			return viewPortZ;
		},
		get blockX() {
			return chunkMouseX;
		},
		get blockY() {
			return viewPortY;
		},
		get blockZ() {
			return chunkMouseY;
		},
		make: makeChunk,
		draw: drawChunk,
		move: moveViewPort,
		divideScreen: divideScreen,
		addStruct: addStructure,
		check: checkForSpace,
		place: initPlacementMode,
		mapMouse: mapMouse
		//end return
	};
});
if (typeof module !== "undefined") {
	module.exports = Chunk;
}