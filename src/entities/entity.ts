import type { Matrix4x4, Vec3, Vec4 } from "@math/matrix"
import { context } from "@/main";
import {
    glBindUniform,
    glGetBuffer,
    glUnbindBuffers,
} from "@/api/rendering";
import { rotationMatrix, scalingMatrix, translationMatrix, multiply3Matrix4x4, viewMatrix, transposeMatrix4x4, inverseMatrix4x4 } from "@math/matrix";
import type { Buffer } from "@/api/buf";
import { perspectiveProjection } from "@math/matrix";
const { gl, canvas } = context


export type Constructor = new (...args: any[]) => {}
export type GConstructor<T = {}> = new (...args: any[]) => T;


class Base { }
export const Entity = Rotate(Position(Scale(Observe(Base))));
export const GeometryEnity = Geometric(Binder(Entity));
export const NormalGeometry = Normalized(GeometryEnity)
export const TexturedNormal = Textured(NormalGeometry)
export const Camera = View(Binder(Entity))

export type Observable = GConstructor<{
    subscribe(update: () => void): void
    notify(): void
    update(): void
}>

export function Observe<TBase extends Constructor>(Base: TBase) {
    return class Observing extends Base {
        private _updates: Array<() => void> = []
        private _updated: boolean = false;

        public constructor(...args: Array<any>) {
            super(...args)
        }

        public subscribe(update: () => void) {
            this._updates.push(update)
            console.log(this._updates)
        }

        public notify(): void {
            this._updated = true;
        }

        public update(): void {
            if (this._updated) {
                this._updates.forEach((update) => {
                    update()
                })
            }
            this._updated = false;
        }
    }
}

export type Rotateable = GConstructor<{
    yaw: number
    pitch: number
    roll: number
    rmat: Matrix4x4
    orient(yaw: number, pitch: number, roll: number): void
    rotate(yaw: number, pitch: number, roll: number): void
}> & Observable

export function Rotate<TBase extends Observable>(Base: TBase) {
    return class Rotating extends Base {
        private _yaw = 0;
        private _pitch = 0;
        private _roll = 0;
        private _rmat = rotationMatrix(this.yaw, this.pitch, this.roll)

        orient(yaw: number, pitch: number, roll: number) {
            this.yaw = yaw;
            this.pitch = pitch;
            this.roll = roll;
            this.rmat = rotationMatrix(this.yaw, this.pitch, this.roll)
        }

        rotate(yaw: number, pitch: number, roll: number) {
            this.yaw += yaw;
            this.pitch += pitch;
            this.roll += roll;
            this.rmat = rotationMatrix(this.yaw, this.pitch, this.roll)
        }

        public get yaw(): number {
            return this._yaw;
        }

        public set yaw(yaw: number) {
            this._yaw = yaw
            this.rmat = rotationMatrix(this.yaw, this.pitch, this.roll)
            this.notify()
        }

        public get pitch(): number {
            return this._pitch;
        }

        public set pitch(pitch: number) {
            this._pitch = pitch
            this.rmat = rotationMatrix(this.yaw, this.pitch, this.roll)
            this.notify()
        }

        public get roll(): number {
            return this._roll;
        }

        public set roll(roll: number) {
            this._roll = roll
            this.rmat = rotationMatrix(this.yaw, this.pitch, this.roll)
            this.notify()
        }

        public get rmat(): Matrix4x4 {
            return this._rmat
        }

        private set rmat(rmat: Matrix4x4) {
            this._rmat = rmat;
            this.notify()
        }
    }
}

export type Positionable = GConstructor<{
    pos: Vec3
    scaler: number
    tmat: Matrix4x4
    position(pos: Vec3): void
    translate(delta: Vec3): void
}> & Observable

export function Position<TBase extends Observable>(Base: TBase) {
    return class Positioning extends Base {
        private _pos: Vec3 = [0, 0, 0]
        private _tmat: Matrix4x4 = translationMatrix(this._pos)

        public position(pos: Vec3) {
            this.pos = pos
        }

        public translate(delta: Vec3) {
            this.pos = [this._pos[0] + delta[0], this._pos[1] + delta[1], this._pos[2] + delta[2]]
        }

        public get pos(): Vec3 {
            return this._pos;
        }

        private set pos(pos: Vec3) {
            this._pos = pos;
            this.tmat = translationMatrix(this._pos)
            this.notify()
        }

        public get tmat(): Matrix4x4 {
            return this._tmat;
        }

        private set tmat(tmat: Matrix4x4) {
            this._tmat = tmat
            this.notify()
        }
    }
}

export type Scaleable = GConstructor<{
    scaler: number
    smat: Matrix4x4
    scale(scale: number): void
    grow(scale: number): void
    shrink(scale: number): void
}> & Observable

export function Scale<TBase extends Observable>(Base: TBase) {
    return class Scaling extends Base {
        private _scaler = 1;
        private _smat = scalingMatrix(this._scaler)

        public scale(scale: number) {
            this.scaler = scale
        }

        public grow(sum: number) {
            this.scaler += sum;
        }

        public shrink(diff: number) {
            if (this.scaler < diff) {
                this.scaler = 0;
            } else {
                this.scaler -= diff
            }
        }

        public get scaler(): number {
            return this._scaler
        }

        private set scaler(scaler: number) {
            this.smat = scalingMatrix(scaler)
            this._scaler = scaler;
            this.notify()
        }

        public get smat(): Matrix4x4 {
            return this._smat
        }

        private set smat(smat: Matrix4x4) {
            this._smat = smat
            this.notify()
        }
    }
}

