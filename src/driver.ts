import { context } from "@/main";
import vert from "@shaders/vertex.vert?raw"
import frag from "@shaders/fragment.frag?raw"

import {
    glCreateShaderProgram,
    glBindBuffers,
    glBindUniform,
    glAssociateBuffers,
    interleave,
} from "./api/rendering"
import { orthographicProjection, perspectiveProjection } from "@utils/matrix";
import { parsePly } from "@utils/ply";
import { Geometry } from "./entities/entity";

const { gl, canvas } = context;
// stay at top of file or else we have no registered indentifiers
const program = glCreateShaderProgram(vert, frag)
gl.useProgram(program)

const near = .1;
const far = 100;
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

const cubeParsed = await parsePly('bun_zipper.ply')
let cubeInter = interleave({ arr: cubeParsed.vertices, elem: 3 }, { arr: cubeParsed.colors, elem: 4 }, { arr: cubeParsed.normals, elem: 3 })
const models = {
    triangle: glAssociateBuffers(TRI_VERT_COL, TRI_IND, { ident: 'a_pos', elem: 3 }, { ident: 'a_color', elem: 4 }),
    cube: glAssociateBuffers(new Float32Array(cubeInter), new Uint16Array(cubeParsed.indices),
        { ident: 'a_pos', elem: 3 },
        { ident: 'a_color', elem: 4 },
        { ident: 'a_norm', elem: 3 })
}

glBindUniform('u_proj', perspectiveProjection(fov, aspect, near, far))
glBindUniform('u_light_pos', [5, 10, 10])
glBindUniform('u_light_color', [5, 10, 10])

let cube = new Geometry(models.cube)
cube.scale(2)
cube.position([0, 0, -4])

const entities = [cube]
const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    entities.forEach((entity) => {
        entity.render()
    })
}

const update = (elapsed: DOMHighResTimeStamp) => {
    cube.rotate(1, 0, 0)
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

    gl.clearColor(0, 0, 0, 1.0);
    gl.clearDepth(1.0);

    // enable depth
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    // enable blending -- this will help when you try to make something transparent
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    // enable culling backfaces
    gl.enable(gl.CULL_FACE)
    gl.enable(gl.BACK)
}

await start()
