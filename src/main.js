import DenoiseProgram from './webgl/DenoiseProgram.js';
import DetectColorProgram from './webgl/DetectColorProgram.js';
import WebglHandler from './webgl/Handler.js';
import RenderPatternProgram from './webgl/RenderPatternProgram.js';

const video = document.createElement('video');
const canvas = document.getElementById("canvas");
const FPS_INTERVAL = 1000 / 10;
const flipY = false;
const colorSwitch = 1;

let handler;
let patternProgram;

// Calculate camera resolution matching screen aspect ratio
function getCameraConstraints() {
   const screenWidth = window.innerWidth;
   const screenHeight = window.innerHeight;
   const aspectRatio = screenWidth / screenHeight;

   // Target around 640x480 pixels (307,200 total)
   const targetPixels = 307200;

   // Calculate dimensions maintaining aspect ratio
   const height = Math.round(Math.sqrt(targetPixels / aspectRatio));
   const width = Math.round(height * aspectRatio);

   return {
      facingMode: 'environment',
      aspectRatio: { ideal: aspectRatio },
      width: { ideal: width },
      height: { ideal: height },
      whiteBalanceMode: 'continuous',
   };
}

const cameraConstraints = getCameraConstraints();

navigator.mediaDevices.getUserMedia({video: cameraConstraints})
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
   let detectProgram = new DetectColorProgram(video);
   handler.addProgram(detectProgram);
   detectProgram.link(denoise);
   patternProgram = new RenderPatternProgram(video);
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
