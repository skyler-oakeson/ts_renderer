import type { Matrix4x4, Matrix3x3, Matrix2x2, Vec3 } from "@math/types"

export const IDENTITY_MATRIX = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
]

export const toDegrees = (rad: number) => {
    return rad * 180 / Math.PI
}

const toRadians = (deg: number) => {
    return deg * Math.PI / 180
}

//------------------------------------------------------------------
//
// Transpose a matrix.
// Reference: https://jsperf.com/transpose-2d-array
//
//------------------------------------------------------------------
export function transposeMatrix4x4(m: Matrix4x4): Matrix4x4 {
    let t: Matrix4x4 = [
        m[0], m[4], m[8], m[12],
        m[1], m[5], m[9], m[13],
        m[2], m[6], m[10], m[14],
        m[3], m[7], m[11], m[15]
    ];
    return t;
}

//------------------------------------------------------------------
//
// Helper function to multiply two 4x4 matrices.
//
//------------------------------------------------------------------
export function multiplyMatrix4x4(m1: Matrix4x4, m2: Matrix4x4): Matrix4x4 {
    let r: Matrix4x4 = [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0
    ];

    // "Optimized" manual multiplication
    r[0] = m1[0] * m2[0] + m1[1] * m2[4] + m1[2] * m2[8] + m1[3] * m2[12];
    r[1] = m1[0] * m2[1] + m1[1] * m2[5] + m1[2] * m2[9] + m1[3] * m2[13];
    r[2] = m1[0] * m2[2] + m1[1] * m2[6] + m1[2] * m2[10] + m1[3] * m2[14];
    r[3] = m1[0] * m2[3] + m1[1] * m2[7] + m1[2] * m2[11] + m1[3] * m2[15];

    r[4] = m1[4] * m2[0] + m1[5] * m2[4] + m1[6] * m2[8] + m1[7] * m2[12];
    r[5] = m1[4] * m2[1] + m1[5] * m2[5] + m1[6] * m2[9] + m1[7] * m2[13];
    r[6] = m1[4] * m2[2] + m1[5] * m2[6] + m1[6] * m2[10] + m1[7] * m2[14];
    r[7] = m1[4] * m2[3] + m1[5] * m2[7] + m1[6] * m2[11] + m1[7] * m2[15];

    r[8] = m1[8] * m2[0] + m1[9] * m2[4] + m1[10] * m2[8] + m1[11] * m2[12];
    r[9] = m1[8] * m2[1] + m1[9] * m2[5] + m1[10] * m2[9] + m1[11] * m2[13];
    r[10] = m1[8] * m2[2] + m1[9] * m2[6] + m1[10] * m2[10] + m1[11] * m2[14];
    r[11] = m1[8] * m2[3] + m1[9] * m2[7] + m1[10] * m2[11] + m1[11] * m2[15];

    r[12] = m1[12] * m2[0] + m1[13] * m2[4] + m1[14] * m2[8] + m1[15] * m2[12];
    r[13] = m1[12] * m2[1] + m1[13] * m2[5] + m1[14] * m2[9] + m1[15] * m2[13];
    r[14] = m1[12] * m2[2] + m1[13] * m2[6] + m1[14] * m2[10] + m1[15] * m2[14];
    r[15] = m1[12] * m2[3] + m1[13] * m2[7] + m1[14] * m2[11] + m1[15] * m2[15];

    return r;
}

//------------------------------------------------------------------
//
// Invert a matrix.
//
//------------------------------------------------------------------
/**
 * Calculates the inverse of a 4x4 matrix using the adjugate method
 * @param m - Input 4x4 matrix in row-major order
 * @returns Inverse matrix or null if matrix is singular (non-invertible)
 */
