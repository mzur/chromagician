#version 300 es

// Color mapping for u_image texture:
// 0 = Black (undetected/background)
// 1 = Red
// 2 = Orange
// 3 = Yellow
// 4 = Green
// 5 = Blue
// 6 = Purple

precision highp float;
precision lowp usampler2D;
precision mediump sampler2D;

uniform usampler2D u_image;
uniform sampler2D u_video;
uniform uint u_color_switch;
uniform float u_time;
uniform float u_aspect_ratio;
in vec2 v_texture_position;
out vec4 outColor;

// Generate animated crosshatch pattern.
vec4 getCrosshatchPattern(vec2 pos, float time, float aspectRatio) {
    // Correct for aspect ratio to make pattern uniform
    vec2 corrected = pos;
    corrected.x *= aspectRatio;

    // Rotate around center of texture
    vec2 center = vec2(aspectRatio * 0.5, 0.5);
    vec2 centered = corrected - center;

    // Rotation angle based on time
    float angle = time * 0.3;
    float c = cos(angle);
    float s = sin(angle);

    // Apply rotation matrix
    vec2 rotated = vec2(
        centered.x * c - centered.y * s,
        centered.x * s + centered.y * c
    ) + center;

    // Scale position to control pattern density
    vec2 p = rotated * 40.0;

    float lineWidth = 0.15;
    float doubleWidth = lineWidth * 2.0;

    // Create diagonal lines in both directions
    float d1 = fract((p.x + p.y) * 0.707);
    float d2 = fract((p.x - p.y) * 0.707);

    // Check if we're in a line zone for either diagonal
    bool inD1 = d1 < doubleWidth;
    bool inD2 = d2 < doubleWidth;

    // Return transparent if not in any line zone
    if (!inD1 && !inD2) {
        return vec4(0.0);
    }

    // Determine color based on position within line
    vec3 color = vec3(1.0); // Default to white

    if ((inD1 && d1 < lineWidth) || (inD2 && d2 < lineWidth)) {
        color = vec3(0.0); // Black line
    }

    return vec4(color, 0.8); // Semi-transparent overlay
}

void main() {
   uint color = texture(u_image, v_texture_position).r;
   vec4 videoColor = texture(u_video, v_texture_position);

   // If color doesn't match the switch, render the video.
   if (color != u_color_switch) {
      outColor = videoColor;
      return;
   }

   // For matching color, overlay animated crosshatch pattern on video
   vec4 pattern = getCrosshatchPattern(v_texture_position, u_time, u_aspect_ratio);

   // Blend pattern with video using alpha
   outColor = mix(videoColor, pattern, pattern.a);
}
