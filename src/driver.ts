import { context } from "./main";
import vert from "./shaders/vertex.vert?raw"
import frag from "./shaders/fragment.frag?raw"
import { glCreateShaderProgram, glBindBuffers, glBindIndexBuffer, glBindUniform, glAssociateBuffers, glAssociateUniform, glUnbindBuffer } from "./api/rendering"
import { IDENTITY_MATRIX } from "./utils/utils";
const gl = context.gl;

const program = glCreateShaderProgram(vert, frag)
gl.useProgram(program)

const TRI_VERT_COL = new Float32Array([
    -0.5, 0.5, -1.0, 1.0, 0.0, 0.0, 1.0,
    - 0.5, -0.5, -1.0, 0.0, 1.0, 0.0, 1.0,
    0.5, -0.5, -1.0, 0.0, 0.0, 1.0, 1.0
]);
const TRI_IND = new Uint8Array([
    0, 1, 2
]);



let tridata = glAssociateBuffers(TRI_VERT_COL, TRI_IND, [{ ident: 'a_pos', elem: 3 }, { ident: 'a_color', elem: 4 }])
let projdata = glAssociateUniform(IDENTITY_MATRIX, 'u_proj')

glBindBuffers(tridata)
glBindUniform(projdata)

const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, TRI_IND.length, gl.UNSIGNED_BYTE, 0);
}

const update = (elapsed: DOMHighResTimeStamp) => {
}


let prevTime = performance.now()
let totalTime = 0;
const animationLoop: FrameRequestCallback = (time: DOMHighResTimeStamp) => {
    const elapsed = time - prevTime
    prevTime = time
    totalTime += time
    update(elapsed)
    render()
    requestAnimationFrame(animationLoop)
}


gl.clearColor(0.0, 0.0, 0.0, 1.0)
gl.enable(gl.DEPTH_TEST)


// Kick start the animationloop
const start = async function() {
    // Initalize or do any await functions here
    requestAnimationFrame(animationLoop)
}

await start()
