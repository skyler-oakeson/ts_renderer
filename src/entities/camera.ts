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

        private bind(): void {
            glBindUniform('u_proj', this.proj)
            glBindUniform('u_view', this.view)
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

export const Camera = View(Rotate(Position(Entity)));
