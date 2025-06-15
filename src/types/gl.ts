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
    attr: Array<Attr>,
    stride: number,
    bytes: number
    indlen: number
}

export interface Attr {
    ident: string,
    elem: number
}

export interface UniLoc {
    [key: string]: { loc: WebGLUniformLocation, type: string }
}

export interface UniObj {
    data: any,
    ident: string
}

export interface AssocUni {
    [key: number]: UniObj
}

export interface Model {
    vertar: Array<number>,
    indarr: Array<number>
}
