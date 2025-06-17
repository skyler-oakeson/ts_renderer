import { context } from "@/main";
import {
    type AttrLoc,
    type FloatArr,
    type UintArr,
    type UniLoc,
} from "@types/gl";
import type { Matrix2x2, Matrix3x3, Matrix4x4, Vec2, Vec3, Vec4 } from "@types/matrix";
import { GeometryBuffer } from "./geobuf";
import { type Buffer } from "./buf";
import { NormalBuffer } from "./normbuf";

const { gl } = context;

export const attrloc: AttrLoc = {}
export const uniloc: UniLoc = {}

const UNIFORM_MATRIX_BINDERS = {
    mat2: (context: WebGLRenderingContext,
        loc: WebGLUniformLocation,
        transpose: boolean,
        val: Matrix2x2) => { context.uniformMatrix2fv(loc, transpose, val) },
    mat3: (context: WebGLRenderingContext,
        loc: WebGLUniformLocation,
        transpose: boolean,
        val: Matrix3x3) => { context.uniformMatrix3fv(loc, transpose, val) },
    mat4: (context: WebGLRenderingContext,
        loc: WebGLUniformLocation,
        transpose: boolean,
        val: Matrix4x4) => { context.uniformMatrix4fv(loc, transpose, val) }
}

const UNIFORM_VECTOR_BINDERS = {
    float: (context: WebGLRenderingContext,
        loc: WebGLUniformLocation,
        val: GLfloat) => { context.uniform1f(loc, val) },
    vec2: (context: WebGLRenderingContext,
        loc: WebGLUniformLocation,
        val: Vec2) => { context.uniform2fv(loc, val) },
    vec3: (context: WebGLRenderingContext,
        loc: WebGLUniformLocation,
        val: Vec3) => { context.uniform3fv(loc, val) },
    vec4: (context: WebGLRenderingContext,
        loc: WebGLUniformLocation,
        val: Vec4) => { context.uniform4fv(loc, val) },
}

function resizeCanvas() {
    gl.canvas.width = window.innerWidth
    gl.canvas.height = window.innerHeight
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
}

resizeCanvas()
window.addEventListener('resize', resizeCanvas)


//------------------------------------------------------------------
//
// Helper function that creates vertex shader from a source string and returns it
//
//------------------------------------------------------------------
export function glCreateVertexShader(src: string): WebGLShader {
    const shader = glCreateShader(gl.VERTEX_SHADER, src);
    return shader;
}

//------------------------------------------------------------------
//
// Helper function that creates a fragment shader from a source string and returns it
//
//------------------------------------------------------------------
export function glCreateFragShader(src: string): WebGLShader {
    const shader = glCreateShader(gl.FRAGMENT_SHADER, src);
    return shader;
}

//------------------------------------------------------------------
//
// Creates a shader program from a fragment or vertex source string and returns it
// 
//------------------------------------------------------------------
function glCreateShader(type: GLenum, src: string): WebGLShader {
    const shader = gl.createShader(type);
    if (!shader) {
        throw Error(`Unable to create ${type} shader.`)
    }

    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw Error(`Shader compile error: ${gl.getShaderInfoLog(shader)}`);
    }

    return shader;
}


//------------------------------------------------------------------
//
// Creates a shader program from a fragment and vertex source string and returns it
// 
//------------------------------------------------------------------
export function glCreateShaderProgram(vertsrc: string, fragsrc: string): WebGLProgram {
    const vert = glCreateVertexShader(vertsrc)
    const frag = glCreateFragShader(fragsrc)
    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    glRegisterIdentifierLocations(program, vertsrc)

    return program
}

//------------------------------------------------------------------
//
// Register attribute and uniform identifiers found in the vertex shader
// 
//------------------------------------------------------------------
function glRegisterIdentifierLocations(program: WebGLProgram, vertsrc: string) {
    vertsrc.split('\n').forEach((line) => {
        const strippedLine = line.replace(/layout\s*\([^)]*\)\s*/, '').trim();
        let declaration = strippedLine.split(' ')
        if (declaration[0] == "in" || declaration[0] == "uniform") {
            const qual = declaration[0]
            const type = declaration[1]
            const ident = declaration[2].replace(";", "")
            if (qual == 'in') {
                let loc = gl.getAttribLocation(program, ident)
                if (loc < 0) {
                    console.error(`Could not locate attribute ${ident}`)
                }
                attrloc[ident] = loc
            }
            if (qual == 'uniform') {
                let loc = gl.getUniformLocation(program, ident)
                if (!loc) {
                    console.error(`Could not locate uniform ${ident}`)
                }
                uniloc[ident] = { loc, type }
            }
        }
    })
}

let buf: Array<Buffer> = []
export function glNewGeometryBuffer(verts: FloatArr, ind: UintArr, ident: string, normalized = false): number {
    return buf.push(new GeometryBuffer(verts, ind, ident, normalized)) - 1
}

export function glNewNormalBuffer(norms: FloatArr, ident: string, normalized = false) {
    return buf.push(new NormalBuffer(norms, ident, normalized)) - 1
}

export function glGetBuf(id: number): Buffer {
    return buf[id]
}

//------------------------------------------------------------------
//
// Binds the associated uniform to the vertex shader 
//
//------------------------------------------------------------------
export function glBindUniform(ident: string, data: any) {
    let { loc, type } = uniloc[ident]

    if (type.startsWith("mat")) {
        UNIFORM_MATRIX_BINDERS[type](gl, loc, false, data)
        return
    }

    if (type.startsWith("vec")) {
        UNIFORM_VECTOR_BINDERS[type](gl, loc, data)
        return
    }
}


//------------------------------------------------------------------
//
// Unbinds the array passed in as a list
//
//------------------------------------------------------------------
export function glUnbindBuffers() {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
}


//------------------------------------------------------------------
//
// Interleaves data from multiple arrays into one vertex array
//
//------------------------------------------------------------------
function glInterleave(...args: Array<{ arr: Array<number>, elem: number }>): Array<number> {
    let cycles: number = -1;
    args.forEach(({ arr, elem }, index) => {
        cycles = -1 ? arr.length / elem : cycles
        if (cycles != arr.length / elem) {
            throw Error(`${elem} is a misaligned element of array at index ${index}.`)
        }
    })

    let interleaved = new Array<number>()
    for (let c = 0; c < cycles; c++) {
        args.forEach(({ arr, elem }, index) => {
            interleaved.push(...arr.splice(0, elem))
        })
    }

    return interleaved
}

