#version 300 es
precision highp float;
in vec3 a_pos;
in vec4 a_color;
uniform mat4 u_proj;
uniform vec4 u_mask;
uniform mat4 u_model;
uniform vec3 u_light_pos;
uniform vec4 u_light_color;

out vec4 v_color;

void main() {
    gl_Position = u_model * u_proj * vec4(a_pos, 1.0);
    v_color = u_mask + a_color + u_light_color + vec4(u_light_pos, 1.0);
}
