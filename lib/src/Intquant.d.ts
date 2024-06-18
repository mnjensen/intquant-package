export interface IntquantQuantizedData {
    min: number;
    max: number;
    datumMode: number;
    originalForm: 'numbers' | 'float32';
    data: number[][];
}
export interface IntquantCompressedData {
    min: number;
    max: number;
    numRows: number;
    numColumns: number;
    datumMode: number;
    originalForm: 'numbers' | 'float32';
    base64Data: string[];
}
export declare class Intquant {
    constructor();
    static convertNumbersToFloat32Array: (arr: number[][]) => Float32Array[];
    static convertFloat32ArrayToNumbers: (arr: Float32Array[]) => number[][];
    static quantizeFloatArray(floatArray: number[][] | Float32Array[], datumMode: number): IntquantQuantizedData;
    static dequantizeFloatArray(compressedData: IntquantQuantizedData): number[][] | Float32Array[];
    private static compressAndEncodeUint8Array;
    static compressQuantizedData(quantizedData: IntquantQuantizedData): IntquantCompressedData;
    static compressedDataToJSON(compressedData: IntquantCompressedData): string;
    static decodeAndDecompressBase64String(compressedString: string): Uint8Array;
    static decompressCompressedData(compressedData: IntquantCompressedData): IntquantQuantizedData;
    static prettyPrintUint8ArrayAsIntegers(array: Uint8Array, separator?: string): string;
}
