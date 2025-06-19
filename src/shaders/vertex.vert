#version 300 es
precision highp float;
in vec3 a_pos;
in vec3 a_norm;
in vec2 a_uv;
uniform mat4 u_proj;
uniform mat4 u_model;
// uniform mat4 u_norm;

out vec2 v_uv;
out vec3 v_pos;
out vec3 v_tr_norm;

void main() {
    vec4 pos4 = u_proj * u_model * vec4(a_pos, 1.0);
    v_pos = vec3(pos4);
    gl_Position = pos4;
    v_uv = a_uv;
    v_tr_norm = vec3(transpose(inverse(u_model)) * vec4(a_norm, 0.0));
}
