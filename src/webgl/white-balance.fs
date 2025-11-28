#version 300 es

precision highp float;

uniform sampler2D u_image;
uniform vec3 u_avg_color;
uniform float u_global_avg;

in vec2 v_texture_position;
out vec4 outColor;

void main()
{
    vec3 color = texture(u_image, v_texture_position).rgb * u_global_avg / u_avg_color;

    outColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
