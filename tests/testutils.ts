import { Intquant, IntquantQuantizedData, IntquantCompressedData } from '../src/Intquant';

export function createSmallStableFloats(): number[][] {
    return [
        [1.0023, 45.67, 89.01, 12.3456, 56.78],
        [0.45, 67.89, 90.12, 34.56, 78.90],
        [45.67, 89.017, 12.34, 56.78, 23.45],
        [67.89, 90.12, 34.56, 178.90, 45.67],
        [89.01, 12.34, 136.717, 23.45, 67.89],
        [90.1, 314.56, 78.90, 45.67, 89.01]
    ];
}

export function createFloats(numtestRows:number, numtestColumns:number): number[][] {
    let randomFloatArray: number[][] = [];
    for (let i = 0; i < numtestRows; i++) {
        if (i % 2000 === 0) {
            // console.log("row: " + i);
        }
        const row: number[] = [];
        for (let j = 0; j < numtestColumns; j++) {
            const randomFloat = Math.random() * 100;
            row.push(randomFloat);
        }
        randomFloatArray.push(row);
    }

    return randomFloatArray;
}

export function reportCompression(compressedData: IntquantCompressedData | null) {
    console.time("reportCompression");

    if(compressedData){
        // Store the compressed string in JSON
        const compressedDataJSON = JSON.stringify({ compressedData: compressedData }).replace(/,/g, ',\n');
        console.log("compressed JSON length = " + compressedDataJSON.length);
        let charsPerValue = compressedDataJSON.length / (compressedData.numColumns * compressedData.numRows);
        console.log("Mode " + compressedData.datumMode + ", compressed JSON -- chars per value = " + charsPerValue);
        require('fs').writeFileSync('compressed.json', compressedDataJSON);

    } else {
        console.log("No compressed data to report. ERROR?");
    }
    console.timeEnd("reportCompression");
}


