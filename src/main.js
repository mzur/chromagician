import WebglHandler from './webgl/Handler.js';
import DetectColorProgram from './webgl/DetectColorProgram.js';
import DenoiseProgram from './webgl/DenoiseProgram.js';

const video = document.getElementById('video');
const canvas = document.getElementById("canvas");
const FPS_INTERVAL = 1000 / 5;

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

         handler.render();
      }

      requestAnimationFrame(renderLoop);
   };
   renderLoop();
});
