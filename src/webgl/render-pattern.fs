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
    float aaWidth = 0.02; // Anti-aliasing width

    // Create diagonal lines in both directions
    float d1 = fract((p.x + p.y) * 0.707);
    float d2 = fract((p.x - p.y) * 0.707);

    // Calculate anti-aliased black line intensities
    float black1 = 1.0 - smoothstep(lineWidth - aaWidth, lineWidth, d1);
    float black2 = 1.0 - smoothstep(lineWidth - aaWidth, lineWidth, d2);
    float blackLine = max(black1, black2);

    // Calculate anti-aliased white line intensities
    float white1 = smoothstep(lineWidth - aaWidth, lineWidth, d1) -
                   smoothstep(doubleWidth - aaWidth, doubleWidth, d1);
    float white2 = smoothstep(lineWidth - aaWidth, lineWidth, d2) -
                   smoothstep(doubleWidth - aaWidth, doubleWidth, d2);
    float whiteLine = max(white1, white2);

    // Combine black and white lines
    float totalAlpha = max(blackLine, whiteLine);

    // Return transparent if no line
    if (totalAlpha < 0.01) {
        return vec4(0.0);
    }

    // Blend black and white based on their contributions
    vec3 color = mix(vec3(1.0), vec3(0.0), blackLine / totalAlpha);

    return vec4(color, totalAlpha * 0.8);
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
