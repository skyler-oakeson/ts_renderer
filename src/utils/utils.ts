const IDENTITY_MATRIX = transposeMatrix4x4(new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
]))

const AXIS = Object.freeze({
    Z: "xy",
    X: "yz",
    Y: "xz",
})

const toDegrees = (rad: number) => {
    return rad * 180 / Math.PI
}

const toRadians = (deg: number) => {
    return deg * Math.PI / 180
}

//------------------------------------------------------------------
//
// Helper function to multiply two 4x4 matrices.
//
//------------------------------------------------------------------
function multiplyMatrix4x4(m1, m2) {
    let r = [
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0];

    // Iterative multiplication
    // for (let i = 0; i < 4; i++) {
    //     for (let j = 0; j < 4; j++) {
    //         for (let k = 0; k < 4; k++) {
    //             r[i * 4 + j] += m1[i * 4 + k] * m2[k * 4 + j];
    //         }
    //     }
    // }

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
// Transpose a matrix.
// Reference: https://jsperf.com/transpose-2d-array
//
//------------------------------------------------------------------
function transposeMatrix4x4(m) {
    let t = [
        m[0], m[4], m[8], m[12],
        m[1], m[5], m[9], m[13],
        m[2], m[6], m[10], m[14],
        m[3], m[7], m[11], m[15]
    ];
    return t;
}


//------------------------------------------------------------------
//
// Create a scaling matrix ready to be sent to the GPU
//
//------------------------------------------------------------------
function scalingMatrix(sx, sy, sz) {
    let s = [
        sx, 0, 0, 0,
        0, sy, 0, 0,
        0, 0, sz, 0,
        0, 0, 0, 1,
    ]

    return transposeMatrix4x4(s)
}

//------------------------------------------------------------------
//
// Create a translation matrix ready to be sent to the GPU
//
//------------------------------------------------------------------
function translationMatrix(dx, dy, dz) {
    let t = [
        1, 0, 0, dx,
        0, 1, 0, dy,
        0, 0, 1, dz,
        0, 0, 0, 1,
    ]

    return transposeMatrix4x4(t)
}

//------------------------------------------------------------------
//
// Create a rotation matrix ready to be sent to the GPU
//
//------------------------------------------------------------------
const rotationMatrix = function() {
    // cache sin and cos

    var sin = []
    var cos = []

    for (let i = 0; i <= 360; i++) {
        sin.push(Math.sin(toRadians(i)))
        cos.push(Math.cos(toRadians(i)))
    }

    return function(yaw, pitch, roll) {

        // x, y, z = aplha, beta, gamma
        yaw > 0 ? yaw = yaw % 360 : yaw = (yaw % 360) + 360
        pitch > 0 ? pitch = pitch % 360 : pitch = (pitch % 360) + 360
        roll > 0 ? roll = roll % 360 : roll = (roll % 360) + 360

        gamma = [
            cos[roll], -sin[roll], 0, 0,
            sin[roll], cos[roll], 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];

        beta = [
            1, 0, 0, 0,
            0, cos[pitch], -sin[pitch], 0,
            0, sin[pitch], cos[pitch], 0,
            0, 0, 0, 1,
        ];

        alpha = [
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
function orthographicProjection(width, height, aspect, near, far) {
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
function perspectiveProjection(fov, aspect, near, far) {
    let top = near * Math.tan(toRadians(fov) / 2)
    let bottom = -top
    let right = top * aspect
    let left = -right

    const pp = [
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
function multiply3Matrix4x4(x, y, z) {
    return multiplyMatrix4x4(x, multiplyMatrix4x4(y, z))
}

function magnitudeVec3(vec3) {
    return Math.hypot(vec3[0], vec3[1], vec3[2]);
}

function subtractVec3(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

function normalizeVec3(vec3) {
    if (!vec3 || vec3.length < 3) {
        throw new Error('Vector must have at least 3 components');
    }
    const length = magnitudeVec3(vec3)
    if (length > 0) {
        vec3[0] /= length;
        vec3[1] /= length;
        vec3[2] /= length;
        return vec3
    }
    return [0, 0, 0]
}


function crossProductVec3(a, b) {
    if (!a || !b || a.length < 3 || b.length < 3) {
        throw new Error('Both vectors must have at least 3 components');
    }
    return [
        (a[1] * b[2] - a[2] * b[1]),
        (a[2] * b[0] - a[0] * b[2]),
        (a[0] * b[1] - a[1] * b[0])
    ];
}

function calculateSurfaceNormal(a, b, c) {
    let u = subtractVec3(b, a)
    let v = subtractVec3(c, a)
    let normal = crossProductVec3(u, v)
    return normalizeVec3(normal)
}

function calculateVertexNormals(vertices, indices) {
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


    console.log(vertexNormals)

    return new Float32Array(vertexNormals);
}

