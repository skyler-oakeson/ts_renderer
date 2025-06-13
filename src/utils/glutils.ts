import { context } from "../main";
import { GLType, type AttributeLocations, type UniformLocations, type Attribute, type Uniform, type AssociatedBuffers } from "../types/context";

const gl = context.gl;
const attribloc: AttributeLocations = {}
const uniformloc: UniformLocations = {}
const buffers: AssociatedBuffers = {}

export function glCreateShader(type: GLenum, src: string): WebGLShader {
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

export function glCreateVertexShader(src: string): WebGLShader {
    const shader = glCreateShader(gl.VERTEX_SHADER, src);
    return shader;
}

export function glCreateFragShader(src: string): WebGLShader {
    const shader = glCreateShader(gl.FRAGMENT_SHADER, src);
    return shader;
}

export function glCreateShaderProgram(vert: string, frag: string): WebGLProgram {
    const vertShd = glCreateVertexShader(vert)
    const fragShd = glCreateFragShader(frag)
    const program = gl.createProgram();
    gl.attachShader(program, vertShd);
    gl.attachShader(program, fragShd);
    gl.linkProgram(program);
    gl.useProgram(program)

    // parse vertex shader to find loactions of attributes and uniforms
    vert.split('\n').forEach((line) => {
        const strippedLine = line.replace(/layout\s*\([^)]*\)\s*/, '').trim();
        let declaration = strippedLine.split(' ')
        if (declaration[0] == "in" || declaration[0] == "uniform") {
            const qualifier = declaration[0]
            const type = declaration[1]
            const name = declaration[2].replace(";", "")
            if (qualifier == 'in') {
                let location = gl.getAttribLocation(program, name)
                attribloc[name] = {
                    location: location
                }
            }
            if (qualifier == 'uniform') {
                let location = gl.getUniformLocation(program, name)
                if (!location) {
                    throw Error(`Could not locate uniform ${name}`)
                }
                uniformloc[name] = {
                    location: location
                }
            }
        }
    })

    return program
}

export function glAssociateStaticIndexBuffer(data: Uint8Array | Uint16Array | Uint32Array): WebGLBuffer {
    const buf = gl.createBuffer();
    if (!buf) {
        console.error("Failed to allocate static index buffer.")
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buf)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

    return buf
}

//------------------------------------------------------------------
//
// Associates the vertex array buffer with its corresponding attributes
//
//------------------------------------------------------------------
let bufid = -1;
export function glAssociateVertexBuffer(data: Float32Array | Float64Array, associated: Array<{ name: string, elements: number }>): number {
    bufid += 1

    // create webGL buffer object
    const buf = gl.createBuffer();
    if (!buf) {
        console.error("Failed to allocate static vertex buffer.")
    }

    // bind buffer data to buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)

    // get the amount of elements in each chunk
    let elements = 0;
    associated.forEach((attrib) => {
        elements += attrib.elements
    })

    // associate the needed values to bind the buffer
    buffers[bufid] = {
        buffer: buf,
        attribs: associated,
        bytes: data.BYTES_PER_ELEMENT,
        stride: data.BYTES_PER_ELEMENT * elements
    }

    // return bufid that can identify the BufInfo object when binding
    return bufid;
}

//------------------------------------------------------------------
//
// Binds the associated array buffer to be drawn
//
//------------------------------------------------------------------
export function glBindArrayBuffer(bufid: number) {
    let bufinfo = buffers[bufid]
    // bind the WebGLBuffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, bufinfo.buffer);
    const { attribs, stride, bytes } = bufinfo;

    // bind each associated attribute pointers to the correct position in the buffer
    let offset = 0;
    attribs.forEach((attrib) => {
        const loc = attribloc[attrib.name].location
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, attrib.elements, gl.FLOAT, false, stride, offset * bytes)
        offset += attrib.elements;
    })
}

//------------------------------------------------------------------
//
// Binds the index buffer to
//
//------------------------------------------------------------------
export function glBindIndexBuffer(indexbuf: WebGLBuffer) {
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexbuf)
}

//------------------------------------------------------------------
//
// Unbinds the array buffer and the element array buffer
//
//------------------------------------------------------------------
export function glUnbind() {
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
}

export function glBindUniform(uniform: string, data: any) {
}

