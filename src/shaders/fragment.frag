#version 300 es
precision lowp float;
in vec2 v_uv;
in vec3 v_tr_norm;
in vec3 v_pos;

uniform sampler2D u_sampler;
uniform vec3 u_light_color;
uniform vec3 u_light_pos;
uniform int u_mode;
uniform float u_shine;
out vec4 out_color;

void main() {
    vec3 N = normalize(v_tr_norm);
    vec3 L = normalize(u_light_pos - v_pos);
    vec3 V = normalize(-v_pos);
    vec3 R = reflect(-L, N);
    vec4 color = texture(u_sampler, v_uv);
    float diffuse = max(dot(N, L), 0.0);
    float ambient = 0.1;
    float specular = 0.0;
    float shinniness = 5.0;

    if (color.rgb == vec3(0.0, 0.0, 0.0)) {
        color = vec4(1.0, 1.0, 1.0, 1.0);
    }

    if (diffuse > 0.0) {
        float spec_angle = max(dot(R, V), 0.0);
        specular = pow(spec_angle, u_shine);
    }

    if (u_mode == 0) {
        out_color = color;
    }
    if (u_mode == 1) {
        out_color = vec4(ambient * color.rgb, 1.0);
    }
    if (u_mode == 2) {
        out_color = vec4((diffuse + ambient) * u_light_color * color.rgb, 1.0);
    }
    if (u_mode == 3) {
        out_color = vec4((specular + ambient) * color.rgb, 1.0);
    }
    if (u_mode == 4) {
        out_color = vec4((diffuse + ambient + specular) * u_light_color * color.rgb, 1.0);
    }
}
