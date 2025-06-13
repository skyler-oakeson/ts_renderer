export type UintArr = Uint8Array | Uint16Array | Uint32Array
export type FloatArr = Float32Array | Float64Array

export interface AttrLoc {
    [key: string]: number
}

export interface AssocAttr {
    [key: number]: AttrObj
}

export interface AttrObj {
    vertbuf: WebGLBuffer,
    indbuf: WebGLBuffer,
    vertattr: Array<{ ident: string, elem: number }>,
    stride: number,
    bytes: number
}

export interface UniBind {
    [key: string]: { loc: WebGLUniformLocation, type: string }
}

export interface UniObj {
    data: any,
    ident: string
}

export interface AssocUni {
    [key: number]: UniObj
}


