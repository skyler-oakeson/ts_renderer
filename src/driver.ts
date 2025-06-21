import { context } from "@/main";
import vert from "@shaders/vertex.vert?raw"
import frag from "@shaders/fragment.frag?raw"
import {
    glCreateShaderProgram,
    glBindUniform,
    glNewGeometryBuffer,
    glNewNormalBuffer,
    glNewTextureBuffer,
    glGetBuffer
} from "@api/rendering"
import { orthographicProjection, perspectiveProjection } from "@math/matrix";
import { parsePly } from "@utils/ply";
import { NormalGeometry, TexturedNormal } from "./entities/entity";
import { loadTexture } from "./utils/load";

const { gl, canvas } = context;
// stay at top of file or else we have no registered indentifiers
const program = glCreateShaderProgram(vert, frag)
gl.useProgram(program)

const near = .1;
const far = 100;
const aspect = canvas.width / canvas.height; // width / height
const fov = 90;


let parsed = await parsePly('bunny.ply')
const texture = await loadTexture('bunny.png')
let rabbitbufs = {
    geo: glNewGeometryBuffer(parsed.vertices, parsed.indices, 'a_pos'),
    norm: glNewNormalBuffer(parsed.normals, 'a_norm'),
    tex: glNewTextureBuffer(parsed.uvs, texture, 'a_uv'),
}

parsed = await parsePly('dragon_vrip.ply')
let dragonbufs = {
    geo: glNewGeometryBuffer(parsed.vertices, parsed.indices, 'a_pos'),
    norm: glNewNormalBuffer(parsed.normals, 'a_norm'),
}

glBindUniform('u_proj', perspectiveProjection(fov, aspect, near, far))
glBindUniform('u_light_pos', [0, 7, 12])
glBindUniform('u_light_color', [1, 1, 1])
glBindUniform('u_shine', 34.0)

let rabbit = new TexturedNormal(rabbitbufs.tex, rabbitbufs.norm, rabbitbufs.geo)
rabbit.scale(2)
rabbit.position([.8, -.5, -3])

let dragon = new NormalGeometry(dragonbufs.norm, dragonbufs.geo)
dragon.scale(2)
dragon.position([-.8, -.5, -3])

const entities = [rabbit, dragon]
const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    entities.forEach((entity) => {
        entity.render()
    })
}


let counter = 0;
let mode = 0;
const update = (elapsed: DOMHighResTimeStamp) => {
    dragon.rotate(1, 0, 0)
    rabbit.rotate(1, 0, 0)

    entities.forEach((entity) => {
        entity.update()
    })

    counter += elapsed;
    if (counter > 5000 && mode < 4) {
        mode += 1
        glBindUniform('u_mode', mode)
        counter = 0
    }
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
