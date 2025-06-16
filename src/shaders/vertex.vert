#version 300 es
precision highp float;
in vec3 a_pos;
in vec4 a_color;
in vec3 a_norm;
uniform vec4 u_light_color;
uniform vec4 u_light_pos;
uniform mat4 u_proj;
uniform mat4 u_model;
// uniform vec3 u_light_pos;
// uniform vec4 u_light_color;

out vec4 v_color;

void main() {
    gl_Position = u_proj * u_model * vec4(a_pos, 1.0);
    v_color = vec4(a_norm, 1.0) + a_color;
}
