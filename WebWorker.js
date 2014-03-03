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
	var noiseData = 0;
	if (y === 15) {
		data = 1;
	} else if (y <= 5) { // sky level is 0-5
		data = 0;
	} else if (y > 8) { // underground level 14-9
		noiseData = Noise.noise3D(x / 10, y / 10, z / 10);
		data = round(noiseData * 256);
	} else if (y <= 8) { // ground level 8-6
		noiseData = Noise.noise3D(x / 10, y / 5, z / 10);
		data = round(noiseData * 256);
	} else { // all other data
		noiseData = Noise.noise3D(x / 10, y / 5, z / 10);
		data = round(noiseData * 256);
	}
	return data;
}

function getCoordinate(x, y, z) {
	"use strict";
	if (y === null) {
		return (z * numberOfBlocksPerAxis) + x;
	} else {
		return (y * numberOfBlocksPerAxis + z) * numberOfBlocksPerAxis + x || 0;
	}
}

self.addEventListener('message', function(event) {
	"use strict";
	if (event.data[OPERATION] === BUILD_CHUNK) {
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
				var heightMapCoordinate = 0;
				var data = 0;
				for (y = numberOfBlocksPerAxis - 1; y > -1; y--) {
					var internalCoordinateX = getCoordinate(x - 1, y, z);
					var internalCoordinateZ = getCoordinate(x, y, z - 1);
					if (internalCoordinateX < 0) {
						internalCoordinateX = 0;
					}
					if (internalCoordinateZ < 0) {
						internalCoordinateZ = 0;
					}
					previousXBlock = blockArray[internalCoordinateX];
					previousZBlock = blockArray[internalCoordinateZ];
					data = chunkBlockAlgorithm(x, y, z, previousXBlock, previousYBlock, previousZBlock);
					internalCoordinate = getCoordinate(x, y, z);
					blockArray[internalCoordinate] = data;
					previousYBlock = data;
				}
				for (y = 0; y < numberOfBlocksPerAxis; y++) {
					internalCoordinate = getCoordinate(x, y, z);
					data = blockArray[internalCoordinate];
					if (heightMapSet === false && data > 0) {
						heightMapSet = true;
						heightMapCoordinate = getCoordinate(x, null, z);
						heightDataArray[heightMapCoordinate] = y;
						y = numberOfBlocksPerAxis;
					}
				}
			}
		}
		self.postMessage([CHUNK_COMPLETE, XCoord, ZCoord, blockArray.buffer, blockDataArray.buffer, heightDataArray.buffer], [blockArray.buffer, blockDataArray.buffer, heightDataArray.buffer]);
	}
}, false);