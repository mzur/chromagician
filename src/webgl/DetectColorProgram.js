import Program from './Program.js';
import fragmentShaderSource from './detect-color.fs';
import vertexShaderSource from './rectangle.vs';

export default class DetectColorProgram extends Program {
    constructor(video) {
        super(vertexShaderSource, fragmentShaderSource);
        this.inputTexture = null;
        this.framebuffer = null;
        this.outputTexture = null;
        this.video = video;
    }

    initialize(gl, handler) {
        let pointer = this.getPointer();
        handler.useVertexPositions(this);
        handler.useTexturePositions(this);

        this.framebuffer = handler.getNewFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        this.outputTexture = handler.getNewTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.outputTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8UI, this.video.videoWidth, this.video.videoHeight, 0, gl.RED_INTEGER, gl.UNSIGNED_BYTE, null);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.outputTexture, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    beforeRender(gl, handler) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.inputTexture);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    }

    afterRender(gl, handler) {
        //
    }

    link(program) {
        this.inputTexture = program.getOutputTexture();
    }

    getOutputTexture() {
        return this.outputTexture;
    }
}
