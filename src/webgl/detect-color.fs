#version 300 es

precision highp float;

// our texture
uniform sampler2D u_image;

// the texCoords passed in from the vertex shader.
in vec2 v_texture_position;

// we need to declare an output for the fragment shader
out vec4 outColor;

// TODO move to other shader
vec3 whiteBalance(in vec3 color) {
   float avgColor = (color.r + color.g + color.b) / 3.0;

    // Calculate scale factors
    vec3 scale = avgColor / color;

    // Apply scale factor to balance the color
    vec3 balancedColor = color * scale;

    // Clamp to ensure we stay in the 0.0 - 1.0 range
    return clamp(balancedColor, 0.0, 1.0);
}

// TODO move to other shader
vec3 makePattern() {
   // TODO: Get width and height.
   vec2 q = v_texture_position * vec2(480., 640.);
   vec2 d = vec2(3.);
   vec2 r = mod(q, d);
   float g = mod( r.x + r.y, 2.0 );
   return vec3(g);
}

void main() {
   vec3 color = texture(u_image, v_texture_position).rgb;
   // color = whiteBalance(color);
   // outColor = vec4(color, 1.0);
   // return;

   float v = max(color.r, max(color.g, color.b));
   if (v < 0.05) {
      outColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
   } else if (v > 0.95) {
      outColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
   }
   float c = v - min(color.r, min(color.g, color.b));
   float s = c / v;

   if (s < 0.15) {
      outColor = vec4(0.0, 0.0, 0.0, 1.0);
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
      // outColor = vec4(makePattern(), 1.0);
      // return;

      outColor = vec4(1.0, 0.0, 0.0, 1.0);
      return;
   } else if (h > 15.0 && h <= 30.0) {
      outColor = vec4(1.0, 0.5, 0.0, 1.0);
      return;
   } else if (h > 30.0 && h <= 60.0) {
      outColor = vec4(1.0, 1.0, 0.0, 1.0);
      return;
   } else if (h > 60.0 && h <= 180.0) {
      outColor = vec4(0.0, 1.0, 0.0, 1.0);
      return;
   } else if (h > 180.0 && h <= 260.0) {
      outColor = vec4(0.0, 0.0, 1.0, 1.0);
      return;
   } else if (h > 260.0 && h <= 340.0) {
      outColor = vec4(1.0, 0.0, 1.0, 1.0);
      return;
   }
}
