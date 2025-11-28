import Program from './Program.js';
import fragmentShaderSource from './render-pattern.fs';
import vertexShaderSource from './rectangle.vs';

export default class RenderPatternProgram extends Program {
    constructor(video) {
        super(vertexShaderSource, fragmentShaderSource);
        this.inputTexture = null;
        this.video = video;
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
