import type { Vec3 } from "@types/matrix"
import { context } from "@/main";
import {
    glAssociateUniform,
    glBindBuffers,
    glBindUniform,
    glGetIndiceLength,
    glUnbindBuffers,
    glUpdateUniformData
} from "@/api/rendering";

import { rotationMatrix, scalingMatrix, translationMatrix, multiply3Matrix4x4 } from "@/utils/matrix";
const { gl } = context

abstract class Entity {
    private bufid: number;
    private uniid: number
    private pos: Vec3;
    private yaw: number;
    private pitch: number;
    private roll: number;
    private scaler: number;
    private updated: {
        status: boolean,
        trigger: () => void,
        reset: () => void
    }

    public constructor(
        bufid: number,
        pos?: Vec3,
        yaw?: number,
        pitch?: number,
        roll?: number,
        scaler?: number
    ) {
        this.pos = pos ? pos : [0, 0, 0];
        this.yaw = yaw ? yaw : 0;
        this.pitch = pitch ? pitch : 0;
        this.roll = roll ? roll : 0;
        this.scaler = scaler ? scaler : 1;

        // set updated to true to trigger initial update
        this.updated = {
            status: true,
            trigger: function() { this.status = true },
            reset: function() { this.status = false }
        }

        this.bufid = bufid

        // setup initial conditions
        const mm = multiply3Matrix4x4(
            rotationMatrix(this.yaw, this.pitch, this.roll),
            translationMatrix(this.pos[0], this.pos[1], this.pos[2]),
            scalingMatrix(this.scaler)
        )

        this.uniid = glAssociateUniform('u_model', mm)
    }

    public render() {
        glBindBuffers(this.bufid)
        glBindUniform(this.uniid)
        let indlen = glGetIndiceLength(this.bufid)
        gl.drawElements(gl.TRIANGLES, indlen, gl.UNSIGNED_BYTE, 0);
        glUnbindBuffers()
    }

    public update(elapsed: DOMHighResTimeStamp): void {
        if (this.updated.status) {
            this.updated.reset()
            const mm = multiply3Matrix4x4(
                rotationMatrix(this.yaw, this.pitch, this.roll),
                translationMatrix(this.pos[0], this.pos[1], this.pos[2]),
                scalingMatrix(this.scaler)
            )
            glUpdateUniformData(this.uniid, mm)
        }
    }

    public position(x: number, y: number, z: number) {
        this.updated.trigger();
        this.pos = [x, y, z]
    }

    public translation(x: number, y: number, z: number) {
        this.updated.trigger();
        this.pos = [this.pos[0] + x, this.pos[1] + y, this.pos[2] + z]
    }

    public orient(yaw: number, pitch: number, roll: number) {
        this.updated.trigger();
        this.yaw = yaw;
        this.yaw = pitch;
        this.roll = roll;
    }

    public rotate(yaw: number, pitch: number, roll: number) {
        this.updated.trigger();
        this.yaw += yaw;
        this.yaw += pitch;
        this.roll += roll;
    }

    public scale(scaler: number) {
        this.updated.trigger();
        this.scaler = scaler;
    }

    public grow(sum: number) {
        this.updated.trigger();
        this.scaler += sum;
    }

    public shrink(diff: number) {
        this.updated.trigger();
        if (this.scaler < diff) {
            this.scaler = 0;
        } else {
            this.scaler -= diff
        }
    }
}

export class Triangle extends Entity {
    public constructor(
        bufid: number,
        pos?: Vec3,
        yaw?: number,
        pitch?: number,
        roll?: number,
        scaler?: number
    ) {
        super(bufid, pos, yaw, pitch, roll, scaler)
    }
}

