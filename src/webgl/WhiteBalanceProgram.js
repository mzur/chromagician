import Program from './Program.js';
import fragmentShaderSource from './white-balance.fs';
import vertexShaderSource from './rectangle.vs';

export default class WhiteBalanceProgram extends Program {
    constructor(video) {
        super(vertexShaderSource, fragmentShaderSource);
        this.inputTexture = null;
        this.framebuffer = null;
        this.outputTexture = null;
        this.avgColor = [0, 0, 0];
        this.avgColorPointer = null;
        this.globalAvg = 0;
        this.globalAvgPointer = null;
        this.video = video;
    }

    initialize(gl, handler) {
        this.inputTexture = handler.getNewTexture();
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

        let pointer = this.getPointer();
        this.avgColorPointer = gl.getUniformLocation(pointer, 'u_avg_color');
        gl.uniform3f(this.avgColorPointer, 0, 0, 0);
        this.globalAvgPointer = gl.getUniformLocation(pointer, 'u_global_avg');
        gl.uniform1f(this.globalAvgPointer, 0);
    }

    beforeRender(gl, handler) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.inputTexture);
        // gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.uniform3f(this.avgColorPointer, ...this.avgColor);
        gl.uniform1f(this.globalAvgPointer, this.globalAvg);
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

    setAvgColor(avg) {
        this.avgColor = avg.slice(0, 3);
        this.globalAvg = (avg[0] + avg[1] + avg[2]) / 3;
    }
}