export function inverseMatrix4x4(m: Matrix4x4): Matrix4x4 | null {
    // Extract matrix elements for readability
    const [
        m00, m01, m02, m03,
        m10, m11, m12, m13,
        m20, m21, m22, m23,
        m30, m31, m32, m33
    ] = m;

    // Calculate cofactors for the first row to get determinant
    const c00 = m11 * (m22 * m33 - m23 * m32) - m12 * (m21 * m33 - m23 * m31) + m13 * (m21 * m32 - m22 * m31);
    const c01 = -(m10 * (m22 * m33 - m23 * m32) - m12 * (m20 * m33 - m23 * m30) + m13 * (m20 * m32 - m22 * m30));
    const c02 = m10 * (m21 * m33 - m23 * m31) - m11 * (m20 * m33 - m23 * m30) + m13 * (m20 * m31 - m21 * m30);
    const c03 = -(m10 * (m21 * m32 - m22 * m31) - m11 * (m20 * m32 - m22 * m30) + m12 * (m20 * m31 - m21 * m30));

    // Calculate determinant
    const det = m00 * c00 + m01 * c01 + m02 * c02 + m03 * c03;

    // Check if matrix is singular
    if (Math.abs(det) < 1e-10) {
        return null; // Matrix is not invertible
    }

    const invDet = 1.0 / det;

    // Calculate remaining cofactors
    const c10 = -(m01 * (m22 * m33 - m23 * m32) - m02 * (m21 * m33 - m23 * m31) + m03 * (m21 * m32 - m22 * m31));
    const c11 = m00 * (m22 * m33 - m23 * m32) - m02 * (m20 * m33 - m23 * m30) + m03 * (m20 * m32 - m22 * m30);
    const c12 = -(m00 * (m21 * m33 - m23 * m31) - m01 * (m20 * m33 - m23 * m30) + m03 * (m20 * m31 - m21 * m30));
    const c13 = m00 * (m21 * m32 - m22 * m31) - m01 * (m20 * m32 - m22 * m30) + m02 * (m20 * m31 - m21 * m30);

    const c20 = m01 * (m12 * m33 - m13 * m32) - m02 * (m11 * m33 - m13 * m31) + m03 * (m11 * m32 - m12 * m31);
    const c21 = -(m00 * (m12 * m33 - m13 * m32) - m02 * (m10 * m33 - m13 * m30) + m03 * (m10 * m32 - m12 * m30));
    const c22 = m00 * (m11 * m33 - m13 * m31) - m01 * (m10 * m33 - m13 * m30) + m03 * (m10 * m31 - m11 * m30);
    const c23 = -(m00 * (m11 * m32 - m12 * m31) - m01 * (m10 * m32 - m12 * m30) + m02 * (m10 * m31 - m11 * m30));

    const c30 = -(m01 * (m12 * m23 - m13 * m22) - m02 * (m11 * m23 - m13 * m21) + m03 * (m11 * m22 - m12 * m21));
    const c31 = m00 * (m12 * m23 - m13 * m22) - m02 * (m10 * m23 - m13 * m20) + m03 * (m10 * m22 - m12 * m20);
    const c32 = -(m00 * (m11 * m23 - m13 * m21) - m01 * (m10 * m23 - m13 * m20) + m03 * (m10 * m21 - m11 * m20));
    const c33 = m00 * (m11 * m22 - m12 * m21) - m01 * (m10 * m22 - m12 * m20) + m02 * (m10 * m21 - m11 * m20);

    // Return the adjugate matrix divided by determinant (transpose of cofactor matrix)
    return [
        c00 * invDet, c10 * invDet, c20 * invDet, c30 * invDet,
        c01 * invDet, c11 * invDet, c21 * invDet, c31 * invDet,
        c02 * invDet, c12 * invDet, c22 * invDet, c32 * invDet,
        c03 * invDet, c13 * invDet, c23 * invDet, c33 * invDet
    ];
}

//------------------------------------------------------------------
//
// Create a scaling matrix ready to be sent to the GPU
//
//------------------------------------------------------------------
export function scalingMatrix(scaler: number): Matrix4x4 {
    let s: Matrix4x4 = [
        scaler, 0, 0, 0,
        0, scaler, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ]

    return transposeMatrix4x4(s)
}

//------------------------------------------------------------------
//
// Create a translation matrix ready to be sent to the GPU
//
//------------------------------------------------------------------
export function translationMatrix(pos: Vec3): Matrix4x4 {
    let t: Matrix4x4 = [
        1, 0, 0, pos[0],
        0, 1, 0, pos[1],
        0, 0, 1, pos[2],
        0, 0, 0, 1,
    ]

    return transposeMatrix4x4(t)
}


export function viewMatrix(right: Vec3, up: Vec3, forward: Vec3, pos: Vec3): Matrix4x4 {
    let v: Matrix4x4 = [
        right[0], up[0], forward[0], pos[0],
        right[1], up[1], forward[1], pos[1],
        right[2], up[2], forward[2], pos[2],
        0, 0, 0, 1
    ]

    return transposeMatrix4x4(v)
}

//------------------------------------------------------------------
//
// Create a rotation matrix ready to be sent to the GPU
//
//------------------------------------------------------------------
export const rotationMatrix = function() {
    // cache sin and cos

    var sin: Array<number> = []
    var cos: Array<number> = []

    for (let i = 0; i <= 360; i++) {
        sin.push(Math.sin(toRadians(i)))
        cos.push(Math.cos(toRadians(i)))
    }

    return function(yaw: number, pitch: number, roll: number): Matrix4x4 {

        // x, y, z = aplha, beta, gamma
        yaw > 0 ? yaw = yaw % 360 : yaw = (yaw % 360) + 360
        pitch > 0 ? pitch = pitch % 360 : pitch = (pitch % 360) + 360
        roll > 0 ? roll = roll % 360 : roll = (roll % 360) + 360

        let gamma: Matrix4x4 = [
            cos[roll], -sin[roll], 0, 0,
            sin[roll], cos[roll], 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];

        let beta: Matrix4x4 = [
            1, 0, 0, 0,
            0, cos[pitch], -sin[pitch], 0,
            0, sin[pitch], cos[pitch], 0,
            0, 0, 0, 1,
        ];

        let alpha: Matrix4x4 = [
            cos[yaw], 0, sin[yaw], 0,
            0, 1, 0, 0,
            -sin[yaw], 0, cos[yaw], 0,
            0, 0, 0, 1
        ];

        return transposeMatrix4x4(multiply3Matrix4x4(gamma, beta, alpha))
    }
}()


