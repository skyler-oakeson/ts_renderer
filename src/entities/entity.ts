import type { Matrix4x4, Vec3, Vec4 } from "@types/matrix"
import { context } from "@/main";
import {
    glBindBuffers,
    glBindUniform,
    glGetIndiceLength,
    glUnbindBuffers,
} from "@/api/rendering";
import { perspectiveProjection, rotationMatrix, scalingMatrix, translationMatrix, multiply3Matrix4x4 } from "@/utils/matrix";
import { loadModel } from "@/utils/load";
const { gl, canvas } = context

class Entity { }
type Constructor = new (...args: any[]) => {}
type GConstructor<T = {}> = new (...args: any[]) => T;

type Changeable = GConstructor<{
    changed: boolean
    notify(): void
    acknowledge(): boolean
}>

function Change<TBase extends Changeable>(Base: TBase) {
    return class Changing extends Base {
        private _changed = false

        notify(): void {
            this._changed = true;
        }

        acknowledge(): boolean {
            if (this._changed) {
                this._changed = false
                return true
            }
            return false
        }
    }
}

function Rotate<TBase extends Changeable>(Base: TBase) {
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
            this.notify()
            this._yaw = yaw
            this.rmat = rotationMatrix(this.yaw, this.pitch, this.roll)
        }

        public get pitch(): number {
            return this._pitch;
        }

        public set pitch(pitch: number) {
            this.notify()
            this._pitch = pitch
            this.rmat = rotationMatrix(this.yaw, this.pitch, this.roll)
        }

        public get roll(): number {
            return this._roll;
        }

        public set roll(roll: number) {
            this.notify()
            this._roll = roll
            this.rmat = rotationMatrix(this.yaw, this.pitch, this.roll)
        }

        public get rmat(): Matrix4x4 {
            return this._rmat
        }

        private set rmat(rmat: Matrix4x4) {
            this.notify()
            this._rmat = rmat;
        }
    }
}

function Position<TBase extends Changeable>(Base: TBase) {
    return class Positioning extends Base {
        private _pos: Vec3 = [0, 0, 0]
        private _tmat: Matrix4x4 = translationMatrix(this._pos)

        public position(pos: Vec3) {
            this.pos = pos
        }

        public translate(x: number, y: number, z: number) {
            this.pos = [this._pos[0] + x, this._pos[1] + y, this._pos[2] + z]
        }

        public get pos(): Vec3 {
            return this._pos;
        }

        private set pos(pos: Vec3) {
            this.notify()
            this._pos = pos;
            this.tmat = translationMatrix(this._pos)
        }

        public get tmat(): Matrix4x4 {
            return this._tmat;
        }

        private set tmat(tmat: Matrix4x4) {
            this.notify()
            this._tmat = tmat
        }
    }
}

function Scale<TBase extends Changeable>(Base: TBase) {
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
            this.notify()
            this.smat = scalingMatrix(scaler)
            this._scaler = scaler;
        }

        private get smat(): Matrix4x4 {
            return this._smat
        }

        private set smat(smat: Matrix4x4) {
            this.notify()
            this._smat = smat
        }
    }
}


type Moveable = GConstructor<{
    pos: Vec3
    tmat: Matrix4x4
    translate(x: number, y: number, z: number): void

    yaw: number
    pitch: number
    roll: number
    rmat: Matrix4x4
    orient(yaw: number, pitch: number, roll: number): void
    rotate(yaw: number, pitch: number, roll: number): void

    scaler: number
    smat: Matrix4x4
    grow(sum: number): void
    shrink(diff: number): void

    changed: boolean
    acknowledge(): boolean
}>

function Render<TBase extends Moveable>(Base: TBase) {
    return class Rendering extends Base {
        private _bufid: number;
        private _model = multiply3Matrix4x4(this.rmat, this.tmat, this.smat)

        public constructor(modelid: number, ...args: any[]) {
            super(args)
            this._bufid = modelid
        }

        render() {
            glBindUniform("u_model", this.model)
            glBindBuffers(this._bufid)
            let indlen = glGetIndiceLength(this.bufid)
            gl.drawElements(gl.TRIANGLES, indlen, gl.UNSIGNED_BYTE, 0);
            glUnbindBuffers()
        }

        get model(): Matrix4x4 {
            this._model = multiply3Matrix4x4(this.rmat, this.tmat, this.smat);
            return this._model
        }

        get bufid() {
            return this._bufid
        }
    }
}

type Emitable = GConstructor<{
    pos: Vec3
}>

function Emit<TBase extends Emitable>(Base: TBase) {
    return class Emitting extends Base {
        private _color: Vec4;

        public constructor(color?: Vec4, ...args: any[]) {
            super(...args)
            this._color = color ? color : [0, 0, 0, 0];
        }

        private bind() {
            glBindUniform('u_light_pos', this.pos)
            glBindUniform('u_light_color', this.color)
        }

        public get color() {
            return this._color
        }

        public set color(color: Vec4) {
            this._color = color;
            this.bind()
        }
    }
}

export const Light = Emit(Position(Change(Entity)))

type Viewable = GConstructor<{
    pos: Vec3
    changed: boolean
    notify(): void
    acknowledge(): boolean
}>

function View<TBase extends Viewable>(Base: TBase) {
    return class Viewing extends Base {
        private _fov: number;
        private _height: number;
        private _width: number;
        private _aspect: number;
        private _near: number;
        private _far: number;
        private _up: Vec3;
        private _right: Vec3;
        private _forward: Vec3;

        public constructor() {
            super()
            this._fov = 90;
            this._height = canvas.height
            this._width = canvas.width
            this._aspect = canvas.width / canvas.height;
            this._near = .1;
            this._far = 1000;
        }

        private bind(): void {
            glBindUniform('u_proj', this.proj)
            glBindUniform('u_view', this.proj)
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
            return this.proj;
        }

        public get view(): Matrix4x4 {
            return this.view
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

const Movable = (input: any) => (Rotate(Position(Scale(Change(input)))))
export const Triangle = Render(Movable(Entity))
export const Camera = View(Rotate(Position(Entity)))



