export type UintArr = Uint8Array | Uint16Array | Uint32Array
export type FloatArr = Float32Array | Float64Array

export interface Buffer {
    bind(): void;
    unbind(): void;
    length: number;
}

export interface AttrLoc {
    [key: string]: number
}

export interface UniLoc {
    [key: string]: { loc: WebGLUniformLocation, type: string }
}

