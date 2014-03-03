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
	var graphics = new PIXI.Graphics();
	var textHost = new PIXI.DisplayObjectContainer();
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
	// end variables

	// functions

	function getCoordinate(x, y, z) {
		if (y === null) {
			return (z * numberOfBlocksPerAxis) + x;
		} else {
			return (y * numberOfBlocksPerAxis + z) * numberOfBlocksPerAxis + x || 0;
		}
	}

	function addStructure(structure) {
		var chunkX = Math.round((chunkMouseX - numberOfBlocksPerAxis / 2) / numberOfBlocksPerAxis);
		var chunkZ = Math.round((chunkMouseY - numberOfBlocksPerAxis / 2) / numberOfBlocksPerAxis);
		var chunk = makeChunk(chunkX, chunkZ);
		chunk.Structures.push(structure);
		drawStructures(chunk);
	}

	function checkForSpace(structure) {
		var positionWithinChunkX = chunkMouseX % CHUNK_DIMENTION;
		var positionWithinChunkZ = chunkMouseY % CHUNK_DIMENTION;
		if (positionWithinChunkX < 0) {
			positionWithinChunkX += CHUNK_DIMENTION;
		}
		if (positionWithinChunkZ < 0) {
			positionWithinChunkZ += CHUNK_DIMENTION;
		}
		var chunkX = Math.round((chunkMouseX - numberOfBlocksPerAxis / 2) / numberOfBlocksPerAxis);
		var chunkZ = Math.round((chunkMouseY - numberOfBlocksPerAxis / 2) / numberOfBlocksPerAxis);
		var structureDepthInBlocks = Math.round((structure[STRUCTURE_DEPTH] - BLOCK_SIZE / 2) / BLOCK_SIZE);
		var structureWidthInBlocks = Math.round((structure[STRUCTURE_WIDTH] - BLOCK_SIZE / 2) / BLOCK_SIZE);
		var yIndex = 0;
		var chunk = makeChunk(chunkX, chunkZ);
		var heightMapCoordinate = getCoordinate(positionWithinChunkX, null, positionWithinChunkZ);
		if (chunk.HeightMap[heightMapCoordinate] - 1 > viewPortY - 1) {
			yIndex = chunk.HeightMap[heightMapCoordinate] - 1;
		} else {
			yIndex = viewPortY - 1;
		}
		console.log("Trying to place structure at:", chunkMouseX, yIndex, chunkMouseY);
		var internalCoordinate = getCoordinate(positionWithinChunkX, yIndex, positionWithinChunkZ);
		if (chunk.Blocks[internalCoordinate] === 0) {
			for (var z = 0; z < structureDepthInBlocks; z++) {
				for (var x = 0; x < structureWidthInBlocks; x++) {
					internalCoordinate = getCoordinate(positionWithinChunkX + x, yIndex, positionWithinChunkZ + z);
					if (chunk.Blocks[internalCoordinate] !== 0) {
						console.warn("Cannot place structure at:", positionWithinChunkX + x, yIndex, positionWithinChunkZ + z, "Reason: block in the way");
						return -1;
					}
					internalCoordinate = getCoordinate(positionWithinChunkX + x, yIndex - 1, positionWithinChunkZ + z);
					if (chunk.Blocks[internalCoordinate] !== 0) {
						console.warn("Cannot place structure at:", positionWithinChunkX + x, yIndex - 1, positionWithinChunkZ + z, "Reason: no block to build on");
						return -1;
					}
				}
			}
			for (var i = 0; i < chunk.Structures.length; i++) {
				var thisStructure = chunk.Structures[i];
				var result = simpleTest(positionWithinChunkX, yIndex, positionWithinChunkZ, structure, thisStructure);
				if (result) {
					console.warn("Cannot place structure at:", positionWithinChunkX, yIndex, positionWithinChunkZ, "Reason: structure in the way");
					return -1;
				}
			}
			return yIndex;
		} else {
			console.warn("Cannot place structure at:", positionWithinChunkX, yIndex, positionWithinChunkZ, "Reason: block in the way");
			return -1;
		}
	}

	function collision(AX1, AY1, AX2, AY2, BX1, BY1, BX2, BY2) {
		if (AX1 < BX1) {
			console.log(AX1, "AX1 < BX1", BX1);
			if (AX2 <= BX1) {
				console.log(AX2, "AX2 <= BX1", BX1);
				return false;
			} else {
				console.log(AX2, "AX2 > BX1", BX1);
				if (AY1 < BY1) {
					console.log(AY1, "AY1 < BY1", BY1);
					if (AY2 <= BY1) {
						console.log(AY2, "AY2 <= BY1", BY1);
						return false;
					} else {
						console.log(AY2, "AY2 > BY1", BY1);
						return true;
					}
				} else {
					console.log(AY1, "AY1 > BY1", BY1);
					if (AY1 >= BY2) {
						console.log(AY1, "AY1 >= BY2", BY2);
						return false;
					} else {
						console.log(AY1, "AY1 < BY2", BY2);
						return true;
					}
				}
			}
		} else {
			console.log(AX1, "AX1 > BX1", BX1);
			if (AX1 >= BX2) {
				console.log(AX1, "AX1 >= BX2", BX2);
				return false;
			} else {
				console.log(AX1, "AX1 < BX2", BX2);
				if (AY1 < BY1) {
					console.log(AY1, "AY1 < BY1", BY1);
					if (AY2 <= BY1) {
						console.log(AY2, "AY2 <= BY1", BY1);
						return false;
					} else {
						console.log(AY2, "AY2 > BY1", BY1);
						return true;
					}
				} else {
					console.log(AY1, "AY1 > BY1", BY1);
					if (AY1 >= BY2) {
						console.log(AY1, "AY1 >= BY2", BY2);
						return false;
					} else {
						console.log(AY1, "AY1 < BY2", BY2);
						return true;
					}
				}
			}
		}
		console.log("false");
		return false; // should never get here
	}

	function simpleTest(x, y, z, structureDefinition, structure) {
		var structure1Left = x * BLOCK_SIZE;
		var structure1Right = structure1Left + structureDefinition[STRUCTURE_WIDTH];
		var structure1Top = z * BLOCK_SIZE;
		var structure1Bottom = structure1Top + structureDefinition[STRUCTURE_DEPTH];
		var structure1Surface = y * BLOCK_SIZE;
		var structure1Base = structure1Surface - structureDefinition[STRUCTURE_HEIGHT];
		var structure2Left = structure[STRUCTURE_X] * BLOCK_SIZE;
		var structure2Right = structure2Left + structure[STRUCTURE_WIDTH];
		var structure2Top = structure[STRUCTURE_Z] * BLOCK_SIZE;
		var structure2Bottom = structure2Top + structure[STRUCTURE_DEPTH];
		var structure2Surface = structure[STRUCTURE_Y] * BLOCK_SIZE;
		var structure2Base = structure2Surface - structure[STRUCTURE_HEIGHT];
		var result = collision(structure1Left, structure1Top, structure1Right, structure1Bottom, structure2Left, structure2Top, structure2Right, structure2Bottom);
		if (result) {
			console.log("collide");
			if (structure1Base < structure2Base) {
				console.log(structure1Base, "structure1Base < structure2Base", structure2Base);
				if (structure1Surface <= structure2Base) {
					console.log(structure1Surface, "structure1Surface <= structure2Base", structure2Base);
					return false;
				} else {
					console.log(structure1Surface, "structure1Surface > structure2Base", structure2Base);
					return true;
				}
			} else {
				console.log(structure1Base, "structure1Base > structure2Base", structure2Base);
				if (structure1Base >= structure2Surface) {
					console.log(structure1Base, "structure1Base >= structure2Surface", structure2Surface);
					return false;
				} else {
					console.log(structure1Base, "structure1Base < structure2Surface", structure2Surface);
					return true;
				}
			}
			return false;
		}
		// return simpleTestX(x, y, z, structureDefinition, structure);
	}

	function mapMouse(type, value) {
		if (type === "X") {
			chunkMouseX = Math.round(((value - viewPortX) - BLOCK_SIZE / 2) / BLOCK_SIZE);

		} else {
			chunkMouseY = Math.round(((value - viewPortZ) - BLOCK_SIZE / 2) / BLOCK_SIZE);
		}
		if (text) {
			text.setText(chunkMouseX + "," + viewPortY + "," + chunkMouseY);
		}
	}

	function moveViewPort(x, y, z) {
		var oldViewPortX = viewPortX;
		var oldViewPortY = viewPortY;
		var oldViewPortZ = viewPortZ;
		if (x !== null) {
			viewPortX += x;
			mapOffsetX += x;
			graphics.position.x = mapOffsetX;
			textHost.position.x = mapOffsetX;
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
		}
		if (z !== null) {
			viewPortZ += z;
			mapOffsetY += z;
			graphics.position.y = mapOffsetY;
			textHost.position.y = mapOffsetY;
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
			if (chunks.current[attr] && chunks.current[attr].Renderable && chunks.current[attr].Structures.length === 0) {
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
			graphics.position.x = 0;
			textHost.position.x = 0;
			graphics.position.y = 0;
			textHost.position.y = 0;
			mapOffsetX = 0;
			mapOffsetY = 0;
			graphics.clear();
			for (var r = -1; r < verticalChunks + 1; r++) {
				for (var t = -1; t < horizontalChunks + 1; t++) {
					var X = Xcoordinate + t;
					var Z = Zcoordinate + r;
					// optional Staggered or AllAtOnce
					Mixed(X, Z);
				}
			}
		}
		// console.log(onScreen)
		oldViewPortX = viewPortX;
		oldViewPortY = viewPortY;
		oldViewPortZ = viewPortZ;
		oldWidth = width;
		oldHeight = height;
		firstRun = false;
		// console.timeEnd("divide screen")
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
			block.drawFn(graphics, block, xCoordinate, y, zCoordinate, heightMapData, blockData);
		}
	}

	function drawPartialChunk(chunk, x, z, chunkX, chunkZ) {
		var heightMapCoordinate = getCoordinate(x, null, z);
		var heightMapData = chunk.HeightMap[heightMapCoordinate];
		var xCoordinate = (x * BLOCK_SIZE) + viewPortX - (chunkX * -512);
		var zCoordinate = (z * BLOCK_SIZE) + viewPortZ - (chunkZ * -512);
		// if (viewPortY === 14) {
		// 	if (heightMapData > 13) {
		// 		console.log(heightMapData);
		// 	}
		// }
		if (viewPortY > heightMapData) {
			for (var y = viewPortY; y < numberOfBlocksPerAxis; y++) {
				var internalCoordinate = getCoordinate(x, y, z);
				var blockId = chunk.Blocks[internalCoordinate];
				if (blockId) {
					 return drawBlock(heightMapData, chunk, x, y, z, xCoordinate, zCoordinate);
				}
			}
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
		// text.position.x = viewPortX - (chunkX * -512);
		// text.position.y = viewPortZ - (chunkZ * -512);
		// textHost.addChild(text);
		// console.timeEnd("render Chunk");
	}

	function drawStructures(chunk) {
		var chunkX = chunk.Data[CHUNK_X];
		var chunkZ = chunk.Data[CHUNK_Z];
		for (var i = 0; i < chunk.Structures.length; i++) {
			var structure = chunk.Structures[i];
			var structureY = structure[STRUCTURE_Y];
			var structure2Base = structureY + (structure[STRUCTURE_HEIGHT] / BLOCK_SIZE);
			if (structure2Base > viewPortY) {
				var structureX = structure[STRUCTURE_X];
				var structureZ = structure[STRUCTURE_Z];
				var xCoordinate = (structureX * BLOCK_SIZE) + viewPortX - (chunkX * -512);
				var zCoordinate = (structureZ * BLOCK_SIZE) + viewPortZ - (chunkZ * -512);
				chunk.Structures[i].drawFn(graphics, structure, xCoordinate, structureY, zCoordinate);
			}
		}
	}
	// end functions

	// other
	GUI_ON("RenderReady", function() {
		DRAW_STAGE.addChild(graphics);
		DRAW_STAGE.addChild(textHost);
		text = new PIXI.Text(0 + "," + 0, {
			font: "50px Arial",
			fill: "red"
		});
		text.position.x = 10;
		text.position.y = 10;
		textHost.addChild(text);

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
		mapMouse: mapMouse
		//end return
	};
});
if (typeof module !== "undefined") {
	module.exports = Chunk;
}