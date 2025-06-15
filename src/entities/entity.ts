import type { Matrix4x4, Vec3, Vec4 } from "@types/matrix"
import { context } from "@/main";
import {
    glBindBuffers,
    glBindUniform,
    glGetIndiceLength,
    glUnbindBuffers,
} from "@/api/rendering";
import { rotationMatrix, scalingMatrix, translationMatrix, multiply3Matrix4x4 } from "@/utils/matrix";
import { loadModel } from "@/utils/load";
const { gl } = context

class Entity { }
type Constructor = new (...args: any[]) => {}
type GConstructor<T = {}> = new (...args: any[]) => T;

type Watchable = GConstructor<{
    changed: boolean
    notify(): void
    acknowledge(): boolean
}>

function Watch<TBase extends Constructor>(Base: TBase) {
    return class Watching extends Base {
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

function Rotate<TBase extends Watchable>(Base: TBase) {
    return class Rotating extends Base {
        private _yaw = 0;
        private _pitch = 0;
        private _roll = 0;

        orient(yaw: number, pitch: number, roll: number) {
            this.notify()
            this._yaw = yaw;
            this._pitch = pitch;
            this._roll = roll;
        }

        rotate(yaw: number, pitch: number, roll: number) {
            this.notify()
            this._yaw += yaw;
            this._pitch += pitch;
            this._roll += roll;
        }

        get yaw(): number {
            return this._yaw;
        }

        get pitch(): number {
            return this._pitch;
        }

        get roll(): number {
            return this._roll;
        }
    }
}

function Position<TBase extends Watchable>(Base: TBase) {
    return class Positioning extends Base {
        private _pos: Vec3 = [0, 0, 0]

        position(x: number, y: number, z: number) {
            this.notify()
            this._pos = [x, y, z]
        }

        translate(x: number, y: number, z: number) {
            this.notify()
            this._pos = [this._pos[0] + x, this._pos[1] + y, this._pos[2] + z]
        }


        get pos(): Vec3 {
            return this._pos;
        }
    }
}

function Scale<TBase extends Watchable>(Base: TBase) {
    return class Scaling extends Base {
        private _scaler = 1;

        scale(scale: number) {
            this.notify()
            this._scaler = scale;
        }

        public grow(sum: number) {
            this.notify()
            this._scaler += sum;
        }

        public shrink(diff: number) {
            this.notify()
            if (this._scaler < diff) {
                this._scaler = 0;
            } else {
                this._scaler -= diff
            }
        }

        get scaler(): number {
            return this._scaler
        }
    }
}

type Renderable = GConstructor<{
    pos: Vec3
    scaler: number
    yaw: number
    pitch: number
    roll: number
    changed: boolean
    acknowledge(): boolean
}>

function Render<TBase extends Renderable>(Base: TBase) {
    return class Rendering extends Base {
        private _bufid: number;
        private _rotation = rotationMatrix(this.yaw, this.pitch, this.roll)
        private _translation = translationMatrix(...this.pos)
        private _scaling = scalingMatrix(this.scaler)
        private _model = multiply3Matrix4x4(this._rotation, this._translation, this._scaling)

        public constructor(modelid: number) {
            super()
            this._bufid = modelid
        }

        render() {
            glBindBuffers(this._bufid)
            glBindUniform("u_model", this.model)
            let indlen = glGetIndiceLength(this.bufid)
            gl.drawElements(gl.TRIANGLES, indlen, gl.UNSIGNED_BYTE, 0);
            glUnbindBuffers()
        }

        get model(): Matrix4x4 {
            if (this.acknowledge()) {
                this._rotation = rotationMatrix(this.yaw, this.pitch, this.roll)
                this._translation = translationMatrix(...this.pos)
                this._scaling = scalingMatrix(this.scaler)
                this._model = multiply3Matrix4x4(this._rotation, this._translation, this._scaling);
            }
            return this._model
        }

        get bufid() {
            return this._bufid
        }
    }
}


type Emitable = GConstructor<{
    pos: Vec3
    changed: boolean
    acknowledge(): boolean
}>

function Emit<TBase extends Emitable>(Base: TBase) {
    return class Emitting extends Base {
        private _color: Vec4;
        private _uniid: number;

        public constructor() {
        }
    }
}

const Movable = (input: any) => (Rotate(Position(Scale(Watch(input)))))

export const Triangle = Render(Movable(Entity))
export const Light = Emit(Position(Watch(Entity)))



