import type { Context } from './types'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <canvas id="canvas-main" width="${window.innerWidth}" height="${window.innerHeight}"></canvas>
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