//------------------------------------------------------------------
//
// Create an orthographic projection projection matrix 
//
//------------------------------------------------------------------
export function orthographicProjection(width, height, aspect, near, far) {
    let left = -width * aspect;
    let right = width * aspect;
    let top = height * aspect;
    let bottom = -height * aspect;
    let op = [
        2 / (right - left), 0, 0, -(right + left) / (right - left),
        0, 2 / (top - bottom), 0, -(top + bottom) / (top - bottom),
        0, 0, -2 / (far - near), -(far + near) / (far - near),
        0, 0, 0, 1
    ];

    return transposeMatrix4x4(op);
}

//------------------------------------------------------------------
//
// Create a perspective projection matrix by using the frustrum
//
//------------------------------------------------------------------
export function perspectiveProjection(fov: number, aspect: number, near: number, far: number) {
    let top = near * Math.tan(toRadians(fov) / 2)
    let bottom = -top
    let right = top * aspect
    let left = -right

    const pp: Matrix4x4 = [
        2 * near / (right - left), 0, 0, -near * (right + left) / (right - left),
        0, (2 * near) / (top - bottom), 0, -near * (top + bottom) / (top - bottom),
        0, 0, -(far + near) / (far - near), (2 * far * near) / (near - far),
        0, 0, -1, 0
    ];

    return transposeMatrix4x4(pp);
}

//------------------------------------------------------------------
//
// Helper function to multiple 3 matrices together
//
//------------------------------------------------------------------
export function multiply3Matrix4x4(mat0: Matrix4x4, mat1: Matrix4x4, mat2: Matrix4x4) {
    return multiplyMatrix4x4(mat0, multiplyMatrix4x4(mat1, mat2))
}

export function magnitudeVec3(vec: Vec3): number {
    return Math.hypot(vec[0], vec[1], vec[2]);
}

export function subtractVec3(vec0: Vec3, vec1: Vec3): Vec3 {
    const res: Vec3 = [
        vec0[0] - vec1[0],
        vec0[1] - vec1[1],
        vec0[2] - vec1[2]
    ]
    return res
}

export function normalizeVec3(vec: Vec3): Vec3 {
    const length = magnitudeVec3(vec)
    if (length > 0) {
        vec[0] /= length;
        vec[1] /= length;
        vec[2] /= length;
        return vec
    }
    return [0, 0, 0]
}


export function crossProductVec3(vec0: Vec3, vec1: Vec3): Vec3 {
    if (!vec0 || !vec1 || vec0.length < 3 || vec1.length < 3) {
        throw new Error('Both vectors must have at least 3 components');
    }
    let res: Vec3 = [
        (vec0[1] * vec1[2] - vec0[2] * vec1[1]),
        (vec0[2] * vec1[0] - vec0[0] * vec1[2]),
        (vec0[0] * vec1[1] - vec0[1] * vec1[0])
    ]
    return res;
}

export function calculateSurfaceNormal(vec0: Vec3, vec1: Vec3, vec2: Vec3): Vec3 {
    let u = subtractVec3(vec1, vec0)
    let v = subtractVec3(vec2, vec0)
    let normal = crossProductVec3(u, v)
    return normalizeVec3(normal)
}

export function calculateVertexNormals(vertices, indices) {
    let surfaceNormals = []
    let vertexNormals = []
    let vertsMap = []

    for (let t = 0; t < (vertices.length / 3); t++) {
        vertsMap.push([])
    }

    // calculate surface normals and map every shared face on each vertex
    for (let i = 0; i < indices.length; i += 3) {
        let i0 = indices[i]
        let i1 = indices[i + 1]
        let i2 = indices[i + 2]

        vertsMap[i0].push(i / 3)
        vertsMap[i1].push(i / 3)
        vertsMap[i2].push(i / 3)

        let v0 = [vertices[i0 * 3], vertices[i0 * 3 + 1], vertices[i0 * 3 + 2]]
        let v1 = [vertices[i1 * 3], vertices[i1 * 3 + 1], vertices[i1 * 3 + 2]]
        let v2 = [vertices[i2 * 3], vertices[i2 * 3 + 1], vertices[i2 * 3 + 2]]

        let normal = calculateSurfaceNormal(v1, v2, v0)
        surfaceNormals.push(...normal)
    }

    // use the vert map to find average of surface normal
    for (let v = 0; v < vertsMap.length; v++) {
        let shared = vertsMap[v];

        let nx = 0
        let ny = 0
        let nz = 0

        for (let s = 0; s < shared.length; s++) {
            let index = shared[s]
            nx += surfaceNormals[index * 3]
            ny += surfaceNormals[index * 3 + 1]
            nz += surfaceNormals[index * 3 + 2]
        }

        vertexNormals.push((nx / shared.length), (ny / shared.length), (nz / shared.length))
    }

    return vertexNormals;
}

