import { context } from "@/main";
import vert from "@shaders/vertex.vert?raw"
import frag from "@shaders/fragment.frag?raw"

import {
    glCreateShaderProgram,
    glBindBuffers,
    glBindUniform,
    glAssociateBuffers,
    glAssociateUniform,
} from "./api/rendering"
import { perspectiveProjection } from "@utils/matrix";
import { parsePly } from "@utils/ply";
import { Triangle } from "./entities/entity";

const gl = context.gl;
const near = .1;
const far = 1000;
const viewport = gl.getParameter(gl.VIEWPORT);
const aspect = viewport[2] / viewport[3]; // width / height
const fov = 90;

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

let tribufid = glAssociateBuffers(TRI_VERT_COL, TRI_IND, [{ ident: 'a_pos', elem: 3 }, { ident: 'a_color', elem: 4 }])
let projdata = glAssociateUniform('u_proj', perspectiveProjection(fov, aspect, near, far))
let colormask = glAssociateUniform('u_mask', new Float32Array([1, 0, 0, 1]))

let triangle = new Triangle(tribufid)
triangle.rotate(0, 45, 90)
glBindUniform(projdata)
glBindUniform(colormask)

const entities = [triangle]

const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    entities.forEach((entity) => {
        entity.render()
    })
}

const update = (elapsed: DOMHighResTimeStamp) => {
    entities.forEach((entity) => {
        entity.update(elapsed)
    })
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
    let bunMod = await parsePly('cube.ply')
}

await start()
