import { context } from "@/main";
import { type FloatArr, type UintArr } from "@/types/gl";
import { type Buffer } from "./buf";
import { attrloc } from "./rendering";

const { gl } = context

export class NormalBuffer implements Buffer {
    private _buf: WebGLBuffer;
    private _bytes: number;
    private _norms: FloatArr;
    private _elem: number;
    private _ident: string;
    private _normalized: boolean;
    private _loc: number

    public constructor(norms: FloatArr, ident: string, normalized = false) {
        this._ident = ident;
        this._elem = 3
        this._buf = gl.createBuffer();
        this._norms = norms;
        this._loc = attrloc[ident]

        // bind data to buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this._buf)
        gl.bufferData(gl.ARRAY_BUFFER, this._norms, gl.STATIC_DRAW)
        gl.bindBuffer(gl.ARRAY_BUFFER, null)

        this._bytes = norms.BYTES_PER_ELEMENT;
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

    public get data(): FloatArr {
        return this._norms;
    };

    public get loc(): number {
        return this._loc
    }

    public get normalized(): boolean {
        return this._normalized;
    };

    public get length(): number {
        return this.data.length
    }

    public bind() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buf)

        gl.enableVertexAttribArray(this.loc);
        gl.vertexAttribPointer(this.loc, this.elem, gl.FLOAT, false, 0, 0)
    }

    public unbind() {
        gl.bindBuffer(gl.ARRAY_BUFFER, null)
    }
}
