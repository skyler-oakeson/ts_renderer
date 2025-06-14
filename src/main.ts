import type { Context } from './types/context'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <canvas id="canvas-main" width="${window.innerWidth}" height="${window.innerHeight}"></canvas>
`
const canvas = document.querySelector<HTMLCanvasElement>('#canvas-main')!
const gl = canvas.getContext('webgl2')!

function resizeCanvas() {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
}

resizeCanvas()
window.addEventListener('resize', resizeCanvas)

if (!gl) {
    console.error("webgl2 is not supported.")
}

export const context: Context = {
    canvas: canvas,
    gl: gl
}
