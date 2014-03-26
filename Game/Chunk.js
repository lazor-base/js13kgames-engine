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
	var numberOfBlocksPerChunk = CHUNK_DIMENTION * CHUNK_DIMENTION * CHUNK_DIMENTION;
	var numberOfBlocksPerYAxis = CHUNK_DIMENTION * CHUNK_DIMENTION;
	var tempBuilding = new PIXI.Graphics();
	var crosshatch = new PIXI.Graphics();
	var miniMap = new PIXI.Graphics();
	var structureDetails = null;
	var layeredGraphics = [];
	var layeredText = [];
	for (var i = 0; i < CHUNK_HEIGHT; i++) {
		layeredGraphics.push(new PIXI.Graphics());
		layeredText.push(new PIXI.DisplayObjectContainer());
	}
	var worker = new Worker('WebWorker.js');
	var onScreen = [];
	var blockCache = {};
	var mapOffsetX = 0;
	var mapOffsetY = 0;
	var oldWidth = 0;
	var oldHeight = 0;
	var firstRun = true;
	var text;
	var buildMode = IDLE_MODE;
	var maxSize = 3;
	//////////////
	// OFFSETS //
	//////////////

	var offsetX = 0;
	var offsetY = 0;
	var offsetZ = 0;
	var mouseX = 0;
	var mouseZ = 0;

	var mouseXChunks = 0;
	var mouseZChunks = 0;
	var offsetXChunks = 0;
	var offsetYChunks = 0;
	var offsetZChunks = 0;

	var mouseXBlocks = 0;
	var mouseZBlocks = 0;
	var offsetXBlocks = 0;
	var offsetYBlocks = 0;
	var offsetZBlocks = 0;

	var mouseXPixels = 0;
	var mouseZPixels = 0;
	var offsetXPixels = 0;
	var offsetYPixels = 0;
	var offsetZPixels = 0;

	var oldOffsetX = 0;
	var oldOffsetY = 0;
	var oldOffsetZ = 0;

	var oldMouseXChunks = 0;
	var oldMouseZChunks = 0;
	var oldOffsetXChunks = 0;
	var oldOffsetYChunks = 0;
	var oldOffsetZChunks = 0;

	var oldMouseXBlocks = 0;
	var oldMouseZBlocks = 0;
	var oldOffsetXBlocks = 0;
	var oldOffsetYBlocks = 0;
	var oldOffsetZBlocks = 0;

	var oldMouseXPixels = 0;
	var oldMouseZPixels = 0;
	var oldOffsetXPixels = 0;
	var oldOffsetYPixels = 0;
	var oldOffsetZPixels = 0;

	var differentX = oldOffsetX !== offsetX;
	var differentY = oldOffsetY !== offsetY;
	var differentZ = oldOffsetZ !== offsetZ;

	// end variables

	// functions

	//////////////////////
	// HELPER FUNCTIONS //
	//////////////////////

	function getCoordinate(x, y, z) {
		if (x < 0 || typeof x !== "number") {
			x = 0;
		}
		if (y < 0 || typeof y !== "number") {
			y = 0;
		}
		if (z < 0 || typeof z !== "number") {
			z = 0;
		}

		var result = (y * CHUNK_DIMENTION + z) * CHUNK_DIMENTION + x;
		if (result < 0) {
			throw new Error("Attempt to index block out of range, " + x + "," + y + "," + z);
		}
		return result;
	}

	// function positionWithinChunk(position) {
	// 	var newPosition = position % CHUNK_DIMENTION;
	// 	if (newPosition < 0) {
	// 		newPosition += CHUNK_DIMENTION;
	// 	}
	// 	return newPosition;
	// }

	function getLowestBlock(chunk, x, z, optionalY) {
		if (typeof optionalY === "undefined") {
			optionalY = offsetYBlocks;
		}
		for (var y = optionalY; y < CHUNK_DIMENTION; y++) {
			var internalCoordinate = getCoordinate(x, y, z);
			var blockId = chunk.Blocks[internalCoordinate];
			if (blockId) {
				return y;
			}
		}
		throw new Error("Unable to find lowest block, " + x + "," + optionalY + "," + z);
	}

	function resize(original, divisor) {
		// var sign = original ? original < 0 ? -1 : 1 : 0;
		// return Math.round((Math.abs(original) - divisor / 2) / divisor) * sign;
		return Math.round((original - divisor / 2) / divisor);
	}

	function viewPortResize(original, divisor) {
		var sign = original ? original < 0 ? -1 : 1 : 0;
		return Math.round((Math.abs(original) - divisor / 2) / divisor) * sign;
	}

	function findChunk(x, z, drawX, drawZ) {
		// console.time("find chunk");

		var chunkX = Math.round((x - CHUNK_DIMENTION / 2) / CHUNK_DIMENTION);
		var chunkZ = Math.round((z - CHUNK_DIMENTION / 2) / CHUNK_DIMENTION);
		var chunk = makeChunk(chunkX, chunkZ, drawX, drawZ);
		// console.timeEnd("find chunk");
		return chunk;
	}


	function trueViewPort(position) {
		if (position < -1 * (maxSize + 1) * BLOCK_SIZE * CHUNK_DIMENTION) {
			position = ((maxSize + 1) * BLOCK_SIZE * CHUNK_DIMENTION) + (position % ((maxSize + 0) * BLOCK_SIZE * CHUNK_DIMENTION));
		}
		if (position > (maxSize + 0) * BLOCK_SIZE * CHUNK_DIMENTION) {
			position = (-1 * (maxSize + 1) * BLOCK_SIZE * CHUNK_DIMENTION) + (position % ((maxSize + 0) * BLOCK_SIZE * CHUNK_DIMENTION));
		}
		return position;
	}

	function positionWithinChunk(position) {
		if (position < 0) {
			position += CHUNK_DIMENTION;
		}
		if (position >= CHUNK_DIMENTION) {
			position = position % CHUNK_DIMENTION;
		}
		return position;
	}

	function trueChunkPosition(position) {
		if (position > maxSize) {
			position = -maxSize + (position % (maxSize + 1));
		}
		if (position < -maxSize) {
			position = maxSize + (position % (maxSize + 1));
		}
		return position;
	}

	// function intersects(x, z, circleX, circleZ, radius) {
	// 	var deltaX = x - circleX;
	// 	var deltaZ = z - circleZ;
	// 	return deltaX * deltaX + deltaZ * deltaZ <= radius * radius;
	// }

	///////////////////////
	// REGULAR FUNCTION //
	///////////////////////

	function mapMouse(type, value) {
		oldMouseXChunks = mouseXChunks;
		oldMouseZChunks = mouseZChunks;

		oldMouseXBlocks = mouseXBlocks;
		oldMouseZBlocks = mouseZBlocks;

		oldMouseXPixels = mouseXPixels;
		oldMouseZPixels = mouseZPixels;
		if (type === "X") {
			mouseX = value;
			mouseXPixels = value - offsetX;
			// if (mouseXPixels < 0) {
			// mouseXPixels = ((maxSize + 1) * BLOCK_SIZE * CHUNK_DIMENTION) + mouseXPixels;
			// }
			// mouseXBlocks = resize(mouseXPixels, BLOCK_SIZE);
			mouseXBlocks = Math.round((mouseXPixels - BLOCK_SIZE / 2) / BLOCK_SIZE);
			mouseXPixels = mouseXPixels % BLOCK_SIZE;
			mouseXChunks = Math.round((mouseXBlocks - CHUNK_DIMENTION / 2) / CHUNK_DIMENTION);
			mouseXChunks = trueChunkPosition(mouseXChunks);
			if (mouseXBlocks < 0) {
				mouseXBlocks += CHUNK_DIMENTION;
			}
			mouseXBlocks = mouseXBlocks % CHUNK_DIMENTION;
		} else {
			mouseZ = value;
			mouseZPixels = value - offsetZ;
			// if (mouseZPixels < 0) {
			// mouseZPixels = ((maxSize + 1) * BLOCK_SIZE * CHUNK_DIMENTION) + mouseZPixels;
			// }
			// mouseZBlocks = resize(mouseZPixels, BLOCK_SIZE);
			mouseZBlocks = Math.round((mouseZPixels - BLOCK_SIZE / 2) / BLOCK_SIZE);
			mouseZPixels = mouseZPixels % BLOCK_SIZE;
			mouseZChunks = Math.round((mouseZBlocks - CHUNK_DIMENTION / 2) / CHUNK_DIMENTION);
			mouseZChunks = trueChunkPosition(mouseZChunks);
			if (mouseZBlocks < 0) {
				mouseZBlocks += CHUNK_DIMENTION;
			}
			mouseZBlocks = mouseZBlocks % CHUNK_DIMENTION;
		}
		if (text) {
			text.setText(mouseXBlocks + "," + offsetYBlocks + "," + mouseZBlocks);
		}
		drawTempBuilding();
	}

	function addStructure(positionX, positionY, positionZ, structure) {
		var chunk = makeChunk(mouseXChunks, mouseZChunks);
		var result = structureSize(structure, function(x, y, z) {
			var newChunk = makeChunk(mouseXChunks + x, mouseZChunks + z);
			var internalCoordinate = getCoordinate(mouseXBlocks, positionY + y, mouseZBlocks);
			newChunk.BlockData[internalCoordinate] = 1;
			if (newChunk.Modified === false) {
				newChunk.Modified = true;
			}
		});
		if (result !== undefined) {
			return result;
		}
		chunk.Structures.push(structure);
		renderPosition(function(positionX, positionZ) {
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
		// console.clear();
		var yIndex = 0;
		var chunk = makeChunk(mouseXChunks, mouseZChunks);
		var heightMapCoordinate = getCoordinate(mouseXBlocks, null, mouseZBlocks);
		if (chunk.HeightMap[heightMapCoordinate] - 1 > offsetYBlocks - 1) {
			yIndex = chunk.HeightMap[heightMapCoordinate] - 1;
		} else {
			yIndex = getLowestBlock(chunk, mouseXBlocks, mouseZBlocks) - 1; // we want to place above that block, not in it!
		}
		var internalCoordinate = getCoordinate(mouseXBlocks, yIndex, mouseZBlocks);
		// console.log("Testing:", mouseXChunks + ",", mouseZChunks + ":", mouseXBlocks + ",", yIndex + ",", mouseZBlocks);
		if (chunk.Blocks[internalCoordinate] === 0) {
			var result = structureSize(structure, function(x, y, z) {
				var newChunk = findChunk((mouseXChunks * CHUNK_DIMENTION) + mouseXBlocks + x, (mouseZChunks * CHUNK_DIMENTION) + mouseZBlocks + z);
				var currentX = positionWithinChunk(mouseXBlocks + x);
				var currentY = yIndex + y;
				var currentZ = positionWithinChunk(mouseZBlocks + z);
				internalCoordinate = getCoordinate(currentX, currentY, currentZ);
				if (newChunk.Modified) {
					if (newChunk.BlockData[internalCoordinate] === 1) {
						// console.warn("Cannot place structure at:", currentX, currentY, currentZ, "Reason: structure in the way");
						return -1;
					}
				}
				if (y === 1) {
					// console.log("Testing, expecting solid:", newChunk.Data[CHUNK_X] + ",", newChunk.Data[CHUNK_Z] + ":", (currentX) + ",", (currentY) + ",", currentZ, "result:", newChunk.Blocks[internalCoordinate]);
					if (newChunk.Blocks[internalCoordinate] === 0) {
						// console.warn("Cannot place structure at:", currentX, currentY, currentZ, "Reason: no block to build on");
						return -1;
					}
				}
				/*else {
					console.log("Testing, expecting empty:", newChunk.Data[CHUNK_X] + ",", newChunk.Data[CHUNK_Z] + ":", (currentX) + ",", (currentY) + ",", currentZ, "result:", newChunk.Blocks[internalCoordinate]);

				}*/
				if (newChunk.Blocks[internalCoordinate] > 0 && y < 1) {
					// console.log(mouseXBlocks, x, mouseZBlocks, z);
					// console.warn("Cannot place structure at:", currentX, currentY, currentZ, "Reason: block in the way");
					return -1;
				}
			});
			if (result !== undefined) {
				return result;
			}
			return yIndex;
		} else {
			// console.warn("Cannot place structure at:", mouseXBlocks, yIndex, mouseZBlocks, "Reason: block in the way");
			return -1;
		}
	}

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

	function onMove() {
		var result = false;
		for (var i = 0; i < CHUNK_HEIGHT; i++) {
			layeredGraphics[i].position.x = mapOffsetX;
			layeredText[i].position.x = mapOffsetX;
			tempBuilding.position.x = mapOffsetX;
			tempBuilding.position.y = mapOffsetY;
			layeredGraphics[i].position.y = mapOffsetY;
			layeredText[i].position.y = mapOffsetY;
			if (i < offsetYChunks - 1) {
				result = false;
			} else {
				result = true;
			}
			layeredGraphics[i].visible = result;
			layeredText[i].visible = result;
		}
	}

	function changeOffset(x, y, z) {
		oldOffsetX = offsetX;
		oldOffsetY = offsetY;
		oldOffsetZ = offsetZ;

		oldOffsetXChunks = offsetXChunks;
		oldOffsetZChunks = offsetZChunks;
		oldOffsetYChunks = offsetYChunks;

		oldOffsetXBlocks = offsetXBlocks;
		oldOffsetYBlocks = offsetYBlocks;
		oldOffsetZBlocks = offsetZBlocks;

		oldOffsetXPixels = offsetXPixels;
		oldOffsetYPixels = offsetYPixels;
		oldOffsetZPixels = offsetZPixels;

		if (x !== null) {
			offsetX += x;
			offsetX = trueViewPort(offsetX);
			mapOffsetX += x;
			offsetXPixels = offsetX;
			offsetXBlocks = viewPortResize(offsetXPixels, BLOCK_SIZE);
			offsetXPixels = offsetXPixels % BLOCK_SIZE;
			offsetXChunks = viewPortResize(offsetXBlocks, CHUNK_DIMENTION);
			offsetXBlocks = offsetXBlocks % CHUNK_DIMENTION;
		}
		if (y !== null) {
			if (y < 0) {
				offsetYBlocks--;
			} else {
				offsetYBlocks++;
			}
			if (offsetYBlocks > CHUNK_HEIGHT - 2) { // always show ground (15) layer
				offsetYBlocks = CHUNK_HEIGHT - 2;
			}
			if (offsetYBlocks < 0) {
				offsetYBlocks = 0;
			}
		}
		if (z !== null) {
			offsetZ += z;
			offsetZ = trueViewPort(offsetZ);
			mapOffsetY += z;
			offsetZPixels = offsetZ;
			offsetZBlocks = viewPortResize(offsetZPixels, BLOCK_SIZE);
			offsetZPixels = offsetZPixels % BLOCK_SIZE;
			offsetZChunks = viewPortResize(offsetZBlocks, CHUNK_DIMENTION);
			offsetZBlocks = offsetZBlocks % CHUNK_DIMENTION;
		}
		onMove();
		differentX = oldOffsetX !== offsetX;
		differentY = oldOffsetYBlocks !== offsetYBlocks;
		differentZ = oldOffsetZ !== offsetZ;
		if (differentX || differentY || differentZ) {
			return true;
		}
		return false;
	}

	function makeChunk(positionX, positionZ, drawX, drawZ) {
		positionX = trueChunkPosition(positionX);
		positionZ = trueChunkPosition(positionZ);
		var recycledChunk = false;
		if (chunks.current[positionX + "," + positionZ]) {
			return chunks.current[positionX + "," + positionZ];
		}
		var chunk;
		if (chunks.old.length) {
			recycledChunk = true;
			// console.time("recycled chunk")
			chunk = chunks.old.pop();
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
		chunk.Data[CHUNK_LAST_UPDATED] = 0;
		chunk.Data[CHUNK_TIME_INHABITED] = 0;
		worker.postMessage([BUILD_CHUNK, positionX, positionZ, chunk.Blocks.buffer, chunk.BlockData.buffer, chunk.HeightMap.buffer, drawX, drawZ], [chunk.Blocks.buffer, chunk.BlockData.buffer, chunk.HeightMap.buffer]);
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

	function mixed2(X, Z, drawX, drawZ) {
		var newChunk = makeChunk(X, Z, drawX, drawZ);
		drawChunk(newChunk, drawX, drawZ);
		drawStructures(newChunk, drawX, drawZ);
	}

	function Mixed(X, Z, drawX, drawZ) {
		var positionX = trueChunkPosition(X);
		var positionZ = trueChunkPosition(Z);
		var positionString = positionX + "," + positionZ;
		if (firstRun) {
			var chunk = makeChunk(X, Z, drawX, drawZ);
			drawChunk(chunk, drawX, drawZ);
			drawStructures(chunk, drawX, drawZ);
		} else if (chunks.current[positionString] && chunks.current[positionString].Renderable) {
			drawChunk(chunks.current[positionString], drawX, drawZ);
			drawStructures(chunks.current[positionString], drawX, drawZ);
		} else {
			LOOP_QUEUE(5, mixed2, [X, Z, drawX, drawZ]);
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
		// console.time("divide screen")
		onScreen.length = 0;
		var width = window.innerWidth;
		var height = window.innerHeight;
		var chunkPixelSize = BLOCK_SIZE * CHUNK_DIMENTION;
		var verticalChunks = height / chunkPixelSize;
		var horizontalChunks = width / chunkPixelSize;

		var differentWidth = oldWidth !== width;
		var differentHeight = oldHeight !== height;
		var chunkChange = false;
		if (differentWidth || differentHeight || differentX || differentZ || force) {
			for (var e = -1; e < horizontalChunks + 1; e++) {
				for (var i = -1; i < verticalChunks + 1; i++) {
					onScreen.push(trueChunkPosition(-offsetXChunks + e) + "," + trueChunkPosition(-offsetZChunks + i));
				}
			}
			for (var attr in chunks.current) {
				cleanChunks(attr);
			}
			chunkChange = true;
		}
		if (differentWidth || differentHeight || differentY || chunkChange || force) {
			for (var f = 0; f < CHUNK_HEIGHT; f++) {
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
			crosshatch.clear();
			miniMap.beginFill(0x000000, 1);
			miniMap.drawRect(-5, -5, miniMap.width + 10, miniMap.height + 10);
			miniMap.endFill();
			tempBuilding.position.x = 0;
			tempBuilding.position.y = 0;
			drawTempBuilding(true);
			mapOffsetX = 0;
			mapOffsetY = 0;
			// Mixed(0, 0, 0, 0);
			renderPosition(function(positionX, positionZ) {
				var chunkX = -offsetXChunks + positionX;
				var chunkZ = -offsetZChunks + positionZ;
				Mixed(chunkX, chunkZ, positionX, positionZ);
				// Staggered(chunkX, chunkZ, positionX, positionZ);
				// AllAtOnce(chunkX, chunkZ, positionX, positionZ);
			});
		}
		firstRun = false;
		// console.timeEnd("divide screen")
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
		miniMap.width = Math.ceil(window.innerWidth / BLOCK_SIZE) * 4;
		miniMap.height = Math.ceil(window.innerHeight / BLOCK_SIZE) * 4;
		miniMap.position.x = window.innerWidth - miniMap.width - 5;
		miniMap.position.y = 5;
		DRAW_STAGE.addChild(crosshatch);
		crosshatch.alpha = 0.25;
		DRAW_STAGE.addChild(tempBuilding);
		DRAW_STAGE.addChild(miniMap);
		tempBuilding.alpha = 0.25;
		DRAW_STAGE.addChild(text);
	});
	// LOOP_EVERY("frame", function() {
	// 	oldChunkMouseX = chunkMouseX;
	// 	oldChunkMouseY = chunkMouseY;
	// });
	worker.addEventListener('message', function(e) {
		if (e.data[OPERATION] === CHUNK_COMPLETE) {
			var chunk = chunks.current[e.data[X_COORDINATE] + "," + e.data[Z_COORDINATE]];
			if (chunk) {
				var drawX = e.data[DRAW_X];
				var drawZ = e.data[DRAW_Z];
				chunk.HeightMap = new Uint8Array(e.data[HEIGHT_ARRAY]);
				chunk.Blocks = new Uint8Array(e.data[BLOCK_ARRAY]);
				chunk.BlockData = new Uint8Array(e.data[DATA_ARRAY]);
				chunk.Renderable = true;
				drawChunk(chunk, drawX, drawZ);
			}
		}
	}, false);
	// end other

	return {
		//return
		make: makeChunk,
		draw: drawChunk,
		move: changeOffset,
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