import Program from './Program.js';
import fragmentShaderSource from './render-pattern.fs';
import vertexShaderSource from './rectangle.vs';

export default class RenderPatternProgram extends Program {
    constructor(video) {
        super(vertexShaderSource, fragmentShaderSource);
        this.inputTexture = null;
        this.video = video;
        this.colorSwitch = 0; // 0 = show all, 1-6 = show only that color
        this.colorSwitchPointer = null;
    }

    initialize(gl, handler) {
        let pointer = this.getPointer();
        handler.useVertexPositions(this);
        handler.useTexturePositions(this);
        this.colorSwitchPointer = gl.getUniformLocation(pointer, 'u_color_switch');
    }

    beforeRender(gl, handler) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.inputTexture);
        gl.uniform1ui(this.colorSwitchPointer, this.colorSwitch);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    afterRender(gl, handler) {
        //
    }

    link(program) {
        this.inputTexture = program.getOutputTexture();
    }

    setColorSwitch(colorValue) {
        if (colorValue <= 0 || colorValue > 6) {
            throw new Error('Color switch must be between 1 and 6');
        }

        this.colorSwitch = colorValue;
    }
}
