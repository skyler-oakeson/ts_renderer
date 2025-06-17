import { context } from "@/main";
import { type FloatArr, type UintArr } from "@/types/gl";
import { type Buffer } from "./buf";
import { attrloc } from "./rendering";

const { gl } = context

export class GeometryBuffer implements Buffer {
    private _buf: WebGLBuffer
    private _indbuf: WebGLBuffer
    private _bytes: number
    private _verts: FloatArr
    private _ind: UintArr
    private _elem: number
    private _ident: string
    private _normalized: boolean
    private _loc: number

    public constructor(verts: FloatArr, ind: UintArr, ident: string, normalized = false) {
        if (attrloc[ident] > 0) {
            throw Error(`${ident} is not a valid identifier.`)
        }
        this._loc = attrloc[ident]
        this._ident = ident;
        this._elem = 3
        this._buf = gl.createBuffer();
        this._indbuf = gl.createBuffer();

        // bind data to buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this._buf)
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indbuf)
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ind, gl.STATIC_DRAW)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)

        this._bytes = verts.BYTES_PER_ELEMENT;
        this._verts = verts;
        this._ind = ind;
        this._normalized = normalized
    }

    public get ident(): string {
        return this._ident;
    };

    public get buf(): WebGLBuffer {
        return this._buf;
    };

    public get bytes(): number {
        return this._bytes;
    };

    public get elem(): number {
        return this._elem;
    };

    public get ind(): UintArr {
        return this._ind;
    };

    public get indbuf(): WebGLBuffer {
        return this._indbuf;
    };

    public get data(): FloatArr {
        return this._verts;
    };

    public get normalized(): boolean {
        return this._normalized;
    };

    public get loc(): number {
        return this._loc
    }

    public get length(): number {
        return this.ind.length
    }

    public bind() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buf)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indbuf)

        gl.enableVertexAttribArray(this.loc);
        gl.vertexAttribPointer(this.loc, this.elem, gl.FLOAT, false, 0, 0)
    }

    public unbind() {
        gl.bindBuffer(gl.ARRAY_BUFFER, null)
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
    }

}
