export interface IntquantQuantizedData {
    min: number;
    max: number;
    datumMode: number;
    data: number[][];
}
export interface IntquantCompressedData {
    min: number;
    max: number;
    numRows: number;
    numColumns: number;
    datumMode: number;
    base64Data: string[];
}
export declare class Intquant {
    constructor();
    static quantizeFloatArray(floatArray: number[][], datumMode: number): IntquantQuantizedData;
    static dequantizeFloatArray(compressedData: IntquantQuantizedData): number[][];
    private static compressAndEncodeUint8Array;
    static compressQuantizedData(quantizedData: IntquantQuantizedData): IntquantCompressedData;
    static decodeAndDecompressBase64String(compressedString: string): Uint8Array;
    static decompressCompressedData(compressedData: IntquantCompressedData): IntquantQuantizedData;
    static prettyPrintUint8ArrayAsIntegers(array: Uint8Array, separator?: string): string;
}
