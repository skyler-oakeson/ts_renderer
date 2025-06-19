import { loadModel } from "@utils/load";
import { calculateVertexNormals } from "@math/matrix";
import type { FloatArr, UintArr } from "../types/gl";

const VERTEX_OFFSET = 3
const FACE_OFFSET = 3

interface Ply {
    vertices: FloatArr
    uvs: FloatArr
    indices: UintArr
    colors: FloatArr
    normals: FloatArr
}


//------------------------------------------------------------------
//
// Parses a ply file
//
//------------------------------------------------------------------
export async function parsePly(file: string): Promise<Ply> {
    const ply = await loadModel(file)
    const lines = ply.split('\n');
    let expectedFaces = 0;
    let expectedVertices = 0;
    let rpos = -1
    let bpos = -1
    let gpos = -1
    let xpos = -1
    let ypos = -1
    let zpos = -1
    let upos = -1
    let vpos = -1

    let vertices: Array<Number> = [];
    const indices: Array<Number> = [];
    const colors: Array<Number> = [];
    let uvs: Array<Number> = []


    let endHeader = 0;

    let pos = 0;
    // parse header
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.includes("end_header")) {
            endHeader = i
            break;
        }

        if (!line || line === '') {
            continue;
        }

        if (line.startsWith("format")) {
            const fileFormat = line.trim().split(' ')[1];
            if (fileFormat.toLowerCase() !== "ascii") {
                console.error(`File format is not ascii. ${fileFormat} format not supported.`);
            }
        }

        if (line.startsWith("property")) {
            let property = line.split(" ")[2]
            switch (property) {
                case "x":
                    xpos = pos
                    pos += 1
                    break
                case "y":
                    ypos = pos
                    pos += 1
                    break
                case "z":
                    zpos = pos
                    pos += 1
                    break
                case "r":
                    rpos = pos
                    pos += 1
                    break
                case "g":
                    gpos = pos
                    pos += 1
                    break
                case "b":
                    bpos = pos
                    pos += 1
                    break
                case "u":
                    upos = pos
                    pos += 1
                    break
                case "v":
                    vpos = pos
                    pos += 1
                    break
                default:
                    break
            }
        }

        if (line.startsWith("comment")) {
            continue;
        }

        if (line.includes("element vertex")) {
            let vertices = line.split(" ")[2]
            if (vertices != null) {
                expectedVertices = parseInt(vertices)
            }
            continue
        }

        if (line.includes("element face")) {
            let faces = line.split(" ")[2]
            if (faces != null) {
                expectedFaces = parseInt(faces);
            }
            continue
        }
    }

    //parse vertex
    for (let i = endHeader + 1; i <= endHeader + expectedVertices; i++) {
        const line = lines[i].trim();
        const vertex = line.trim().split(/\s+/)
        if ([xpos, ypos, zpos].every(pos => pos >= 0)) {
            const x = parseFloat(vertex[xpos])
            const y = parseFloat(vertex[ypos])
            const z = parseFloat(vertex[zpos])
            vertices.push(x, y, z);
        }
        if ([upos, vpos].every(pos => pos >= 0)) {
            const u = parseFloat(vertex[upos])
            const v = parseFloat(vertex[vpos])
            uvs.push(u, v);
        }
        if ([rpos, gpos, bpos].every(pos => pos >= 0)) {
            const r = parseFloat(vertex[rpos])
            const b = parseFloat(vertex[bpos])
            const g = parseFloat(vertex[gpos])
            vertices.push(r, g, b);
            colors.push(r, g, b);
        } else {
            colors.push(1.0, 1.0, 1.0, 1.0)
        }
    }

    // parse faces
    for (let i = endHeader + expectedVertices + 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('3')) {
            const face = line.trim().split(/\s+/).slice(1, 4)
            const v0 = parseInt(face[0]);
            const v1 = parseInt(face[1]);
            const v2 = parseInt(face[2]);
            indices.push(v0, v1, v2);
        } else if (line.startsWith('4')) {
            const face = line.trim().split(/\s+/).slice(1, 5);
            const v0 = parseInt(face[0]);
            const v1 = parseInt(face[1]);
            const v2 = parseInt(face[2]);
            const v3 = parseInt(face[3]);
            indices.push(v0, v1, v2);
            indices.push(v0, v2, v3);
        }
    }

    vertices = convertToUnitSpace(vertices)

    return {
        vertices: new Float32Array(vertices),
        indices: new Uint32Array(indices),
        colors: new Float32Array(colors),
        uvs: new Float32Array(uvs),
        normals: new Float32Array(calculateVertexNormals(vertices, indices)),
    }
}

function convertToUnitSpace(vertices: Array<number>) {
    let max = 0;
    for (let i = 0; i < vertices.length; i++) {
        let cord = Math.abs(vertices[i])
        if (cord > max) {
            max = cord
        }
    }

    let scale = 1.0 / max;
    for (let i = 0; i < vertices.length; i++) {
        vertices[i] *= scale
    }

    return vertices
}


