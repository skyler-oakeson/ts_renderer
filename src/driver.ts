import { context } from "@/main";
import vert from "@shaders/vertex.vert?raw"
import frag from "@shaders/fragment.frag?raw"
import {
    glCreateShaderProgram,
    glBindUniform,
    glNewGeometryBuffer,
    glNewNormalBuffer,
} from "@api/rendering"
import { orthographicProjection, perspectiveProjection } from "@math/matrix";
import { parsePly } from "@utils/ply";
import { Geometry, NormalGeometry, TextureNormalGeometry } from "./entities/entity";

const { gl, canvas } = context;
// stay at top of file or else we have no registered indentifiers
const program = glCreateShaderProgram(vert, frag)
gl.useProgram(program)

const near = .1;
const far = 100;
const aspect = canvas.width / canvas.height; // width / height
const fov = 90;


const parsed = await parsePly('dragon_vrip.ply')
let rabbitbufs = {
    geo: glNewGeometryBuffer(parsed.vertices, parsed.indices, 'a_pos'),
    norm: glNewNormalBuffer(parsed.normals, 'a_norm'),
}


glBindUniform('u_proj', perspectiveProjection(fov, aspect, near, far))
glBindUniform('u_light_pos', [5, 10, 10])
glBindUniform('u_light_color', [5, 10, 10])


let rabbit = new TextureNormalGeometry(rabbitbufs.norm, rabbitbufs.geo)
rabbit.scale(2)
rabbit.position([0, 0, -4])
rabbit.translate([0, -1, -.5])


const entities = [rabbit]
const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    entities.forEach((entity) => {
        entity.render()
    })
}


const update = (elapsed: DOMHighResTimeStamp) => {
    rabbit.rotate(1, 0, 0)
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
