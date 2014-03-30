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
	var worker = new Worker('WebWorker.js');
	var onScreen = [];
	var blockCache = {};
	var firstRun = true;
	var maxSize = 3;

	// end variables

	// functions

	//////////////////////
	// HELPER FUNCTIONS //
	//////////////////////

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

	///////////////////////
	// REGULAR FUNCTION //
	///////////////////////

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

	// end functions

	// other
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
		make: makeChunk
		//end return
	};
});
if (typeof module !== "undefined") {
	module.exports = Chunk;
}