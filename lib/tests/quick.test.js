"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Intquant_1 = require("../src/Intquant");
// src/Main.ts
const testutils_1 = require("./testutils");
// Be sure to use a variety of value forms. e.g., "3.4", "0.004", "123.4", "43.02".
const args = process.argv;
const verboseOption = args.find(arg => arg.startsWith('--verbose='));
const verbose = verboseOption ? verboseOption.split('=')[1] == "true" : false;
const rowsOption = args.find(arg => arg.startsWith('--rows='));
const testRows = rowsOption ? parseInt(rowsOption.split('=')[1], 10) : 10;
const colsOption = args.find(arg => arg.startsWith('--cols='));
const testCols = colsOption ? parseInt(colsOption.split('=')[1], 10) : 12;
function log(...args) {
    if (verbose) {
        console.log(...args);
    }
}
// ====== Example data ======
let floatArray = [];
let float32Array = [];
// ====== Test data ======
// small test array gives us a known, stable set of floats, not randoms.
let useSmallTestArray = false;
if (useSmallTestArray) {
    floatArray = (0, testutils_1.createSmallStableFloats)();
}
else { // Generate a larger table of random floats.
    floatArray = (0, testutils_1.createFloats)(testRows, testCols);
}
let myDatumMode; // 1 for one-byte quantization, 2 for two-byte.
let quantizedArray = null;
let compressedData = null;
let decompressedData = null;
let dequantizedArray = null;
function roundTrip(floats, datumMode) {
    console.time("roundTrip");
    log("Quantizing with datumMode: " + datumMode);
    //quantizedArray = Intquant.quantizeFloatArray(floatArray, datumMode);
    // let aFloat32Array = Intquant.convertNumbersToFloat32Array(floats);
    quantizedArray = Intquant_1.Intquant.quantizeFloatArray(floats, datumMode);
    log(quantizedArray);
    compressedData = Intquant_1.Intquant.compressQuantizedData(quantizedArray);
    log("compressedData...");
    log(compressedData);
    decompressedData = Intquant_1.Intquant.decompressCompressedData(compressedData);
    log("decompressedArray...");
    log(decompressedData);
    dequantizedArray = Intquant_1.Intquant.dequantizeFloatArray(decompressedData);
    log("dequantizedArray...");
    log(dequantizedArray);
    // const prettyPrintedString = Intquant.prettyPrintUint8ArrayAsIntegers(decompressedBase64ToArray);
    // log(prettyPrintedString); // Output: "255 0 127 64"
    expect(quantizedArray).toBeDefined();
    expect(compressedData).toBeDefined();
    expect(decompressedData).toBeDefined();
    console.timeEnd("roundTrip");
    let json = Intquant_1.Intquant.compressedDataToJSON(compressedData);
    console.time("JSON to Floats");
    let floats2 = Intquant_1.Intquant.decompressCompressedData(compressedData);
    console.timeEnd("JSON to Floats");
}
// === One Byte ===
test('One Byte: Quick test of small array of floats. Quantize to one byte, compress to JSON, and reverse it all.', () => {
    myDatumMode = 2;
    roundTrip(floatArray, myDatumMode);
    (0, testutils_1.reportCompression)(compressedData);
    expect(quantizedArray).toBeDefined();
    float32Array = Intquant_1.Intquant.convertNumbersToFloat32Array(floatArray);
    log("Before second half of test, float32Array: " + float32Array);
    roundTrip(float32Array, myDatumMode);
    log("One-byte test of Float32Array[] is finished.");
    (0, testutils_1.reportCompression)(compressedData);
    expect(quantizedArray).toBeDefined();
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
//# sourceMappingURL=quick.test.js.map