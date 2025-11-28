import Program from './Program.js';
import fragmentShaderSource from './render-pattern.fs';
import vertexShaderSource from './rectangle.vs';

export default class RenderPatternProgram extends Program {
    constructor() {
        super(vertexShaderSource, fragmentShaderSource);
        this.inputTexture = null;
        this.videoTexture = null;
        this.colorSwitch = 0; // 1-6 = show only that color (see fragment shader)
        this.colorSwitchPointer = null;
        this.timePointer = null;
        this.time = 0.0;
    }

    initialize(gl, handler) {
        let pointer = this.getPointer();
        handler.useVertexPositions(this);
        handler.useTexturePositions(this);
        this.colorSwitchPointer = gl.getUniformLocation(pointer, 'u_color_switch');
        this.timePointer = gl.getUniformLocation(pointer, 'u_time');

        // Set up texture unit bindings
        let imageLocation = gl.getUniformLocation(pointer, 'u_image');
        let videoLocation = gl.getUniformLocation(pointer, 'u_video');
        gl.uniform1i(imageLocation, 0); // TEXTURE0
        gl.uniform1i(videoLocation, 1); // TEXTURE1
    }

    beforeRender(gl, handler) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.inputTexture);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.videoTexture);

        gl.uniform1ui(this.colorSwitchPointer, this.colorSwitch);

        // Increment time and loop when pattern cycle completes
        this.time = (this.time + 0.05) % 10.0;

        gl.uniform1f(this.timePointer, this.time);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    afterRender(gl, handler) {
        //
    }

    link(program) {
        this.inputTexture = program.getOutputTexture();
    }

    linkVideo(program) {
        this.videoTexture = program.inputTexture;
    }

    setColorSwitch(colorValue) {
        if (colorValue <= 0 || colorValue > 6) {
            throw new Error('Color switch must be between 1 and 6');
        }

        this.colorSwitch = colorValue;
    }
}
