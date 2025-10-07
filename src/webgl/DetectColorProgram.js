import Program from './Program.js';
import fragmentShaderSource from './detect-color.fs';
import vertexShaderSource from './rectangle.vs';

export default class DetectColorProgram extends Program {
    constructor() {
        super(vertexShaderSource, fragmentShaderSource);
        this.inputTexture = null;
    }

    initialize(gl, handler) {
        let pointer = this.getPointer();
        handler.useVertexPositions(this);
        handler.useTexturePositions(this);
    }

    beforeRender(gl, handler) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.inputTexture);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    afterRender(gl, handler) {
        //
    }

    link(program) {
        this.inputTexture = program.getOutputTexture();
    }
}
