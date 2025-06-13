import type { Context } from './types/context'

let height = 1000
let width = 1000

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <canvas id="canvas-main" width="${width}" height="${height}"></canvas>
`
const canvas = document.querySelector<HTMLCanvasElement>('#canvas-main')!
const gl = canvas.getContext('webgl2')!

if (!gl) {
    console.error("webgl2 is not supported.")
}

export const context: Context = {
    canvas: canvas,
    gl: gl
}
