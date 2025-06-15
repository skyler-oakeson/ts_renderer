import { context } from "@/main";
import vert from "@shaders/vertex.vert?raw"
import frag from "@shaders/fragment.frag?raw"

import {
    glCreateShaderProgram,
    glBindBuffers,
    glBindUniform,
    glAssociateBuffers,
} from "./api/rendering"
import { orthographicProjection, perspectiveProjection } from "@utils/matrix";
import { parsePly } from "@utils/ply";
import { Triangle } from "./entities/entity";

const { gl, canvas } = context;
// stay at top of file or else we have no registered indentifiers
const program = glCreateShaderProgram(vert, frag)
gl.useProgram(program)

const near = .1;
const far = 1000;
const aspect = canvas.width / canvas.height; // width / height
const fov = 90;


const TRI_VERT_COL = new Float32Array([
    -0.5, 0.5, -1.0, 1.0, 0.0, 0.0, 1.0,
    - 0.5, -0.5, -1.0, 0.0, 1.0, 0.0, 1.0,
    0.5, -0.5, -1.0, 0.0, 0.0, 1.0, 1.0
]);
const TRI_IND = new Uint8Array([
    0, 1, 2
]);

const models = {
    triangle: glAssociateBuffers(TRI_VERT_COL, TRI_IND, [{ ident: 'a_pos', elem: 3 }, { ident: 'a_color', elem: 4 }])
}


let proj = glBindUniform('u_proj', perspectiveProjection(fov, aspect, near, far))

let colormask = glBindUniform('u_mask', new Float32Array([1, 0, 0, 1]))

let triangle = new Triangle(models.triangle)
const entities = [triangle]
const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    triangle.render()
    // entities.forEach((entity) => {
    //     entity.render()
    // })
}

const update = (elapsed: DOMHighResTimeStamp) => {
    triangle.rotate(1, 0, 0)
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

// Kick start the animationloop
const start = async function() {
    // Initalize or do any await functions here
    requestAnimationFrame(animationLoop)

    // set any gl variables as well
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)
}

await start()
