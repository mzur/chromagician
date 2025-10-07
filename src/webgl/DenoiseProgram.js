import Program from './Program.js';
import fragmentShaderSource from './denoise.fs';
import vertexShaderSource from './rectangle.vs';

export default class DenoiseProgram extends Program {
    constructor(video) {
        super(vertexShaderSource, fragmentShaderSource);
        this.inputTexture = null;
        this.framebuffer = null;
        this.outputTexture = null;
        this.video = video;
    }

    initialize(gl, handler) {
        this.inputTexture = handler.getNewTexture();
        let pointer = this.getPointer();
        handler.useVertexPositions(this);
        handler.useTexturePositions(this);

        this.framebuffer = handler.getNewFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        this.outputTexture = handler.getNewTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.outputTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.video.videoWidth, this.video.videoHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.outputTexture, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        const textureSizePointer = gl.getUniformLocation(pointer, 'u_texture_size');
        gl.uniform2f(textureSizePointer, this.video.videoWidth, this.video.videoHeight);
    }

    beforeRender(gl, handler) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.inputTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.video);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    }

    afterRender(gl, handler) {
        //
    }

    getOutputTexture() {
        return this.outputTexture;
    }

    link(program) {
        this.inputTexture = program.getOutputTexture();
    }
}
