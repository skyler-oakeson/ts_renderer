import { context } from "../main";
import {
    GLType,
    type AttrLoc,
    type FloatArr,
    type UintArr,
    type UniLoc,
    type AttrObj,
    type AssocAttr,
    type UniObj,
    type AssocUni
} from "../types/gl";

const gl = context.gl;
const attrloc: AttrLoc = {}
const uniloc: UniLoc = {}
const assocbuf: AssocAttr = {}
const assocuni: AssocUni = {}

export function glCreateVertexShader(src: string): WebGLShader {
    const shader = glCreateShader(gl.VERTEX_SHADER, src);
    return shader;
}

export function glCreateFragShader(src: string): WebGLShader {
    const shader = glCreateShader(gl.FRAGMENT_SHADER, src);
    return shader;
}

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

export function glCreateShaderProgram(vertsrc: string, fragsrc: string): WebGLProgram {
    const vert = glCreateVertexShader(vertsrc)
    const frag = glCreateFragShader(fragsrc)
    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    // parse vertex shader to find loactions of attributes and uniforms
    vertsrc.split('\n').forEach((line) => {
        const strippedLine = line.replace(/layout\s*\([^)]*\)\s*/, '').trim();
        let declaration = strippedLine.split(' ')
        if (declaration[0] == "in" || declaration[0] == "uniform") {
            const qual = declaration[0]
            const type = declaration[1]
            const ident = declaration[2].replace(";", "")
            if (qual == 'in') {
                let loc = gl.getAttribLocation(program, ident)
                attrloc[ident] = loc

            }
            if (qual == 'uniform') {
                let loc = gl.getUniformLocation(program, ident)
                if (!loc) {
                    throw Error(`Could not locate uniform ${ident}`)
                }
                uniloc[ident] = loc
            }
        }
    })

    return program
}



//------------------------------------------------------------------
//
// Associates the vertex array buffer with its corresponding identifiers
//
//------------------------------------------------------------------
let bufid = -1;
export function glAssociateBuffers(
    data: FloatArr,
    ind: UintArr,
    assoc: Array<{ ident: string, elem: number }>): number {

    bufid += 1
    // create webGL buffer object
    const vertbuf = gl.createBuffer();
    if (!vertbuf) {
        console.error("Failed to allocate vertex buffer.")
    }
    // bind vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertbuf)
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)


    const indbuf = gl.createBuffer();
    if (!indbuf) {
        console.error("Failed to allocate index buffer.")
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indbuf)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ind, gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

    // get the amount of elements in each chunk
    let elem = 0;
    assoc.forEach((attrib) => {
        elem += attrib.elem
    })

    // associate the needed values to bind the buffer
    assocbuf[bufid] = {
        vertbuf,
        indbuf,
        vertattr: assoc,
        bytes: data.BYTES_PER_ELEMENT,
        stride: data.BYTES_PER_ELEMENT * elem
    }

    // return bufid that can identify the BufInfo object when binding
    return bufid;
}

//------------------------------------------------------------------
//
// Binds the associated array buffer to the vertex shader
//
//------------------------------------------------------------------
export function glBindBuffers(assocbufid: number) {
    let assoc = assocbuf[assocbufid]
    // bind the vertex and index buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, assoc.vertbuf);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, assoc.indbuf)

    const { vertattr, stride, bytes } = assoc;
    // bind each associated attribute pointers to the correct position in the buffer
    let offset = 0;
    vertattr.forEach((attrib: { ident: string, elem: number }) => {
        const loc = attrloc[attrib.ident]
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, attrib.elem, gl.FLOAT, false, stride, offset * bytes)
        offset += attrib.elem;
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
// Unbinds the array passed in as a list
//
//------------------------------------------------------------------
export function glUnbindBuffer(ident: string) {
}



//------------------------------------------------------------------
//
// Associates the uniform data with its identifier
//
//------------------------------------------------------------------
let uniid = -1
export function glAssociateUniform(data: any, ident: string) {
    // TODO make this be able to bind to any uniform
    uniid += 1
    assocuni[uniid] = { data, ident }
    console.log(assocuni)
    return uniid
}


//------------------------------------------------------------------
//
// Binds the associated uniform to the vertex shader 
//
//------------------------------------------------------------------
export function glBindUniform(uniid: number) {
    let uni = assocuni[uniid]
    let loc = uniloc[uni.ident]
    console.log(loc)
    gl.uniformMatrix4fv(loc, false, uni.data)
}
