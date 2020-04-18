const video = document.querySelector('#video');
const emojiEl = document.querySelector('.emoji');
let faceExpression = [
  { expression: 'neutral', certainty: 0, emoji: '😐' },
  { expression: 'sad', certainty: 0, emoji: '😔' },
  { expression: 'fearful', certainty: 0, emoji: '😱' },
  { expression: 'happy', certainty: 0, emoji: '😊' },
  { expression: 'disgusted', certainty: 0, emoji: '🤢' },
  { expression: 'surprised', certainty: 0, emoji: '😲' },
  { expression: 'angry', certainty: 0, emoji: '😡' }
];

let expressionDetected = {};
let iMax = 0;

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => (video.srcObject = stream),
    err => console.error(err)
  );
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    // faceapi.draw.drawDetections(canvas, resizedDetections);
    // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    // faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    if (detections && detections[0] && detections[0].expressions.neutral) {
      expressionDetected = detections[0].expressions;
      iMax = 0;
      for (let i = 0; i < faceExpression.length; i++) {
        const expression = faceExpression[i].expression;
        faceExpression[i].certainty = expressionDetected[expression];
        if (faceExpression[iMax].certainty < expressionDetected[expression]) {
          iMax = i;
        }
      }
    }
    emojiEl.innerHTML = faceExpression[iMax].emoji;
  }, 100);
});
