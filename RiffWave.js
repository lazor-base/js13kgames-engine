var RiffWave = Module(function(event) {

	// variables
	var oldData = [];
	// end variables

	// functions
	var FastBase64 = (function() {

		var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		var encLookup = [];

		for (var i = 0; i < 4096; i++) {
			encLookup[i] = chars[i >> 6] + chars[i & 0x3F];
		}

		function Encode(src) {
			var len = src.length;
			var dst = '';
			var i = 0;
			while (len > 2) {
				n = (src[i] << 16) | (src[i + 1] << 8) | src[i + 2];
				dst += encLookup[n >> 12] + encLookup[n & 0xFFF];
				len -= 3;
				i += 3;
			}
			if (len > 0) {
				var n1 = (src[i] & 0xFC) >> 2;
				var n2 = (src[i] & 0x03) << 4;
				if (len > 1) n2 |= (src[++i] & 0xF0) >> 4;
				dst += chars[n1];
				dst += chars[n2];
				if (len == 2) {
					var n3 = (src[i++] & 0x0F) << 2;
					n3 |= (src[i] & 0xC0) >> 6;
					dst += chars[n3];
				}
				if (len == 1) dst += '=';
				dst += '=';
			}
			return dst;
		} // end Encode
		return {
			Encode: Encode
		};
	}());

	function u32ToArray(i) {
		return [i & 0xFF, (i >> 8) & 0xFF, (i >> 16) & 0xFF, (i >> 24) & 0xFF];
	}

	function u16ToArray(i) {
		return [i & 0xFF, (i >> 8) & 0xFF];
	}

	function split16bitArray(data) {
		var r = [];
		var j = 0;
		var len = data.length;
		for (var i = 0; i < len; i++) {
			r[j++] = data[i] & 0xFF;
			r[j++] = (data[i] >> 8) & 0xFF;
		}
		return r;
	}

	function make(audioData, waveInfo) {
		waveInfo = waveInfo || get();
		waveInfo[BLOCKALIGN] = (waveInfo[NUMCHANNELS] * waveInfo[BITSPERSAMPLE]) >> 3;
		waveInfo[BYTERATE] = waveInfo[BLOCKALIGN] * waveInfo[SAMPLERATE];
		waveInfo[SUBCHUNK2SIZE] = audioData.length * (waveInfo[BITSPERSAMPLE] >> 3);
		waveInfo[CHUNKSIZE] = 36 + waveInfo[SUBCHUNK2SIZE];

		var wav = waveInfo[CHUNKID].concat(
			u32ToArray(waveInfo[CHUNKSIZE]),
			waveInfo[FORMAT],
			waveInfo[SUBCHUNK1ID],
			u32ToArray(waveInfo[SUBCHUNK1SIZE]),
			u16ToArray(waveInfo[AUDIOFORMAT]),
			u16ToArray(waveInfo[NUMCHANNELS]),
			u32ToArray(waveInfo[SAMPLERATE]),
			u32ToArray(waveInfo[BYTERATE]),
			u16ToArray(waveInfo[BLOCKALIGN]),
			u16ToArray(waveInfo[BITSPERSAMPLE]),
			waveInfo[SUBCHUNK2ID],
			u32ToArray(waveInfo[SUBCHUNK2SIZE]), (waveInfo[BITSPERSAMPLE] == 16) ? split16bitArray(audioData) : audioData
		);
		oldData.push(waveInfo);
		return 'data:audio/wav;base64,' + FastBase64.Encode(wav);
	}

	function get() {
		if(oldData.length) {
			var result = oldData.shift();
		} else {
			var result = [];
		}
		result.push( // 						OFFSET  SIZE NOTES
			[0x52, 0x49, 0x46, 0x46], // 		0 		4    "RIFF" = 0x52494646
			0, // 								4 		4    36+SubChunk2Size = 4+(8+SubChunk1Size)+(8+SubChunk2Size)
			[0x57, 0x41, 0x56, 0x45], // 		8 		4    "WAVE" = 0x57415645
			[0x66, 0x6d, 0x74, 0x20], // 		12		4    "fmt " = 0x666d7420
			16, // 								16		4    16 for PCM
			1, // 								20		2    PCM = 1
			1, // 								22		2    Mono = 1, Stereo = 2...
			8000, // 							24		4    8000, 44100...
			0, // 								28		4    SampleRate*NumChannels*BitsPerSample/8
			0, // 								32		2    NumChannels*BitsPerSample/8
			8, // 								34		2    8 bits = 8, 16 bits = 16
			[0x64, 0x61, 0x74, 0x61], // 		36		4    "data" = 0x64617461
			0 // 								40		4    data size = NumSamples*NumChannels*BitsPerSample/8
		);
		return result;
	}

	function length(ms, sampleRate) {
		// length of data needed to last for 'ms' length
		return (ms/1000)*sampleRate;
	}
	// end functions

	// other
	// end others

	return {
		// return
		length:length,
		get: get,
		make: make
		// end return
	};
});