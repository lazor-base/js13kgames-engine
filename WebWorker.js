// copyFile: true
importScripts('seedrandom.min.js');
var chunkHeight = CHUNK_HEIGHT;
var numberOfBlocksPerAxis = CHUNK_DIMENTION;
var numberOfYChunks = chunkHeight / numberOfBlocksPerAxis;
var numberOfBlocksPerChunk = numberOfBlocksPerAxis * numberOfBlocksPerAxis * numberOfBlocksPerAxis;
var numberOfBlocksPerYAxis = numberOfBlocksPerAxis * numberOfBlocksPerAxis;
function chunkBlockAlgorithm(x, y, z, lastXBlock, lastYBlock, lastZBlock) {
	if (y === 15) {
		var data = 1;
	} else if (y === 8) {
		var data = 1;
	} else if (y < 8 && y > 4) {
		if (lastYBlock > 0) {
			var data = round(getRandomInt(-8, y / 2));
		} else {
			var data = 0;
		}
	} else if (y < 5) {
		var data = 0;
	} else {
		var data = round(getRandomInt(-1, 9));
		// var data = round(simplex.noise3D(x, y, z));
	}
	return data;
}

function round(number) {
	if (number > 0) {
		return 1;
	} else if (number < 0 || number === 0) {
		return 0;
	}
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

self.addEventListener('message', function(event) {
	if (event.data[OPERATION] === BUILD_CHUNK) {
		var startTime = Date.now();
		// console.log("Woker: Recieved chunk to create")
		var blockArray = new Uint8Array(event.data[BLOCK_ARRAY]);
		var blockDataArray = new Uint8Array(event.data[DATA_ARRAY]);
		var heightDataArray = new Uint8Array(event.data[HEIGHT_ARRAY]);
		var XCoord = event.data[X_COORDINATE];
		var ZCoord = event.data[Z_COORDINATE];
		Math.seedrandom("seed" + XCoord + ZCoord);
		var previousZBlock = 0;
		for (var z = 0; z < numberOfBlocksPerAxis; z++) {
			var previousXBlock = 0;
			for (var x = 0; x < numberOfBlocksPerAxis; x++) {
				var previousYBlock = 0;
				heightMapSet = false;
				for (var y = numberOfBlocksPerAxis - 1; y > -1; y--) {
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
					var data = chunkBlockAlgorithm(x, y, z, previousXBlock, previousYBlock, previousZBlock);
					// var data = round(simplex.noise3D(x, y, z));
					// 	var data = round(getRandomInt(-1, 5));
					var internalCoordinate = ((y * numberOfBlocksPerAxis + z) * numberOfBlocksPerAxis + x);
					// chunk.Sections[i].Blocks.set(internalCoordinate, data);
					blockArray[internalCoordinate] = data;
					previousYBlock = data;


					// if(data > 0 && y < heightDataArray[(z * numberOfBlocksPerAxis) + x]) {
					// 	heightDataArray[(z * numberOfBlocksPerAxis) + x] = y;
					// }
				}
				for (var y = 0; y < numberOfBlocksPerAxis; y++) {
					var internalCoordinate = ((y * numberOfBlocksPerAxis + z) * numberOfBlocksPerAxis + x);
					var data = blockArray[internalCoordinate];
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