import Program from './Program.js';
import fragmentShaderSource from './detect-color.fs';
import vertexShaderSource from './rectangle.vs';

export default class DetectColorProgram extends Program {
    constructor(video) {
        super(vertexShaderSource, fragmentShaderSource);
        this.colorMapTexture = null;
        this.inputTexture = null;
        this.video = video;
        // this.alphaScaling = 1.0;
        // this.alphaScalingPointer = null;
    }

    initialize(gl, handler) {
        this.inputTexture = handler.getNewTexture();
        let pointer = this.getPointer();
        handler.useVertexPositions(this);
        handler.useTexturePositions(this);
    }

    beforeRender(gl, handler) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.inputTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.video);
        // gl.activeTexture(gl.TEXTURE1);
        // gl.bindTexture(gl.TEXTURE_2D, this.colorMapTexture);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        // gl.uniform1f(this.alphaScalingPointer, this.alphaScaling);
    }

    afterRender(gl, handler) {
        //
    }

    // link(program) {
    //     this.inputTexture = program.getOutputTexture();
    // }

    // setAlphaScaling(alphaScaling) {
    //     this.alphaScaling = alphaScaling;
    // }
}
