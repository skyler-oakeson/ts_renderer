export interface Context {
    canvas: HTMLCanvasElement
    gl: WebGL2RenderingContext
}

export interface Attribute {
    location: GLint,
    // type: GLType
}

export interface Uniform {
    location: WebGLUniformLocation,
    // type: GLType
}

export interface AttributeLocations {
    [key: string]: Attribute
}

export interface UniformLocations {
    [key: string]: Uniform
}

export interface AssociatedBuffers {
    [key: number]: BufInfo
}

export interface BufInfo {
    buffer: WebGLBuffer,
    attribs: Array<{ name: string, elements: number }>,
    stride: number,
    bytes: number
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
