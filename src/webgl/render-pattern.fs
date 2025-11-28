#version 300 es

precision highp float;
precision lowp usampler2D;

uniform usampler2D u_image;
uniform uint u_color_switch;
in vec2 v_texture_position;
out vec4 outColor;


// TODO think of a good pattern and implement it here. Ideas
// - Read from fixed texture?
// - Animate pattern/texture?

// TODO: Also read video texture here and merge video with pattern.
void main() {
   uint color = texture(u_image, v_texture_position).r;

   // If color doesn't match the switch, render transparent
   if (u_color_switch > 0u && color != u_color_switch) {
      outColor = vec4(0.0);
      return;
   }

   if (color == 0u) {
      // Black
      outColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
   } else if (color == 1u) {
      // Red
      outColor = vec4(1.0, 0.0, 0.0, 1.0);
      return;
   } else if (color == 2u) {
      // Orange
      outColor = vec4(1.0, 0.5, 0.0, 1.0);
      return;
   } else if (color == 3u) {
      // Yellow
      outColor = vec4(1.0, 1.0, 0.0, 1.0);
      return;
   } else if (color == 4u) {
      // Green
      outColor = vec4(0.0, 1.0, 0.0, 1.0);
      return;
   } else if (color == 5u) {
      // Blue
      outColor = vec4(0.0, 0.0, 1.0, 1.0);
      return;
   } else if (color == 6u) {
      // Purple
      outColor = vec4(1.0, 0.0, 1.0, 1.0);
      return;
   }
}
