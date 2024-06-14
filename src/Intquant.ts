// ===== Compressing and Decompressing Float Arrays =====

// import pako from 'pako';
//import * as pako from 'pako';
const pako = require('pako');

// Store a 2D array of floating point numbers as a 2D array of quantized, small-ish integers.
export interface IntquantQuantizedData {
    min: number;
    max: number;
    datumMode: number; // 1 for 1-byte (0-255), 2 for 2-byte (0-65535)
    data: number[][];
}

// We compress each row of quantized data into a base64 string. This stores easily in JSON,
// without having one enormous string that is awkward to use. If the data is referenced by rows,
// (for example, each row is a gene in bioninformatic data), one can pull out the rows
// (genes) as needed, and decompress only them.
export interface IntquantCompressedData {
    min: number;
    max: number;
    numRows: number;
    numColumns: number;
    datumMode: number; // 1 for 1-byte (0-255), 2 for 2-byte (0-65535)
    base64Data: string[];
}

export class Intquant {
    constructor() {
        // Initialization if needed
    }

    static quantizeFloatArray(floatArray: number[][], datumMode: number): IntquantQuantizedData {
        // Find minimum and maximum values in the input array
        let minValue = Infinity;
        let maxValue = -Infinity;

        let maxPossibleInt = 255;  // 255 for one byte, 65535 for two bytes.
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
        const intArray: number[][] = [];
        for (let i = 0; i < floatArray.length; i++) {
            const row: number[] = [];
            for (let j = 0; j < floatArray[i].length; j++) {
                const floatValue = floatArray[i][j];
                const compressedValue = Math.round((floatValue - minValue) / (maxValue - minValue) * maxPossibleInt);
                row.push(compressedValue);
            }
            intArray.push(row);
        }

        let compressedData: IntquantQuantizedData = {
            min: minValue,
            max: maxValue,
            datumMode: datumMode,
            data: intArray
        }
        return compressedData;
    }

    static dequantizeFloatArray(compressedData: IntquantQuantizedData): number[][] {
        const { min, max, data } = compressedData;
        const decompressedArray: number[][] = [];
        let maxPossible = 255;
        if (compressedData.datumMode == 2) {
            maxPossible = 65535;
        }

        for (let i = 0; i < data.length; i++) {
            const row: number[] = [];
            for (let j = 0; j < data[i].length; j++) {
                const compressedValue = data[i][j];
                const decompressedValue = (min + (compressedValue / maxPossible) * (max - min));
                const roundedValue = Math.round(decompressedValue * 1000) / 1000;  // 3 decimal places
                row.push(roundedValue);
            }
            decompressedArray.push(row);
        }

        return decompressedArray;
    }

    private static compressAndEncodeUint8Array(data: Uint8Array): string {
        // Compress the binary data using zlib's deflate algorithm
        const compressed = pako.deflate(data);
        // Convert compressed binary data to Base64 string
        const base64String = Buffer.from(compressed).toString('base64');

        return base64String;
    }

    static compressQuantizedData(quantizedData: IntquantQuantizedData): IntquantCompressedData {
        const { min, max, datumMode, data } = quantizedData;
        const base64Data: string[] = [];
        // Compress each row of data into a base64 string
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            let rowUint8Array: Uint8Array;
            if (datumMode == 2) {   // Convert to Uint8Array
                rowUint8Array = new Uint8Array(row.length * 2);
                for (let i = 0; i < row.length; i++) {
                    rowUint8Array[i * 2] = row[i] & 0xFF;
                    rowUint8Array[i * 2 + 1] = (row[i] >> 8) & 0xFF;
                }
            } else {
                rowUint8Array = new Uint8Array(row);
            }
            const base64String = Intquant.compressAndEncodeUint8Array(rowUint8Array);
            base64Data.push(base64String);
        }

        const compressedData: IntquantCompressedData = {
            min: min,
            max: max,
            numRows: data.length,
            numColumns: data[0].length,
            datumMode: datumMode,
            base64Data: base64Data
        }
        return compressedData;
    }

    static compressedDataToJSON(compressedData: IntquantCompressedData): string {
        return JSON.stringify({ compressedData: compressedData }).replace(/,/g, ',\n');
    }

    static decodeAndDecompressBase64String(compressedString: string): Uint8Array {
        // Decode Base64 string back to binary data
        const compressedData = Buffer.from(compressedString, 'base64');
        // Decompress the data using pako's inflate function
        const decompressedData = pako.inflate(compressedData);
        // Convert decompressed ArrayBuffer to Uint8Array
        return new Uint8Array(decompressedData);
    }

    static decompressCompressedData(compressedData: IntquantCompressedData): IntquantQuantizedData {
        const { min, max, numRows, numColumns, datumMode, base64Data } = compressedData;
        const data: number[][] = [];
        for (let i = 0; i < base64Data.length; i++) {
            const rowBase64 = base64Data[i];
            const rowUint8Array = Intquant.decodeAndDecompressBase64String(rowBase64);

            let rowIntegers: number[] = [];
            if(datumMode == 2) {
                // Convert back to array of two-byte unsigned integers
                rowIntegers = [];
                for (let i = 0; i < rowUint8Array.length; i += 2) {
                    rowIntegers.push(rowUint8Array[i] + (rowUint8Array[i + 1] << 8));
                }
            } else {
                rowIntegers = Array.from(rowUint8Array);
            }
            data.push(rowIntegers);
        }

        const decompressedData: IntquantQuantizedData = {
            min: min,
            max: max,
            datumMode: datumMode,
            data: data
        }
        return decompressedData;
    }

    static prettyPrintUint8ArrayAsIntegers(array: Uint8Array, separator: string = ' '): string {
        return Array.from(array).join(separator);
    }

}


