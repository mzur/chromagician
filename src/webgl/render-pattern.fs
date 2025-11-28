#version 300 es

precision highp float;
precision lowp usampler2D;
precision mediump sampler2D;

uniform usampler2D u_image;
uniform sampler2D u_video;
uniform uint u_color_switch;
in vec2 v_texture_position;
out vec4 outColor;


// TODO think of a good pattern and implement it here. Ideas
// - Read from fixed texture?
// - Animate pattern/texture?

void main() {
   uint color = texture(u_image, v_texture_position).r;

   // If color doesn't match the switch, render the video.
   if (color != u_color_switch) {
      outColor = texture(u_video, v_texture_position);
      return;
   }

   vec3 overlayColor;
   if (color == 1u) {
      // Red
      overlayColor = vec3(1.0, 0.0, 0.0);
   } else if (color == 2u) {
      // Orange
      overlayColor = vec3(1.0, 0.5, 0.0);
   } else if (color == 3u) {
      // Yellow
      overlayColor = vec3(1.0, 1.0, 0.0);
   } else if (color == 4u) {
      // Green
      overlayColor = vec3(0.0, 1.0, 0.0);
   } else if (color == 5u) {
      // Blue
      overlayColor = vec3(0.0, 0.0, 1.0);
   } else if (color == 6u) {
      // Purple
      overlayColor = vec3(1.0, 0.0, 1.0);
   } else {
      // Fallback
      overlayColor = vec3(0.0, 0.0, 0.0);
   }

   outColor = vec4(overlayColor, 1.0);
}
