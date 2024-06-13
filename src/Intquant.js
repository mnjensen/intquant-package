"use strict";
// ===== Compressing and Decompressing Float Arrays =====
Object.defineProperty(exports, "__esModule", { value: true });
exports.Intquant = void 0;
// import pako from 'pako';
//import * as pako from 'pako';
const pako = require('pako');
class Intquant {
    constructor() {
        // Initialization if needed
    }
    static quantizeFloatArray(floatArray, datumMode) {
        // Find minimum and maximum values in the input array
        let minValue = Infinity;
        let maxValue = -Infinity;
        let maxPossibleInt = 255; // 255 for one byte, 65535 for two bytes.
        if (datumMode == 2) {
            maxPossibleInt = 65535;
        }
        for (let i = 0; i < floatArray.length; i++) {
            for (let j = 0; j < floatArray[i].length; j++) {
                const value = floatArray[i][j];
                if (value < minValue) {
                    minValue = value;
                }
                if (value > maxValue) {
                    maxValue = value;
                }
            }
        }
        // Linearly scale each value to map it to an integer output value between 0 and maxPossibleInt
        const intArray = [];
        for (let i = 0; i < floatArray.length; i++) {
            const row = [];
            for (let j = 0; j < floatArray[i].length; j++) {
                const floatValue = floatArray[i][j];
                const compressedValue = Math.round((floatValue - minValue) / (maxValue - minValue) * maxPossibleInt);
                row.push(compressedValue);
            }
            intArray.push(row);
        }
        let compressedData = {
            min: minValue,
            max: maxValue,
            datumMode: datumMode,
            data: intArray
        };
        return compressedData;
    }
    static dequantizeFloatArray(compressedData) {
        const { min, max, data } = compressedData;
        const decompressedArray = [];
        let maxPossible = 255;
        if (compressedData.datumMode == 2) {
            maxPossible = 65535;
        }
        for (let i = 0; i < data.length; i++) {
            const row = [];
            for (let j = 0; j < data[i].length; j++) {
                const compressedValue = data[i][j];
                const decompressedValue = (min + (compressedValue / maxPossible) * (max - min));
                const roundedValue = Math.round(decompressedValue * 1000) / 1000; // 3 decimal places
                row.push(roundedValue);
            }
            decompressedArray.push(row);
        }
        return decompressedArray;
    }
    static compressAndEncodeUint8Array(data) {
        // Compress the binary data using zlib's deflate algorithm
        const compressed = pako.deflate(data);
        // Convert compressed binary data to Base64 string
        const base64String = Buffer.from(compressed).toString('base64');
        return base64String;
    }
    static compressQuantizedData(quantizedData) {
        const { min, max, datumMode, data } = quantizedData;
        const base64Data = [];
        // Compress each row of data into a base64 string
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            let rowUint8Array;
            if (datumMode == 2) { // Convert to Uint8Array
                rowUint8Array = new Uint8Array(row.length * 2);
                for (let i = 0; i < row.length; i++) {
                    rowUint8Array[i * 2] = row[i] & 0xFF;
                    rowUint8Array[i * 2 + 1] = (row[i] >> 8) & 0xFF;
                }
            }
            else {
                rowUint8Array = new Uint8Array(row);
            }
            const base64String = Intquant.compressAndEncodeUint8Array(rowUint8Array);
            base64Data.push(base64String);
        }
        const compressedData = {
            min: min,
            max: max,
            numRows: data.length,
            numColumns: data[0].length,
            datumMode: datumMode,
            base64Data: base64Data
        };
        return compressedData;
    }
    static decodeAndDecompressBase64String(compressedString) {
        // Decode Base64 string back to binary data
        const compressedData = Buffer.from(compressedString, 'base64');
        // Decompress the data using pako's inflate function
        const decompressedData = pako.inflate(compressedData);
        // Convert decompressed ArrayBuffer to Uint8Array
        return new Uint8Array(decompressedData);
    }
    static decompressCompressedData(compressedData) {
        const { min, max, numRows, numColumns, datumMode, base64Data } = compressedData;
        const data = [];
        for (let i = 0; i < base64Data.length; i++) {
            const rowBase64 = base64Data[i];
            const rowUint8Array = Intquant.decodeAndDecompressBase64String(rowBase64);
            let rowIntegers = [];
            if (datumMode == 2) {
                // Convert back to array of two-byte unsigned integers
                rowIntegers = [];
                for (let i = 0; i < rowUint8Array.length; i += 2) {
                    rowIntegers.push(rowUint8Array[i] + (rowUint8Array[i + 1] << 8));
                }
            }
            else {
                rowIntegers = Array.from(rowUint8Array);
            }
            data.push(rowIntegers);
        }
        const decompressedData = {
            min: min,
            max: max,
            datumMode: datumMode,
            data: data
        };
        return decompressedData;
    }
    static prettyPrintUint8ArrayAsIntegers(array, separator = ' ') {
        return Array.from(array).join(separator);
    }
}
exports.Intquant = Intquant;
//# sourceMappingURL=Intquant.js.map