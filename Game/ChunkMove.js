var Chunk = Module(function() {
	"use strict";
	// name: Chunk
	// targets: Client
	// filenames: Engine

	// variables
	var onScreen = [];
	var mapOffsetX = 0;
	var mapOffsetY = 0;
	var oldWidth = 0;
	var oldHeight = 0;
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
			mouseXBlocks = Math.round((mouseXPixels - BLOCK_SIZE / 2) / BLOCK_SIZE);
			mouseXPixels = mouseXPixels % BLOCK_SIZE;
			mouseXChunks = Math.round((mouseXBlocks - CHUNK_DIMENTION / 2) / CHUNK_DIMENTION);
			mouseXChunks = trueChunkPosition(mouseXChunks);
			if (mouseXPixels > BLOCK_SIZE * CHUNK_DIMENTION * (maxSize + 1)) {
				mouseXBlocks += CHUNK_DIMENTION;
			}
			if (mouseXPixels < 0) {
				mouseXBlocks += (CHUNK_DIMENTION * Math.abs(mouseXChunks));
			}
			mouseXBlocks = Math.abs(mouseXBlocks % CHUNK_DIMENTION);
		} else {
			mouseZ = value;
			mouseZPixels = value - offsetZ;
			mouseZBlocks = Math.round((mouseZPixels - BLOCK_SIZE / 2) / BLOCK_SIZE);
			mouseZPixels = mouseZPixels % BLOCK_SIZE;
			mouseZChunks = Math.round((mouseZBlocks - CHUNK_DIMENTION / 2) / CHUNK_DIMENTION);
			mouseZChunks = trueChunkPosition(mouseZChunks);
			if (mouseZPixels > BLOCK_SIZE * CHUNK_DIMENTION * (maxSize + 1)) {
				mouseZBlocks += CHUNK_DIMENTION;
			}
			if (mouseZPixels < 0) {
				mouseZBlocks += (CHUNK_DIMENTION * Math.abs(mouseZChunks));
			}
			mouseZBlocks = Math.abs(mouseZBlocks % CHUNK_DIMENTION);
		}
		if (text) {
			text.setText(mouseXChunks + "," + mouseZChunks + ": " + mouseXBlocks + "," + offsetYBlocks + "," + mouseZBlocks);
		}
		drawTempBuilding();
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
			// miniMap.clear();
			crosshatch.clear();
			// miniMap.beginFill(0x000000, 1);
			// miniMap.drawRect(-5, -5, miniMap.width + 10, miniMap.height + 10);
			// miniMap.endFill();
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
	// end functions

	// other
	// end other

	return {
		//return
		move: changeOffset,
		divideScreen: divideScreen,
		mapMouse: mapMouse
		//end return
	};
});
if (typeof module !== "undefined") {
	module.exports = Chunk;
}