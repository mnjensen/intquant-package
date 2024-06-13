"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Intquant_1 = require("../src/Intquant");
// Be sure to use a variety of value forms. e.g., "3.4", "0.004", "123.4", "43.02".
test('Quick test of small array of floats. Quantize, compress to JSON, and reverse it all.', () => {
    // ====== Example data ======
    let floatArray = [];
    let useSmallTestArray = true;
    if (useSmallTestArray) {
        floatArray = [
            [1.0023, 45.67, 89.01, 12.34, 56.78],
            [0.45, 67.89, 90.12, 34.56, 78.90],
            [45.67, 89.01, 12.34, 56.78, 23.45],
            [67.89, 90.12, 34.56, 178.90, 45.67],
            [89.01, 12.34, 136.717, 23.45, 67.89],
            [90.12, 34.56, 78.90, 45.67, 89.01]
        ];
    }
    else { // Generate a larger table of random floats.
        let randomFloatArray = [];
        let numtestRows = 20000;
        let numtestColumns = 3000;
        for (let i = 0; i < numtestRows; i++) {
            if (i % 1000 === 0) {
                console.log("row: " + i);
            }
            const row = [];
            for (let j = 0; j < numtestColumns; j++) {
                const randomFloat = Math.random() * 100;
                row.push(randomFloat);
            }
            randomFloatArray.push(row);
        }
        console.log("=== input array created ===");
        floatArray = randomFloatArray;
    }
    console.log(floatArray.slice(0, 10));
    let myDatumMode = 2;
    console.log("Quantizing with datumMode: " + myDatumMode);
    let quantizedArray = Intquant_1.Intquant.quantizeFloatArray(floatArray, myDatumMode);
    console.log(quantizedArray);
    let dequantizedArray = Intquant_1.Intquant.dequantizeFloatArray(quantizedArray);
    console.log(dequantizedArray);
    const compressedData = Intquant_1.Intquant.compressQuantizedData(quantizedArray);
    console.log("compressedData...");
    console.log(compressedData);
    console.log("=======");
    // Store the compressed string in JSON
    const compressedDataJSON = JSON.stringify({ compressedData: compressedData }).replace(/,/g, ',\n');
    console.log("compressed JSON length = " + compressedDataJSON.length);
    //require('fs').writeFileSync('foo.json', compressedDataJSON);
    let decompressedArray = Intquant_1.Intquant.decompressCompressedData(compressedData);
    console.log("decompressedArray...");
    console.log(decompressedArray);
    dequantizedArray = Intquant_1.Intquant.dequantizeFloatArray(decompressedArray);
    console.log("dequantizedArray...");
    console.log(dequantizedArray);
    // const prettyPrintedString = Intquant.prettyPrintUint8ArrayAsIntegers(decompressedBase64ToArray);
    // console.log(prettyPrintedString); // Output: "255 0 127 64"
    console.log("bye");
    const foo = 2;
    console.log("foo = " + foo);
    expect(foo + 3).toBe(5);
});
//# sourceMappingURL=quick.test.js.map