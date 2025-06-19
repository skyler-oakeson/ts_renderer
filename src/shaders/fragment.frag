#version 300 es
precision lowp float;
in vec2 v_uv;
in vec3 v_tr_norm;
in vec3 v_pos;

uniform sampler2D u_sampler;
uniform vec3 u_light_color;
uniform vec3 u_light_pos;
out vec4 out_color;

void main() {
    vec3 N = normalize(v_tr_norm);
    vec3 L = normalize(u_light_pos - v_pos);

    float diffuse = max(dot(N, L), 0.0);
    float ambient = 0.2;
    float specular = 0.0;

    vec4 color = texture(u_sampler, v_uv);
    out_color = vec4((diffuse + ambient) * color.rgb, 1.0);
}
