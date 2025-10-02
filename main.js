const vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;
in vec2 a_texCoord;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

// Used to pass the texture coordinates to the fragment shader
out vec2 v_texCoord;

// all shaders have a main function
void main() {
   // convert the position from pixels to 0.0 to 1.0
   vec2 zeroToOne = a_position / u_resolution;

   // convert from 0->1 to 0->2
   vec2 zeroToTwo = zeroToOne * 2.0;

   // convert from 0->2 to -1->+1 (clipspace)
   vec2 clipSpace = zeroToTwo - 1.0;

   gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

   // pass the texCoord to the fragment shader
   // The GPU will interpolate this value between points.
   v_texCoord = a_texCoord;
}
`;

const fragmentShaderSource = `#version 300 es

// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;

// our texture
uniform sampler2D u_image;

// the texCoords passed in from the vertex shader.
in vec2 v_texCoord;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
   vec3 color = texture(u_image, v_texCoord).rgb;
   // vec2 onePixel = vec2(1) / vec2(textureSize(u_image, 0));

   // // average the left, middle, and right pixels.
   // vec4 color = (
   //    texture(u_image, v_texCoord) +
   //    texture(u_image, v_texCoord + vec2( onePixel.x, 0.0)) +
   //    texture(u_image, v_texCoord + vec2(-onePixel.x, 0.0))) / 3.0;

   float v = max(color.r, max(color.g, color.b));
   if (v < 0.25) {
      outColor = vec4(0.0, 0.0, 0.0, 1.0);
      return;
   } else if (v > 0.75) {
      outColor = vec4(1.0, 1.0, 1.0, 1.0);
      return;
   }
   float c = v - min(color.r, min(color.g, color.b));
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

   vec3 hsv = vec3(60.0 * h, c / v, v);
    h = hsv.r;

   if (h <= 15.0 || h > 340.0) {
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
`;

const initWebGL = function (canvas, vertexShaderSource, fragmentShaderSource) {
   const gl = canvas.getContext("webgl2");
   if (!gl) {
      return;
   }

   // setup GLSL program
   const program = webglUtils.createProgramFromSources(gl,
     [vertexShaderSource, fragmentShaderSource]);

   // look up where the vertex data needs to go.
   const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
   const texCoordAttributeLocation = gl.getAttribLocation(program, "a_texCoord");

   // lookup uniforms
   const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
   const imageLocation = gl.getUniformLocation(program, "u_image");

   // Create a vertex array object (attribute state)
   const vao = gl.createVertexArray();

   // and make it the one we're currently working with
   gl.bindVertexArray(vao);

   // Create a buffer and put a single pixel space rectangle in
   // it (2 triangles)
   const positionBuffer = gl.createBuffer();

   // Turn on the attribute
   gl.enableVertexAttribArray(positionAttributeLocation);

   // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
   gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

   // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
   const size = 2;          // 2 components per iteration
   const type = gl.FLOAT;   // the data is 32bit floats
   const normalize = false; // don't normalize the data
   const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
   const offset = 0;        // start at the beginning of the buffer
   gl.vertexAttribPointer(
     positionAttributeLocation, size, type, normalize, stride, offset);

   // provide texture coordinates for the rectangle.
   const texCoordBuffer = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     0.0,  0.0,
     1.0,  0.0,
     0.0,  1.0,
     0.0,  1.0,
     1.0,  0.0,
     1.0,  1.0,
   ]), gl.STATIC_DRAW);

   // Turn on the attribute
   gl.enableVertexAttribArray(texCoordAttributeLocation);

   // Tell the attribute how to get data out of texCoordBuffer (ARRAY_BUFFER)
   gl.vertexAttribPointer(
     texCoordAttributeLocation, size, type, normalize, stride, offset);

   // Create a texture.
   const texture = gl.createTexture();

   // make unit 0 the active texture uint
   // (ie, the unit all other texture commands will affect
   gl.activeTexture(gl.TEXTURE0 + 0);

   // Bind it to texture unit 0' 2D bind point
   gl.bindTexture(gl.TEXTURE_2D, texture);

   // Set the parameters so we don't need mips and so we're not filtering
   // and we don't repeat at the edges
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

   webglUtils.resizeCanvasToDisplaySize(gl.canvas);

   // Tell WebGL how to convert from clip space to pixels
   gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

   // Clear the canvas
   gl.clearColor(0, 0, 0, 0);
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   // Tell it to use our program (pair of shaders)
   gl.useProgram(program);

   // Bind the attribute/buffer set we want.
   gl.bindVertexArray(vao);

   // Pass in the canvas resolution so we can convert from
   // pixels to clipspace in the shader
   gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

   // Tell the shader to get the texture from texture unit 0
   gl.uniform1i(imageLocation, 0);

   // Bind the position buffer so gl.bufferData that will be called
   // in setRectangle puts data in the position buffer
   gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

   // Set a rectangle the same size as the image.
   const x1 = 0;
   const x2 = canvas.width;
   const y1 = 0;
   const y2 = canvas.height;
   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2,
   ]), gl.STATIC_DRAW);

   return gl;
};

const video = document.getElementById('video');
const canvas = document.getElementById("canvas");
let gl;
const FPS_INTERVAL = 1000 / 15;

navigator.mediaDevices.getUserMedia({video: {
   facingMode: 'environment',
   width: 640,
   height: 480,
}})
.then(stream => {
   const promise = new Promise((resolve) => {
      video.onloadedmetadata = () => resolve(video);
   });
   video.srcObject = stream;
   return promise;
})
.then(video => {
   canvas.width = video.videoWidth;
   canvas.height = video.videoHeight;
   gl = initWebGL(canvas, vertexShaderSource, fragmentShaderSource);
   video.play();
   return video;
})
.then(video => {
   let lastTime = 0;
   const renderLoop = function (currentTime) {
      const deltaTime = currentTime - lastTime;

      if (deltaTime > FPS_INTERVAL) {
         lastTime = currentTime - (deltaTime % FPS_INTERVAL);

         gl.texImage2D(gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            video);

         gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      requestAnimationFrame(renderLoop);
   };
   renderLoop();
});
