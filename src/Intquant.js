"use strict";
// ===== Compressing and Decompressing Float Arrays =====
Object.defineProperty(exports, "__esModule", { value: true });
exports.Intquant = void 0;
// import pako from 'pako';
//import * as pako from 'pako';
var pako = require('pako');
var Intquant = /** @class */ (function () {
    function Intquant() {
        // Initialization if needed
    }
    Intquant.quantizeFloatArray = function (floatArray, datumMode) {
        // Find minimum and maximum values in the input array
        var minValue = Infinity;
        var maxValue = -Infinity;
        var maxPossibleInt = 255; // 255 for one byte, 65535 for two bytes.
        if (datumMode == 2) {
            maxPossibleInt = 65535;
        }
        for (var i = 0; i < floatArray.length; i++) {
            for (var j = 0; j < floatArray[i].length; j++) {
                var value = floatArray[i][j];
                if (value < minValue) {
                    minValue = value;
                }
                if (value > maxValue) {
                    maxValue = value;
                }
            }
        }
        // Linearly scale each value to map it to an integer output value between 0 and maxPossibleInt
        var intArray = [];
        for (var i = 0; i < floatArray.length; i++) {
            var row = [];
            for (var j = 0; j < floatArray[i].length; j++) {
                var floatValue = floatArray[i][j];
                var compressedValue = Math.round((floatValue - minValue) / (maxValue - minValue) * maxPossibleInt);
                row.push(compressedValue);
            }
            intArray.push(row);
        }
        var compressedData = {
            min: minValue,
            max: maxValue,
            datumMode: datumMode,
            data: intArray
        };
        return compressedData;
    };
    Intquant.dequantizeFloatArray = function (compressedData) {
        var min = compressedData.min, max = compressedData.max, data = compressedData.data;
        var decompressedArray = [];
        var maxPossible = 255;
        if (compressedData.datumMode == 2) {
            maxPossible = 65535;
        }
        for (var i = 0; i < data.length; i++) {
            var row = [];
            for (var j = 0; j < data[i].length; j++) {
                var compressedValue = data[i][j];
                var decompressedValue = (min + (compressedValue / maxPossible) * (max - min));
                var roundedValue = Math.round(decompressedValue * 1000) / 1000; // 3 decimal places
                row.push(roundedValue);
            }
            decompressedArray.push(row);
        }
        return decompressedArray;
    };
    Intquant.compressAndEncodeUint8Array = function (data) {
        // Compress the binary data using zlib's deflate algorithm
        var compressed = pako.deflate(data);
        // Convert compressed binary data to Base64 string
        var base64String = Buffer.from(compressed).toString('base64');
        return base64String;
    };
    Intquant.compressQuantizedData = function (quantizedData) {
        var min = quantizedData.min, max = quantizedData.max, datumMode = quantizedData.datumMode, data = quantizedData.data;
        var base64Data = [];
        // Compress each row of data into a base64 string
        for (var i = 0; i < data.length; i++) {
            var row = data[i];
            var rowUint8Array = void 0;
            if (datumMode == 2) { // Convert to Uint8Array
                rowUint8Array = new Uint8Array(row.length * 2);
                for (var i_1 = 0; i_1 < row.length; i_1++) {
                    rowUint8Array[i_1 * 2] = row[i_1] & 0xFF;
                    rowUint8Array[i_1 * 2 + 1] = (row[i_1] >> 8) & 0xFF;
                }
            }
            else {
                rowUint8Array = new Uint8Array(row);
            }
            var base64String = Intquant.compressAndEncodeUint8Array(rowUint8Array);
            base64Data.push(base64String);
        }
        var compressedData = {
            min: min,
            max: max,
            numRows: data.length,
            numColumns: data[0].length,
            datumMode: datumMode,
            base64Data: base64Data
        };
        return compressedData;
    };
    Intquant.compressedDataToJSON = function (compressedData) {
        return JSON.stringify({ compressedData: compressedData }).replace(/,/g, ',\n');
    };
    Intquant.decodeAndDecompressBase64String = function (compressedString) {
        // Decode Base64 string back to binary data
        var compressedData = Buffer.from(compressedString, 'base64');
        // Decompress the data using pako's inflate function
        var decompressedData = pako.inflate(compressedData);
        // Convert decompressed ArrayBuffer to Uint8Array
        return new Uint8Array(decompressedData);
    };
    Intquant.decompressCompressedData = function (compressedData) {
        var min = compressedData.min, max = compressedData.max, numRows = compressedData.numRows, numColumns = compressedData.numColumns, datumMode = compressedData.datumMode, base64Data = compressedData.base64Data;
        var data = [];
        for (var i = 0; i < base64Data.length; i++) {
            var rowBase64 = base64Data[i];
            var rowUint8Array = Intquant.decodeAndDecompressBase64String(rowBase64);
            var rowIntegers = [];
            if (datumMode == 2) {
                // Convert back to array of two-byte unsigned integers
                rowIntegers = [];
                for (var i_2 = 0; i_2 < rowUint8Array.length; i_2 += 2) {
                    rowIntegers.push(rowUint8Array[i_2] + (rowUint8Array[i_2 + 1] << 8));
                }
            }
            else {
                rowIntegers = Array.from(rowUint8Array);
            }
            data.push(rowIntegers);
        }
        var decompressedData = {
            min: min,
            max: max,
            datumMode: datumMode,
            data: data
        };
        return decompressedData;
    };
    Intquant.prettyPrintUint8ArrayAsIntegers = function (array, separator) {
        if (separator === void 0) { separator = ' '; }
        return Array.from(array).join(separator);
    };
    return Intquant;
}());
exports.Intquant = Intquant;
