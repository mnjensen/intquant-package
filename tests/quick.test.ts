import { Intquant, IntquantQuantizedData, IntquantCompressedData  } from '../src/Intquant';
// src/Main.ts
import { createFloats, createSmallStableFloats, reportCompression } from './testutils';

// Be sure to use a variety of value forms. e.g., "3.4", "0.004", "123.4", "43.02".

const args = process.argv;
const verboseOption = args.find(arg => arg.startsWith('--verbose='));
const verbose:boolean = verboseOption ? verboseOption.split('=')[1]=="true" : false;
function log(...args: any[]): void {
    if(verbose){
        console.log(...args);
    }
}

// ====== Example data ======
let floatArray: number[][] = [];

let useSmallTestArray = false;
if (useSmallTestArray) {
    floatArray = createSmallStableFloats();
} else { // Generate a larger table of random floats.
    floatArray = createFloats(20000, 4000);
}
let myDatumMode; // 1 for one-byte quantization, 2 for two-byte.
let quantizedArray: IntquantQuantizedData | null = null;
let compressedData: IntquantCompressedData | null = null;
let decompressedData: IntquantQuantizedData | null = null;
let dequantizedArray: number[][] | null = null;

function roundTrip(floats:number[][], datumMode:number) {
    console.time("roundTrip");
    log("Quantizing with datumMode: " + datumMode);
    quantizedArray = Intquant.quantizeFloatArray(floatArray, datumMode);
    log(quantizedArray);

    compressedData = Intquant.compressQuantizedData(quantizedArray);
    log("compressedData...");
    log(compressedData);

    decompressedData = Intquant.decompressCompressedData(compressedData);
    log("decompressedArray...");
    log(decompressedData);

    dequantizedArray = Intquant.dequantizeFloatArray(decompressedData);
    log("dequantizedArray...");
    log(dequantizedArray);

    // const prettyPrintedString = Intquant.prettyPrintUint8ArrayAsIntegers(decompressedBase64ToArray);
    // log(prettyPrintedString); // Output: "255 0 127 64"

    expect(quantizedArray).toBeDefined();
    expect(compressedData).toBeDefined();
    expect(decompressedData).toBeDefined();    

    console.timeEnd("roundTrip");

    let json = Intquant.compressedDataToJSON(compressedData);
    console.time("JSON to Floats")
    let floats2 = Intquant.decompressCompressedData(compressedData)
    console.timeEnd("JSON to Floats")

}


// === One Byte ===
test('One Byte: Quick test of small array of floats. Quantize to one byte, compress to JSON, and reverse it all.', () => {
    myDatumMode = 1;
    roundTrip(floatArray, myDatumMode);
    reportCompression(compressedData);
});

// test('One Byte: Size of float array matches, start-to-end.', () => {
//     if(dequantizedArray != null){
//         const deqSize = dequantizedArray.length * dequantizedArray[0].length;
//         const originalSize = floatArray.length * floatArray[0].length;
//         log("deqSize: " + deqSize + ",  originalSize: " + originalSize);
        
//         expect(deqSize).toBe(originalSize);
//     }
// });

// test('One Byte: Quantized data matches, pre/post compression.', () => {
//     expect(quantizedArray).toEqual(decompressedData);
// });

// // === Clear out results ===

// quantizedArray = null;
// compressedData = null;
// decompressedData = null;
// dequantizedArray = [];


// // === Two Bytes ===
// test('Two Bytes: Quick test of small array of floats. Quantize to one byte, compress to JSON, and reverse it all.', () => {
//     myDatumMode = 2;
//     roundTrip(floatArray, myDatumMode);
//     reportCompression(compressedData);
// });

// test('Two Bytes: Size of float array matches, start-to-end.', () => {
//     if(dequantizedArray){
//         const deqSize = dequantizedArray.length * dequantizedArray[0].length;
//         const originalSize = floatArray.length * floatArray[0].length;
//         log("deqSize: " + deqSize + ",  originalSize: " + originalSize);
//         expect(deqSize).toBe(originalSize);
//     }
// });

// test('Two Bytes: Quantized data matches, pre/post compression.', () => {
//     expect(quantizedArray).toEqual(decompressedData);
// });