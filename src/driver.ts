import { context } from "./main";
import vert from "./shaders/vertex.vert?raw"
import frag from "./shaders/fragment.frag?raw"

import { glCreateShaderProgram, glBindArrayBuffer, glBindIndexBuffer, glAssociateVertexBuffer, glAssociateStaticIndexBuffer } from "./utils/glutils";

const gl = context.gl;

let prevTime = performance.now()
let totalTime = 0;

glCreateShaderProgram(vert, frag)

const TRI_ASSOCIATED = [{ name: 'a_pos', elements: 3 }, { name: 'a_color', elements: 4 }]

const TRI_VERT_COL = new Float32Array([
    -0.5, 0.5, -1.0, 1.0, 0.0, 0.0, 1.0,
    - 0.5, -0.5, -1.0, 0.0, 1.0, 0.0, 1.0,
    0.5, -0.5, -1.0, 0.0, 0.0, 1.0, 1.0
]);

const TRI_IND = new Uint8Array([
    0, 1, 2
]);

let triid = glAssociateVertexBuffer(TRI_VERT_COL, TRI_ASSOCIATED)
let triindbuf = glAssociateStaticIndexBuffer(TRI_IND);
glBindArrayBuffer(triid)
glBindIndexBuffer(triindbuf)

gl.clearColor(0.0, 0.0, 0.0, 1.0)
gl.enable(gl.DEPTH_TEST)

const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, TRI_IND.length, gl.UNSIGNED_BYTE, 0);
}

const update = (elapsed: DOMHighResTimeStamp) => {
}


const animationLoop: FrameRequestCallback = (time: DOMHighResTimeStamp) => {
    const elapsed = time - prevTime
    prevTime = time
    totalTime += time
    update(elapsed)
    render()
    requestAnimationFrame(animationLoop)
}

// Kick start the animationloop
const start = async function() {
    requestAnimationFrame(animationLoop)
}
await start()
