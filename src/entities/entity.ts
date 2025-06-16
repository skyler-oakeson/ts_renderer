import type { Matrix4x4, Vec3, Vec4 } from "@types/matrix"
import { context } from "@/main";
import {
    glBindBuffers,
    glBindUniform,
    glGetIndiceLength,
    glUnbindBuffers,
} from "@/api/rendering";
import { perspectiveProjection, rotationMatrix, scalingMatrix, translationMatrix, multiply3Matrix4x4, viewMatrix } from "@/utils/matrix";
import { loadModel } from "@/utils/load";
import { parsePly } from "@/utils/ply";
const { gl, canvas } = context

class Entity { }
export type Constructor = new (...args: any[]) => {}
export type GConstructor<T = {}> = new (...args: any[]) => T;

export type Changeable = GConstructor<{
    changed: boolean
    notify(): void
    acknowledge(): boolean
}>

export function Change<TBase extends Constructor>(Base: TBase) {
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

        get changed(): boolean {
            return this._changed
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
}> & Changeable

export function Rotate<TBase extends Changeable>(Base: TBase) {
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

export type Positionable = GConstructor<{
    pos: Vec3
    scaler: number
    tmat: Matrix4x4
    position(pos: Vec3): void
    translate(delta: Vec3): void
}> & Changeable

export function Position<TBase extends Changeable>(Base: TBase) {
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

export type Scaleable = GConstructor<{
    scaler: number
    smat: Matrix4x4
    scale(scale: number): void
    grow(scale: number): void
    shrink(scale: number): void
}> & Changeable

export function Scale<TBase extends Changeable>(Base: TBase) {
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

        public get smat(): Matrix4x4 {
            return this._smat
        }

        private set smat(smat: Matrix4x4) {
            this.notify()
            this._smat = smat
        }
    }
}

export type Worldly = Scaleable & Positionable & Rotateable & Changeable

export type Geometrical = GConstructor<{
    bufid: number
    mmat: Matrix4x4
    render(): void
}> & Worldly


export function Geometric<TBase extends Worldly>(Base: TBase) {
    return class Geometry extends Base {
        private _bufid: number;
        private _mmat = multiply3Matrix4x4(this.rmat, this.tmat, this.smat)

        public constructor(bufid: number, ...args: any[]) {
            super(args)
            this._bufid = bufid
        }

        render() {
            glBindUniform("u_model", this.model)
            glBindBuffers(this._bufid)
            let indlen = glGetIndiceLength(this.bufid)
            gl.drawElements(gl.TRIANGLES, indlen, gl.UNSIGNED_SHORT, 0);
            glUnbindBuffers()
        }

        get model(): Matrix4x4 {
            this._mmat = multiply3Matrix4x4(this.rmat, this.tmat, this.smat);
            return this._mmat
        }

        get bufid(): number {
            return this._bufid
        }
    }
}

export function Texture<TBase extends Geometrical>(Base: TBase) {
    return class Texturing extends Base {
    }
}
export const NonStaticEntity = Change(Entity)
export const Geometry = Geometric(Rotate(Position(Scale(NonStaticEntity))));




// TODO Under construction. Finish assignment first 
// type Viewable = GConstructor<{
//     pos: Vec3
//     changed: boolean
//     notify(): void
//     acknowledge(): boolean
// }>
//
// function View<TBase extends Viewable>(Base: TBase) {
//     return class Viewing extends Base {
//         private _fov: number;
//         private _height: number;
//         private _width: number;
//         private _aspect: number;
//         private _near: number;
//         private _far: number;
//         private _proj: Matrix4x4
//
//         private _up: Vec3;
//         private _right: Vec3;
//         private _forward: Vec3;
//         private _view: Matrix4x4
//
//         public constructor() {
//             super()
//             this._fov = 90;
//             this._height = canvas.height
//             this._width = canvas.width
//             this._aspect = canvas.width / canvas.height;
//             this._near = .1;
//             this._far = 1000;
//             this._proj = perspectiveProjection(this.fov, this.aspect, this.near, this.far)
//
//             this._right = [1, 0, 0];
//             this._up = [0, 1, 0];
//             this._forward = [0, 0, -1];
//             this._view = viewMatrix(this.right, this.up, this.forward, this.pos)
//         }
//
//         private bind(): void {
//             glBindUniform('u_proj', this.proj)
//             glBindUniform('u_view', this.view)
//         }
//
//         public get fov(): number {
//             return this._fov
//         }
//
//         public set fov(fov: number) {
//             this._fov = fov;
//         }
//
//         public get aspect(): number {
//             this._aspect = this.width / this.height;
//             return this._aspect;
//         }
//
//         public get near(): number {
//             return this._near
//         }
//
//         public set near(near: number) {
//             this._near = near;
//         }
//
//         public get far(): number {
//             return this.far
//         }
//
//         public set far(far: number) {
//             this._far = far;
//         }
//
//         public get proj(): Matrix4x4 {
//             return this._proj;
//         }
//
//         public get up(): Vec3 {
//             return this._up
//         }
//
//         public get right(): Vec3 {
//             return this._right
//         }
//
//         public get forward(): Vec3 {
//             return this._forward
//         }
//
//         public get view(): Matrix4x4 {
//             return this._view
//         }
//
//         public get width() {
//             if (this._width != canvas.width) {
//                 this._width = canvas.width;
//             }
//             return this._width
//         }
//
//         public get height() {
//             if (this._height != canvas.height) {
//                 this._height = canvas.height;
//             }
//             return this._height
//         }
//     }
// }
//
// export const Camera = View(Rotate(Position(Entity)));
//
// type Emitable = GConstructor<{
//     pos: Vec3
// }>
//
//
// function Emit<TBase extends Emitable>(Base: TBase) {
//     return class Emitting extends Base {
//         private _color: Vec4;
//
//         public constructor(color?: Vec4, ...args: any[]) {
//             super(...args)
//             this._color = color ? color : [0, 0, 0, 0];
//         }
//
//         private bind() {
//             glBindUniform('u_light_pos', this.pos)
//             glBindUniform('u_light_color', this.color)
//         }
//
//         public get color() {
//             return this._color
//         }
//
//         public set color(color: Vec4) {
//             this._color = color;
//             this.bind()
//         }
//     }
// }
//
// export const Light = Emit(Position(Change(Entity)))
//
//
