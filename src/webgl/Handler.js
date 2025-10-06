import Program from './Program.js';

let TEXTURE_PREFIX = 'texture_';

class WebglError extends Error {
    constructor(message, fileName, lineNumber) {
        message = `WebGL error: ${message}`;
        super(message, fileName, lineNumber);
    }
}

// Adapted from https://github.com/BiodataMiningGroup/IFeaLiD
export default class Handler {
    constructor(options) {
        this.canvas_ = options.canvas;
        this.gl_ = this.getWebglContext_(this.canvas_, {
            preserveDrawingBuffer: true,
            premultipliedAlpha: false,
        });

        this.programs_ = [];

        this.assets_ = {
            buffers: {},
            framebuffers: {},
            textures: [],
        };

        this.renderPromises_ = {};

        this.prepareWebgl_(this.gl_, this.assets_);
    }

    handleContextLost_(event) {
        event.preventDefault();
        throw new WebglError('The rendering context was lost.');
    }

    getWebglContext_(canvas, attributes) {
        if (!(canvas instanceof HTMLCanvasElement)) {
            throw new WebglError('The canvas must be a HTMLCanvasElement.');
        }

        if (!window.WebGLRenderingContext) {
            throw new WebglError('Your browser does not support WebGL.');
        }

        let gl = canvas.getContext('webgl2', attributes);

        if (!gl) {
            throw new WebglError('Your browser does not support WebGL 2.');
        }

        let ext = gl.getExtension("EXT_color_buffer_float");

        if (!ext) {
            throw new WebglError('Your browser does not support the WebGL 2 color buffer float extension.');
        }

        canvas.addEventListener('webglcontextlost', this.handleContextLost_);

        return gl;
    }

    prepareWebgl_(gl, assets) {
        // We only draw a simple rectangular canvas that consists of two triangles.
        let buffer = this.getBuffer('textureCoordinateBuffer');
        let array = new Float32Array([0, 1, 1, 1, 0, 0, 1, 0]);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);

        buffer = this.getBuffer('vertexCoordinateBuffer');
        array = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
    }

    compileShader_(gl, shader, source) {
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS) || gl.isContextLost()) {
            throw new WebglError(gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    createVertexShader_(gl, source) {
        return this.compileShader_(gl, gl.createShader(gl.VERTEX_SHADER), source);
    }

    createFragmentShader_(gl, source) {
        return this.compileShader_(gl, gl.createShader(gl.FRAGMENT_SHADER), source);
    }

    createShaderProgram_(gl, vertexShader, fragmentShader) {
        let program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS) || gl.isContextLost()) {
            throw new WebglError(gl.getProgramInfoLog(program));
        }

        return program;
    }

    addTexture_(gl) {
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set the parameters so images that are NPOT (not power of two) can be
        // rendered, too. Do this every time anew because external shader setUp methods
        // may change this.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // Disable texture filtering.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        return texture;
    }

    usePositions_(gl, program, name, buffer) {
        if (!(program instanceof WebGLProgram)) {
            throw new WebglError('The program must be a WebGLProgram');
        }

        let location = gl.getAttribLocation(program, name);
        gl.enableVertexAttribArray(location);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
    }

    renderSync_(gl, programs) {
        programs.forEach((program) => {
            gl.useProgram(program.getPointer());
            // let date = Date.now();
            program.beforeRender(gl, this);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            program.afterRender(gl, this);
            // console.log(program.constructor.name, Date.now() - date);
        });
    }

    destruct_(gl, assets, programs, canvas) {
        Object.keys(assets.buffers).forEach(function (key) {
            gl.deleteBuffer(assets.buffers[key]);
        });

        Object.keys(assets.framebuffers).forEach(function (key) {
            gl.deleteFramebuffer(assets.framebuffers[key]);
        });

        assets.textures.forEach(function (texture) {
            gl.deleteTexture(texture);
        });

        programs.forEach(function (program) {
            let shaders = gl.getAttachedShaders(program.getPointer());
            shaders.forEach(function (shader) {
                gl.deleteShader(shader);
            });
            gl.deleteProgram(program.getPointer());
        });

        canvas.removeEventListener('webglcontextlost', this.handleContextLost);
    }

    createFramebuffer_(gl) {
        return gl.createFramebuffer();
    }

    getFramebuffer(id) {
        if (!this.assets_.framebuffers[id]) {
            this.assets_.framebuffers[id] = this.createFramebuffer_(this.gl_);
        }

        return this.assets_.framebuffers[id];
    }

    createBuffer_(gl) {
        return gl.createBuffer();
    }

    getBuffer(id) {
        if (!this.assets_.buffers[id]) {
            this.assets_.buffers[id] = this.createBuffer_(this.gl_);
        }

        return this.assets_.buffers[id];
    }

    getTexture(index) {
        return this.assets_.textures[index];
    }

    getNewTexture() {
        const texture = this.addTexture_(this.gl_);

        this.assets_.textures.push(texture);

        return texture;
    }

    useVertexPositions(program) {
        this.usePositions_(this.gl_, program.getPointer(), 'a_vertex_position', this.getBuffer('vertexCoordinateBuffer'));
    }

    useTexturePositions(program) {
        this.usePositions_(this.gl_, program.getPointer(), 'a_texture_position', this.getBuffer('textureCoordinateBuffer'));
    }

    addProgram_(gl, program) {
        if (!(program instanceof Program)) {
            throw new WebglError('A program must be a Program');
        }

        try {
            let vertexShader = this.createVertexShader_(gl, program.getVertexShaderSource());
            let fragmentShader = this.createFragmentShader_(gl, program.getFragmentShaderSource());
            var programPointer = this.createShaderProgram_(gl, vertexShader, fragmentShader);
        } catch (e) {
            throw new WebglError(`Error compiling program ${program.constructor.name}. ${e}`);
        }

        gl.useProgram(programPointer);
        program.setPointer(programPointer);
        program.initialize(gl, this);
        gl.useProgram(null);

        return program;
    }

    addProgram(program) {
        this.programs_.push(this.addProgram_(this.gl_, program));
    }

    render(programs) {
        this.renderSync_(this.gl_, programs || []);
    }

    destruct() {
        this.destruct_(this.gl_, this.assets_, this.programs_, this.canvas_);
    }

    getCanvas() {
        return this.canvas_;
    }

    getGl() {
        return this.gl_;
    }
}
