import { Intquant, IntquantQuantizedData, IntquantCompressedData  } from '../src/Intquant';

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
} else { // Generate a larger table of random floats.
    let randomFloatArray: number[][] = [];
    let numtestRows = 20000;
    let numtestColumns = 3000;
    for (let i = 0; i < numtestRows; i++) {
        if (i % 1000 === 0) {
            log("row: " + i);
        }
        const row: number[] = [];
        for (let j = 0; j < numtestColumns; j++) {
            const randomFloat = Math.random() * 100;
            row.push(randomFloat);
        }
        randomFloatArray.push(row);
    }
    log("=== input array created ===")

    floatArray = randomFloatArray;
}
let myDatumMode = 2;
let quantizedArray: IntquantQuantizedData;
let compressedData: IntquantCompressedData
let decompressedData: IntquantQuantizedData;
let dequantizedArray: number[][];

test('Quick test of small array of floats. Quantize, compress to JSON, and reverse it all.', () => {
    log("Quantizing with datumMode: " + myDatumMode);
    quantizedArray = Intquant.quantizeFloatArray(floatArray, myDatumMode);
    log(quantizedArray);

    compressedData = Intquant.compressQuantizedData(quantizedArray);

    log("compressedData...");
    log(compressedData);

    // Store the compressed string in JSON
    const compressedDataJSON = JSON.stringify({ compressedData: compressedData }).replace(/,/g, ',\n');
    log("compressed JSON length = " + compressedDataJSON.length);
    // require('fs').writeFileSync('compressed.json', compressedDataJSON);

    decompressedData = Intquant.decompressCompressedData(compressedData);
    log("decompressedArray...");
    log(decompressedData);


    dequantizedArray = Intquant.dequantizeFloatArray(decompressedData);
    log("dequantizedArray...");
    log(dequantizedArray);

    // const prettyPrintedString = Intquant.prettyPrintUint8ArrayAsIntegers(decompressedBase64ToArray);
    // log(prettyPrintedString); // Output: "255 0 127 64"

    const deqSize = dequantizedArray.length * dequantizedArray[0].length;
    const originalSize = floatArray.length * floatArray[0].length;
    log("deqSize: " + deqSize + ",  originalSize: " + originalSize);
    expect(deqSize).toBe(originalSize);
});