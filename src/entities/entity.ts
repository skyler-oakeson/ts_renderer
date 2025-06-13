import type { Vec3 } from "../types/matrix"

abstract class Entity {
    public bufid: number;
    public pos: Vec3;

    public constructor(bufid: number, pos: Vec3) {
        this.bufid = bufid
        this.pos = pos;
    }
}


abstract class 
