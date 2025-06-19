
import { type FloatArr, type UintArr, type Buffer } from "@api/types";
import { attrloc, uniloc, glBindUniform } from "./rendering";
import { context } from "@/main";

const { gl } = context

export class TextureBuffer implements Buffer {
    private _tex: WebGLTexture
    private _img: HTMLImageElement
    private _loc: number;
    private _samploc: WebGLUniformLocation;
    private _buf: WebGLBuffer
    private _uvs: FloatArr

    public constructor(uvs: FloatArr, image: HTMLImageElement, ident: string) {
        if (attrloc[ident] < 0) {
            throw Error(`${ident} is not a valid identifier.`)
        }

        this._uvs = uvs
        this._img = image;
        this._loc = attrloc[ident]
        this._samploc = uniloc["u_sampler"]
        console.log(uniloc)
        this._buf = gl.createBuffer()
        if (!this._buf) {
            throw Error("Failed to create the buffer object")
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, this._buf)
        gl.bufferData(gl.ARRAY_BUFFER, this._uvs, gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this._tex = gl.createTexture()
        if (!this._tex) {
            throw Error("Failed to create the texture object")
        }

        if (image.complete && image.naturalWidth > 0) {
            gl.bindTexture(gl.TEXTURE_2D, this._tex)
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    }

    public get length(): number {
        return 0
    }

    public bind() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this._buf)
        gl.enableVertexAttribArray(this._loc);
        gl.vertexAttribPointer(this._loc, 2, gl.FLOAT, false, this._uvs.BYTES_PER_ELEMENT * 2, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this._tex);
    }

    public unbind() {
        gl.bindBuffer(gl.ARRAY_BUFFER, null)
        gl.bindTexture(gl.TEXTURE_2D, null)
    }
}
