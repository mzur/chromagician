import DenoiseProgram from './webgl/DenoiseProgram.js';
import DetectColorProgram from './webgl/DetectColorProgram.js';
import WebglHandler from './webgl/Handler.js';
import WhiteBalanceProgram from './webgl/WhiteBalanceProgram.js';
import RenderPatternProgram from './webgl/RenderPatternProgram.js';
// import { FastAverageColor } from 'fast-average-color';

const video = document.createElement('video');
const canvas = document.getElementById("canvas");
const FPS_INTERVAL = 1000 / 10;
const flipY = false;
const colorSwitch = 1;

// TODO
// const fac = new FastAverageColor();
// let whiteBalance

let handler;
let patternProgram;

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
   handler = new WebglHandler({canvas, flipY});
   window.addEventListener('beforeunload', handler.destruct.bind(handler));
   let denoise = new DenoiseProgram(video);
   handler.addProgram(denoise);
   // TODO: Should we use white balance or not? Better algorithm?
   // whiteBalance = new WhiteBalanceProgram(video);
   // handler.addProgram(whiteBalance);
   // whiteBalance.link(denoise);
   let detectProgram = new DetectColorProgram(video);
   handler.addProgram(detectProgram);
   detectProgram.link(denoise);
   patternProgram = new RenderPatternProgram();
   handler.addProgram(patternProgram);
   patternProgram.link(detectProgram);
   patternProgram.linkVideo(denoise);
   patternProgram.setColorSwitch(colorSwitch);
   video.play();

   // Set up color button controls
   setupColorButtons();

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

function setupColorButtons() {
   const buttons = document.querySelectorAll('.color-btn');

   buttons.forEach(button => {
      button.addEventListener('click', () => {
         const colorValue = parseInt(button.dataset.color);

         // Update active state
         buttons.forEach(btn => btn.classList.remove('active'));
         button.classList.add('active');

         // Update pattern program
         patternProgram.setColorSwitch(colorValue);
      });
   });
}
