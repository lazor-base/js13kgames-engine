// copyFile: true
/* global SimplexNoise: false */
importScripts('perlin-noise.js');
importScripts('seedrandom.min.js');

// var chunkHeight = CHUNK_HEIGHT;
var numberOfBlocksPerAxis = CHUNK_DIMENTION;
var Noise;
// var numberOfYChunks = chunkHeight / numberOfBlocksPerAxis;
// var numberOfBlocksPerChunk = numberOfBlocksPerAxis * numberOfBlocksPerAxis * numberOfBlocksPerAxis;
// var numberOfBlocksPerYAxis = numberOfBlocksPerAxis * numberOfBlocksPerAxis;

function round(number) {
	"use strict";
	if (number > 0) {
		return 1;
	} else if (number < 0 || number === 0) {
		return 0;
	}
}

// function getRandomInt(min, max) {
// 	"use strict";
// 	return Math.floor(Math.random() * (max - min + 1) + min);
// }

function chunkBlockAlgorithm(x, y, z /*, lastXBlock, lastYBlock, lastZBlock */ ) {
	"use strict";
	var data = 0;
	if (y === 15) {
		data = 1;
	} else if (y < 5) {
		data = 0;
	} else {
		var noiseData = Noise.noise3D(x / 10, y / 5, z / 10);
		data = round(noiseData * 256);
	}
	// else if (y === 8) {
	// 	data = 1;
	// } else if (y <8 && y > 5) {
	// 	if (lastYBlock > 0) {
	// 		var chance = ((lastZBlock*2)+(lastXBlock*2)+(lastYBlock*2))/6;
	// 		data = round(getRandomInt(-chance, chance));
	// 	} else {
	// 		data = 0;
	// 	}
	// } else if (y < 5) {
	// 	data = 0;
	// } else {
	// 	data = round(getRandomInt(-1, 9));
	// }
	return data;
}

self.addEventListener('message', function(event) {
	"use strict";
	if (event.data[OPERATION] === BUILD_CHUNK) {
		// console.log("Woker: Recieved chunk to create")
		var blockArray = new Uint8Array(event.data[BLOCK_ARRAY]);
		var blockDataArray = new Uint8Array(event.data[DATA_ARRAY]);
		var heightDataArray = new Uint8Array(event.data[HEIGHT_ARRAY]);
		var XCoord = event.data[X_COORDINATE];
		var ZCoord = event.data[Z_COORDINATE];
		Math.seedrandom("seed" + XCoord + ZCoord);
		Noise = new SimplexNoise(Math.random);
		var previousZBlock = 0;
		for (var z = 0; z < numberOfBlocksPerAxis; z++) {
			var previousXBlock = 0;
			for (var x = 0; x < numberOfBlocksPerAxis; x++) {
				var previousYBlock = 0;
				var heightMapSet = false;
				var y = 0;
				var internalCoordinate = 0;
				var data = 0;
				for (y = numberOfBlocksPerAxis - 1; y > -1; y--) {
					var internalCoordinateX = (((y * numberOfBlocksPerAxis + z) * numberOfBlocksPerAxis + (x - 1))) || 0;
					var internalCoordinateZ = (((y * numberOfBlocksPerAxis + (z - 1)) * numberOfBlocksPerAxis + x)) || 0;
					if (internalCoordinateX < 0) {
						internalCoordinateX = 0;
					}
					if (internalCoordinateZ < 0) {
						internalCoordinateZ = 0;
					}
					// previousXBlock = chunk.Sections[i].Blocks.get(internalCoordinateX);
					previousXBlock = blockArray[internalCoordinateX];
					// previousZBlock = chunk.Sections[i].Blocks.get(internalCoordinateZ);
					previousZBlock = blockArray[internalCoordinateZ];
					data = chunkBlockAlgorithm(x, y, z, previousXBlock, previousYBlock, previousZBlock);
					// var data = round(simplex.noise3D(x, y, z));
					// 	var data = round(getRandomInt(-1, 5));
					internalCoordinate = ((y * numberOfBlocksPerAxis + z) * numberOfBlocksPerAxis + x);
					// chunk.Sections[i].Blocks.set(internalCoordinate, data);
					blockArray[internalCoordinate] = data;
					previousYBlock = data;


					// if(data > 0 && y < heightDataArray[(z * numberOfBlocksPerAxis) + x]) {
					// 	heightDataArray[(z * numberOfBlocksPerAxis) + x] = y;
					// }
				}
				for (y = 0; y < numberOfBlocksPerAxis; y++) {
					internalCoordinate = ((y * numberOfBlocksPerAxis + z) * numberOfBlocksPerAxis + x);
					data = blockArray[internalCoordinate];
					// var data = chunk.Sections[i].Blocks.get(internalCoordinate);
					if (heightMapSet === false && data > 0) {
						heightMapSet = true;
						heightDataArray[(z * numberOfBlocksPerAxis) + x] = y;
						// chunk.HeightMap.set((z * numberOfBlocksPerAxis) + x, y);
						y = numberOfBlocksPerAxis;
					}
				}
			}
		}
		// console.log("Worker: Sending completed chunk.", Date.now()-startTime)
		self.postMessage([CHUNK_COMPLETE, XCoord, ZCoord, blockArray.buffer, blockDataArray.buffer, heightDataArray.buffer], [blockArray.buffer, blockDataArray.buffer, heightDataArray.buffer]);
	}
}, false);