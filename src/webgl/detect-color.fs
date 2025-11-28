#version 300 es

precision highp float;

uniform sampler2D u_image;
in vec2 v_texture_position;
out uvec4 outColor;

void main() {
   vec3 color = texture(u_image, v_texture_position).rgb;

   float v = max(color.r, max(color.g, color.b));

   // Ignore too dark and too bright areas.
   if (v < 0.05) {
      outColor = uvec4(0u);
      return;
   } else if (v > 0.95) {
      outColor = uvec4(0u);
      return;
   }
   float c = v - min(color.r, min(color.g, color.b));
   float s = c / v;

   // Ignore low saturation (gray) colors.
   if (s < 0.15) {
      outColor = uvec4(0u);
      return;
   }

   float h = 0.0;
   if (c != 0.0) {
      if (v == color.r) {
         h = (color.g - color.b) / c;
      } else if (v == color.g) {
         h = 2.0 + (color.b - color.r) / c;
      } else {
         h = 4.0 + (color.r - color.g) / c;
      }
   }
   if (h < 0.0) {
      h = h + 6.0;
   }

   h = 60.0 * h;

   if (h <= 15.0 || h > 340.0) {
      // Red
      outColor = uvec4(1u);
      return;
   } else if (h > 15.0 && h <= 30.0) {
      // Orange
      outColor = uvec4(2u);
      return;
   } else if (h > 30.0 && h <= 60.0) {
      // Yellow
      outColor = uvec4(3u);
      return;
   } else if (h > 60.0 && h <= 180.0) {
      // Green
      outColor = uvec4(4u);
      return;
   } else if (h > 180.0 && h <= 260.0) {
      // Blue
      outColor = uvec4(5u);
      return;
   } else if (h > 260.0 && h <= 340.0) {
      // Purple
      outColor = uvec4(6u);
      return;
   }
}
