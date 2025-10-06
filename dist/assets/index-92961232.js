(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const u of o.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&n(u)}).observe(document,{childList:!0,subtree:!0});function t(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(r){if(r.ep)return;r.ep=!0;const o=t(r);fetch(r.href,o)}})();class l{constructor(e,t){this.pointer=null,this.vertexShaderSource=e,this.fragmentShaderSource=t}initialize(e,t){}beforeRender(e,t){}afterRender(e,t){}getPointer(){return this.pointer}setPointer(e){this.pointer=e}getVertexShaderSource(){return this.vertexShaderSource}getFragmentShaderSource(){return this.fragmentShaderSource}}class i extends Error{constructor(e,t,n){e=`WebGL error: ${e}`,super(e,t,n)}}class m{constructor(e){this.canvas_=e.canvas,this.gl_=this.getWebglContext_(this.canvas_,{preserveDrawingBuffer:!0,premultipliedAlpha:!1}),this.programs_=[],this.assets_={buffers:{},framebuffers:{},textures:[]},this.renderPromises_={},this.prepareWebgl_(this.gl_,this.assets_)}handleContextLost_(e){throw e.preventDefault(),new i("The rendering context was lost.")}getWebglContext_(e,t){if(!(e instanceof HTMLCanvasElement))throw new i("The canvas must be a HTMLCanvasElement.");if(!window.WebGLRenderingContext)throw new i("Your browser does not support WebGL.");let n=e.getContext("webgl2",t);if(!n)throw new i("Your browser does not support WebGL 2.");if(!n.getExtension("EXT_color_buffer_float"))throw new i("Your browser does not support the WebGL 2 color buffer float extension.");return e.addEventListener("webglcontextlost",this.handleContextLost_),n}prepareWebgl_(e,t){let n=this.getBuffer("textureCoordinateBuffer"),r=new Float32Array([0,1,1,1,0,0,1,0]);e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,r,e.STATIC_DRAW),n=this.getBuffer("vertexCoordinateBuffer"),r=new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.bindBuffer(e.ARRAY_BUFFER,n),e.bufferData(e.ARRAY_BUFFER,r,e.STATIC_DRAW)}compileShader_(e,t,n){if(e.shaderSource(t,n),e.compileShader(t),!e.getShaderParameter(t,e.COMPILE_STATUS)||e.isContextLost())throw new i(e.getShaderInfoLog(t));return t}createVertexShader_(e,t){return this.compileShader_(e,e.createShader(e.VERTEX_SHADER),t)}createFragmentShader_(e,t){return this.compileShader_(e,e.createShader(e.FRAGMENT_SHADER),t)}createShaderProgram_(e,t,n){let r=e.createProgram();if(e.attachShader(r,t),e.attachShader(r,n),e.linkProgram(r),!e.getProgramParameter(r,e.LINK_STATUS)||e.isContextLost())throw new i(e.getProgramInfoLog(r));return r}addTexture_(e){let t=e.createTexture();return e.bindTexture(e.TEXTURE_2D,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),t}usePositions_(e,t,n,r){if(!(t instanceof WebGLProgram))throw new i("The program must be a WebGLProgram");let o=e.getAttribLocation(t,n);e.enableVertexAttribArray(o),e.bindBuffer(e.ARRAY_BUFFER,r),e.vertexAttribPointer(o,2,e.FLOAT,!1,0,0)}renderSync_(e,t){t.forEach(n=>{e.useProgram(n.getPointer()),n.beforeRender(e,this),e.drawArrays(e.TRIANGLE_STRIP,0,4),n.afterRender(e,this)})}destruct_(e,t,n,r){Object.keys(t.buffers).forEach(function(o){e.deleteBuffer(t.buffers[o])}),Object.keys(t.framebuffers).forEach(function(o){e.deleteFramebuffer(t.framebuffers[o])}),t.textures.forEach(function(o){e.deleteTexture(o)}),n.forEach(function(o){e.getAttachedShaders(o.getPointer()).forEach(function(_){e.deleteShader(_)}),e.deleteProgram(o.getPointer())}),r.removeEventListener("webglcontextlost",this.handleContextLost)}createFramebuffer_(e){return e.createFramebuffer()}getFramebuffer(e){return this.assets_.framebuffers[e]||(this.assets_.framebuffers[e]=this.createFramebuffer_(this.gl_)),this.assets_.framebuffers[e]}createBuffer_(e){return e.createBuffer()}getBuffer(e){return this.assets_.buffers[e]||(this.assets_.buffers[e]=this.createBuffer_(this.gl_)),this.assets_.buffers[e]}getTexture(e){return this.assets_.textures[e]}getNewTexture(){const e=this.addTexture_(this.gl_);return this.assets_.textures.push(e),e}useVertexPositions(e){this.usePositions_(this.gl_,e.getPointer(),"a_vertex_position",this.getBuffer("vertexCoordinateBuffer"))}useTexturePositions(e){this.usePositions_(this.gl_,e.getPointer(),"a_texture_position",this.getBuffer("textureCoordinateBuffer"))}addProgram_(e,t){if(!(t instanceof l))throw new i("A program must be a Program");try{let r=this.createVertexShader_(e,t.getVertexShaderSource()),o=this.createFragmentShader_(e,t.getFragmentShaderSource());var n=this.createShaderProgram_(e,r,o)}catch(r){throw new i(`Error compiling program ${t.constructor.name}. ${r}`)}return e.useProgram(n),t.setPointer(n),t.initialize(e,this),e.useProgram(null),t}addProgram(e){this.programs_.push(this.addProgram_(this.gl_,e))}render(e){this.renderSync_(this.gl_,e||[])}destruct(){this.destruct_(this.gl_,this.assets_,this.programs_,this.canvas_)}getCanvas(){return this.canvas_}getGl(){return this.gl_}}const v=`#version 300 es

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
`,x=`#version 300 es

precision mediump float;

in vec2 a_vertex_position;
in vec2 a_texture_position;

out vec2 v_texture_position;

void main() {
    gl_Position = vec4(a_vertex_position, 0, 1);
    v_texture_position = a_texture_position;
}
`;class b extends l{constructor(e){super(x,v),this.colorMapTexture=null,this.inputTexture=null,this.video=e}initialize(e,t){this.inputTexture=t.getNewTexture(),this.getPointer(),t.useVertexPositions(this),t.useTexturePositions(this)}beforeRender(e,t){e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,this.inputTexture),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,this.video),e.bindFramebuffer(e.FRAMEBUFFER,null)}afterRender(e,t){}}const c=document.getElementById("video"),h=document.getElementById("canvas"),d=1e3/15;let a,f;navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:640,height:480}}).then(s=>{const e=new Promise(t=>{c.onloadedmetadata=()=>t(c)});return c.srcObject=s,e}).then(s=>(h.width=s.videoWidth,h.height=s.videoHeight,a=new m({canvas:h}),window.addEventListener("beforeunload",a.destruct.bind(a)),f=new b(s),a.addProgram(f),s.play(),s)).then(s=>{let e=0;const t=function(n){const r=n-e;r>d&&(e=n-r%d,a.render([f])),requestAnimationFrame(t)};t()});
