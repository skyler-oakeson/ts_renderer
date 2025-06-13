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

export interface UniLoc {
    [key: string]: WebGLUniformLocation
}

export interface UniObj {
    data: any,
    ident: string
}

export interface AssocUni {
    [key: number]: UniObj
}


export enum GLType {
    Void = 'void',
    Bool = 'bool',
    Int = 'int',
    Float = 'float',
    Vec2 = 'vec2',
    Vec3 = 'vec3',
    Vec4 = 'vec4',
    BVec2 = 'bvec2',
    BVec3 = 'bvec3',
    BVec4 = 'bvec4',
    Mat2 = 'mat2',
    Mat3 = 'mat3',
    Mat4 = 'mat3',
    Sampler2D = 'sampler2d',
    SamplerCube = 'samplerCube'
}