export type Bindable = GConstructor<{
    bind(): void
    register(buf: Buffer): void
}>

export function Binder<TBase extends Constructor>(Base: TBase) {
    return class Binding extends Base {
        private _bindees: Array<Buffer> = []

        public bind(): void {
            this._bindees.forEach((buf) => {
                buf.bind()
            })
        }

        public unbind(): void {
            this._bindees.forEach((buf) => {
                buf.unbind()
            })
        }

        public register(buf: Buffer): void {
            this._bindees.push(buf)
        }

        public get bindees(): Array<Buffer> {
            return this._bindees
        }
    }
}


export type Geometrical = GConstructor<{
    mmat: Matrix4x4
    render(): void
}> & Bindable & Positionable


export function Geometric<TBase extends Bindable & typeof Entity>(Base: TBase) {
    return class Geometry extends Base {
        private _geobuf: Buffer;
        private _mmat = multiply3Matrix4x4(this.rmat, this.tmat, this.smat)

        // updates mmat if there are changes to the rmat, tmat, or smat
        private _upmmat = () => {
            this._mmat = multiply3Matrix4x4(this.rmat, this.tmat, this.smat);
        }

        public constructor(geoid: number, ...args: any[]) {
            super(...args)
            this._geobuf = glGetBuffer(geoid)
            this.subscribe(this._upmmat)
            this.register(this._geobuf)
        }

        public render() {
            this.bind()
            glBindUniform("u_model", this.mmat)
            gl.drawElements(gl.TRIANGLES, this._geobuf.length, gl.UNSIGNED_INT, 0);
            glUnbindBuffers()
        }

        public get mmat(): Matrix4x4 {
            return this._mmat
        }

        public set mmat(mmat: Matrix4x4) {
            this.notify();
        }
    }
}


export function Normalized<TBase extends Geometrical>(Base: TBase) {
    return class Normals extends Base {
        private _normbuf: Buffer;
        private _nmat: Matrix4x4

        // updates nmat if there are changes rmat, tmat, or smat which would result in a new mmat
        // beacuse this registers the update second we don't need to worry about mmat not updating first
        private _upnmat = () => {
        }

        public constructor(normid: number, ...args: any[]) {
            super(...args)
            this._normbuf = glGetBuffer(normid)
            this.subscribe(this._upnmat)
            this.register(this._normbuf)
        }

        public render() {
            // glBindUniform("u_norm", this.nmat)
            super.render()
        }

        public get nmat(): Matrix4x4 {
            return this._nmat
        }
    }
}

export function Textured<TBase extends Geometrical>(Base: TBase) {
    return class Texturing extends Base {
        private _texbuf: Buffer;

        public constructor(texid: number, ...args: any[]) {
            super(...args)
            this._texbuf = glGetBuffer(texid)
            this.register(this._texbuf)
        }

        public render() {
            super.render()
        }
    }
}


// TODO Under construction. Finish assignment first 
type Viewable = GConstructor<{ pos: Vec3 }>
function View<TBase extends Bindable>(Base: TBase) {
    return class Viewing extends Base {
        private _fov: number;
        private _height: number;
        private _width: number;
        private _aspect: number;
        private _near: number;
        private _far: number;
        private _proj: Matrix4x4

        private _up: Vec3;
        private _right: Vec3;
        private _forward: Vec3;
        private _view: Matrix4x4

        public constructor() {
            super()
            this._fov = 90;
            this._height = canvas.height
            this._width = canvas.width
            this._aspect = canvas.width / canvas.height;
            this._near = .1;
            this._far = 1000;
            this._proj = perspectiveProjection(this.fov, this.aspect, this.near, this.far)

            this._right = [1, 0, 0];
            this._up = [0, 1, 0];
            this._forward = [0, 0, -1];
            this._view = viewMatrix(this.right, this.up, this.forward, this.pos)
        }

        public get fov(): number {
            return this._fov
        }

        public set fov(fov: number) {
            this._fov = fov;
        }

        public get aspect(): number {
            this._aspect = this.width / this.height;
            return this._aspect;
        }

        public get near(): number {
            return this._near
        }

        public set near(near: number) {
            this._near = near;
        }

        public get far(): number {
            return this.far
        }

        public set far(far: number) {
            this._far = far;
        }

        public get proj(): Matrix4x4 {
            return this._proj;
        }

        public get up(): Vec3 {
            return this._up
        }

        public get right(): Vec3 {
            return this._right
        }

        public get forward(): Vec3 {
            return this._forward
        }

        public get view(): Matrix4x4 {
            return this._view
        }

        public get width() {
            if (this._width != canvas.width) {
                this._width = canvas.width;
            }
            return this._width
        }

        public get height() {
            if (this._height != canvas.height) {
                this._height = canvas.height;
            }
            return this._height
        }
    }
}
