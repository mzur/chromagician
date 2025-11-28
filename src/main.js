import DenoiseProgram from './webgl/DenoiseProgram.js';
import DetectColorProgram from './webgl/DetectColorProgram.js';
import WebglHandler from './webgl/Handler.js';
import WhiteBalanceProgram from './webgl/WhiteBalanceProgram.js';
// import { FastAverageColor } from 'fast-average-color';

const video = document.getElementById('video');
const canvas = document.getElementById("canvas");
const FPS_INTERVAL = 1000 / 5;

// TODO
// const fac = new FastAverageColor();
// let whiteBalance

let handler;

navigator.mediaDevices.getUserMedia({video: {
   facingMode: 'environment',
   width: 640,
   height: 480,
}})
.then(stream => {
   const promise = new Promise((resolve) => {
      video.onloadedmetadata = () => resolve(video);
   });
   video.srcObject = stream;
   return promise;
})
.then(video => {
   canvas.width = video.videoWidth;
   canvas.height = video.videoHeight;
   handler = new WebglHandler({canvas});
   window.addEventListener('beforeunload', handler.destruct.bind(handler));
   let denoise = new DenoiseProgram(video);
   handler.addProgram(denoise);
   // TODO: Should we use white balance or not? Better algorithm?
   // whiteBalance = new WhiteBalanceProgram(video);
   // handler.addProgram(whiteBalance);
   // whiteBalance.link(denoise);
   let detectProgram = new DetectColorProgram();
   handler.addProgram(detectProgram);
   detectProgram.link(denoise);
   video.play();
   return video;
})
.then(video => {
   let lastTime = 0;
   const renderLoop = function (currentTime) {
      const deltaTime = currentTime - lastTime;

      if (deltaTime > FPS_INTERVAL) {
         lastTime = currentTime - (deltaTime % FPS_INTERVAL);
         // TODO
         // whiteBalance.setAvgColor(fac.getColor(video).value);

         handler.render();
      }

      requestAnimationFrame(renderLoop);
   };
   renderLoop();
});
