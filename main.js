const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const canvasCtx = canvas.getContext('2d');

navigator.mediaDevices.getUserMedia({ video: true })
.then(function(stream){
    video.srcObject = stream;
})
.catch(function(err){
    console.log(err);
});

function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  canvasCtx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
  
  // Fach Mesh
  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {color: '#C0C0C070', lineWidth: 1});
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {color: '#C0C0C070'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {color: '#C0C0C070'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {color: '#C0C0C070'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {color: '#C0C0C070'});
      drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {color: '#E0E0E0', lineWidth: 0.5});
      drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {color: '#E0E0E0'});
    }
  }

  if (results.multiFaceLandmarks) {
    for (const landmarks of results.multiFaceLandmarks) {
      drawFigure(landmarks);
    }
  }
  canvasCtx.restore();
}

function drawFigure(landmarks) {
  const jaw = [136, 150, 149, 176, 148, 152, 377, 400, 378, 379, 365];
  fillColor(jaw, landmarks);

  const leftCheek = [143, 101, 214, 147, 143]
  fillColor(leftCheek, landmarks);

  const rightCheek = [372, 330, 434, 376, 372]
  fillColor(rightCheek, landmarks);
  
  const philtrum = [186,92,165,167,164,393,391,322,410]
  fillColor(philtrum, landmarks);
  
}

function fillColor(part, landmarks) {
  canvasCtx.beginPath();
  for (let i = 0; i < part.length; i++) {
    const index = part[i];
    const x = landmarks[index].x * canvas.width;
    const y = landmarks[index].y * canvas.height;
    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }
  }
  canvasCtx.closePath();
  canvasCtx.fillStyle = 'rgba(0, 0, 255, 0.6)';
  canvasCtx.fill();
}

const faceMesh = new FaceMesh({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
}});
faceMesh.setOptions({
  maxNumFaces: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
faceMesh.onResults(onResults);

const camera = new Camera(video, {
  onFrame: async () => {
    await faceMesh.send({image: video});
  },
  width: 1280,
  height: 720
});
camera.start();

