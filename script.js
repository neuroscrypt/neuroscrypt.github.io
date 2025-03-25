const body = document.getElementsByTagName('body')[0];
const imageUpload = document.getElementById('image-upload');
const imageUploadContainer = document.getElementById('input-field-wrapper');
const loadingContainer = document.getElementById('loading-container');
const imageContainer = document.getElementById('image-container');
const canvasContainer = document.getElementById('canvas-container');
const resultContainer = document.getElementById('result-container');
const emotionResultContainer = document.getElementById('emotion-result-container');
// const landmarksContainer = document.getElementById('landmarks-container')
// const landmarksCanvas = document.getElementById('landmarks-canvas')
const faceCount = document.getElementById('face-count');
const windowWidth = window.innerWidth;
const windowHeight = window.innerHeight;
const modelsDirectory = 'https://assets.codepen.io/1290466/';
const defaultImageName = 'face-example.jpg';
const highlightColor = '#91e4c6';
// const highlightColor = '#f9f87b';
// const highlightColor = '#6ec574';
let loadNextFaceButton = null;
let detectionLength = 0;

window.onload = async () => {
  await Promise.all([
  faceapi.loadTinyFaceDetectorModel(modelsDirectory),
  faceapi.loadFaceLandmarkTinyModel(modelsDirectory),
  faceapi.loadFaceRecognitionModel(modelsDirectory),
  faceapi.loadFaceExpressionModel(modelsDirectory),
  faceapi.loadAgeGenderModel(modelsDirectory)]).
  then(start);

  const processFaceDetection = async file => {
    const image = await faceapi.bufferToImage(checkFileType(file));

    imageContainer.innerHTML = '';
    canvasContainer.innerHTML = '';
    faceCount.innerHTML = '';
    resultContainer.innerHTML = '';
    emotionResultContainer.innerHTML = '';
    // landmarksContainer.classList.remove('reveal')

    const canvas = faceapi.createCanvasFromMedia(image);
    canvas.setAttribute('id', 'canvas-element');

    canvasContainer.append(canvas);
    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(canvas, displaySize);

    const options = new faceapi.TinyFaceDetectorOptions();
    const useTinyModel = true;
    const detections = await faceapi.detectAllFaces(image, options).
    withFaceLandmarks(useTinyModel).
    withFaceExpressions().
    withAgeAndGender();

    if (detections && detections[0]) {
      detectionLength = detections.length;
      let faceIndex = 0;

      loadNextFaceButton = () => {
        if (faceIndex < detectionLength - 1) {
          faceIndex += 1;
        } else {
          faceIndex = 0;
        }

        // landmarksContainer.classList.remove('reveal')
        resultContainer.innerHTML = '';
        emotionResultContainer.innerHTML = '';
        drawView(faceIndex, detections, canvas, image);
      };

      // Animate Mouse Event
        body.addEventListener('mousemove', function (event) {
        const xAxis = (windowWidth / 2 - event.pageX) / 60;
        const yAxis = (windowHeight / 2 - event.pageY) / 60;

        canvasContainer.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg) translateZ(25px)`;
        resultContainer.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg) translateZ(25px)`;
        emotionResultContainer.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg) translateZ(25px)`;
        imageContainer.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        // landmarksContainer.style.transform = `rotateY(${xAxis/2}deg) rotateX(${yAxis/2}deg)`
      });

      if (detectionLength > 1) {
        imageUploadContainer.style.display = 'block';
        loadingContainer.style.display = 'none';
      }

      faceCount.append(`${detectionLength} лиц ${detectionLength > 1 ? 'а' : 'о'} обнаружено`);

      imageContainer.append(image);

      particlesJS('particles-js', particlesConfig);

      drawView(faceIndex, detections, canvas, image);
    } else {
      faceCount.append('Лиц Нет');
      // console.log('No reliable facial landmarks detected in this photograph. Make sure faces are clear and front-facing!')
      imageUploadContainer.style.display = 'block';
    }
  };

  function start() {
    imageUpload.addEventListener('change', async event => {
      const file = event.currentTarget.files[0];
      processFaceDetection(file);
    });

    fetch(`${modelsDirectory}${defaultImageName}`).
    then(res => res.blob()).
    then(file => processFaceDetection(file));
  }

};

const checkFileType = function (file) {
  const imageType = /image.*/;

  if (!file || file && !file.type.match(imageType)) {
    throw 'File is not an image';
  }

  return file;
};

const drawBox = function (box) {
  const lineSizeRatio = 8;
  const lineWidth = 3;
  const c = document.getElementById('canvas-element');
  const ctx = c.getContext('2d');

  ctx.clearRect(0, 0, 10000, 10000);
  ctx.strokeStyle = highlightColor;
  ctx.lineWidth = lineWidth;

  ctx.beginPath();
  ctx.moveTo(box.left + lineWidth / 2, box.top);
  ctx.lineTo(box.left + lineWidth / 2, box.top + box.height / lineSizeRatio);
  ctx.moveTo(box.left + lineWidth / 2, box.bottom);
  ctx.lineTo(box.left + lineWidth / 2, box.bottom - box.height / lineSizeRatio);
  ctx.moveTo(box.left, box.bottom);
  ctx.lineTo(box.left + box.width / lineSizeRatio, box.bottom);
  ctx.moveTo(box.right, box.bottom);
  ctx.lineTo(box.right - box.width / lineSizeRatio, box.bottom);
  ctx.moveTo(box.right - lineWidth / 2, box.bottom);
  ctx.lineTo(box.right - lineWidth / 2, box.bottom - box.height / lineSizeRatio);
  ctx.moveTo(box.right - lineWidth / 2, box.top);
  ctx.lineTo(box.right - lineWidth / 2, box.top + box.height / lineSizeRatio);
  ctx.moveTo(box.right, box.top);
  ctx.lineTo(box.right - box.width / lineSizeRatio, box.top);
  ctx.moveTo(box.left, box.top);
  ctx.lineTo(box.left + box.width / lineSizeRatio, box.top);
  ctx.stroke();

// ctx.strokeRect(box.left, box.top, box.width, box.height)

};

// const drawLandmarks = function (points, boxHeight) {
//   const size = 16 * (boxHeight / 1000)
//   const pointSize = (size < 2) ? 2 : (size > 16) ? 16 : Math.trunc(size)
//   const ctx = landmarksCanvas.getContext('2d')

//   ctx.clearRect(0, 0, 10000, 10000)
//   ctx.strokeStyle = '#ffffff'
//   ctx.fillStyle = '#ffffff'

//   ctx.lineWidth = 2

//   const drawPoint = function (point, index) {
//     // Landmark positions are showcased in this image -> https://bit.ly/3c6TWSg
//     if (
//       index === 2
//       || index === 8
//       || index === 14
//       || index === 17
//       || index === 26
//       || index === 31
//       || index === 33
//       || index === 35
//       || index === 39
//       || index === 42
//       || index === 48
//       || index === 51
//       || index === 54
//     ) {
//       ctx.beginPath()
//       ctx.arc(point.x, point.y, pointSize, 0, 2 * Math.PI)
//       ctx.fill()
//     }
//   }

//   points.forEach(drawPoint)
// }

const drawView = function (faceIndex, detections, canvas, image) {
  const box = detections[faceIndex].detection.box;
  const points = detections[faceIndex].landmarks.positions;
  const expressions = detections[faceIndex].expressions;

  console.log(detections[faceIndex].expressions);

  const resizedResults = {
    top: windowHeight / 2 - box.height / 2,
    bottom: windowHeight / 2 + box.height / 2,
    left: windowWidth / 2 - box.width / 2,
    right: windowWidth / 2 + box.width / 2,
    width: box.width,
    height: box.height };


  const topDifference = box.top > resizedResults.top ? `-${box.top - resizedResults.top}` : resizedResults.top - box.top;
  const leftDifference = box.left > resizedResults.left ? `-${box.left - resizedResults.left}` : resizedResults.left - box.left;

  image.style.top = `${topDifference}px`;
  image.style.left = `${leftDifference}px`;
  canvas.style.top = `${topDifference}px`;
  canvas.style.left = `${leftDifference}px`;
  resultContainer.style.top = `${topDifference}px`;
  resultContainer.style.left = `${leftDifference}px`;
  emotionResultContainer.style.top = `${topDifference}px`;
  emotionResultContainer.style.left = `${leftDifference}px`;
  // landmarksContainer.style.top = `${topDifference}px`
  // landmarksContainer.style.left = `${leftDifference}px`

  drawBox(box);

  setTimeout(function () {
    resultContainer.innerHTML = `
      <div id="result-content" style="top: ${Math.trunc(box.top - 40)}px; left: ${Math.trunc(box.left - 20)}px">
        <div>${Math.trunc(detections[faceIndex].age)} ${detections[faceIndex].age > 1 ? ' ' : ''} лет <span>${detections[faceIndex].genderProbability > 0.6 ? detections[faceIndex].gender : 'non-binary'}<span></div>
      </div>
    `;
  }, 400);

  setTimeout(function () {
    // Find the max expression value and its corresponding key (emotion)
    let maxExpressionValue = -Infinity;
    let maxExpressionKey = '';

    for (let key in expressions) {
      if (expressions[key] > maxExpressionValue) {
        maxExpressionValue = expressions[key];
        maxExpressionKey = key;
      }
    }

    // Function to assign the 'highest' class if the expression matches the max expression key
    const assignHighestClass = key => maxExpressionKey === key ? 'highest' : '';

    emotionResultContainer.innerHTML = `
      <div id="result-content" style="top: ${Math.trunc(box.top)}px; left: ${Math.trunc(box.left + box.width)}px">
        <span class="expression ${assignHighestClass('angry')}">
          Агрессия: ${expressions.angry.toFixed(2)}
        </span><br>
        <span class="expression ${assignHighestClass('disgusted')}">
          Отвращение: ${expressions.disgusted.toFixed(2)}
        </span><br>
        <span class="expression ${assignHighestClass('fearful')}">
          Страх: ${expressions.fearful.toFixed(2)}
        </span><br>
        <span class="expression ${assignHighestClass('happy')}">
          Счастье: ${expressions.happy.toFixed(2)}
        </span><br>
        <span class="expression ${assignHighestClass('neutral')}">
          Нейтральность: ${expressions.neutral.toFixed(2)}
        </span><br>
        <span class="expression ${assignHighestClass('sad')}">
          Досада: ${expressions.sad.toFixed(2)}
        </span><br>
        <span class="expression ${assignHighestClass('surprised')}">
          Удивление: ${expressions.surprised.toFixed(2)}
        </span><br>
   <div>${detectionLength > 1 ? '<button onClick="loadNextFaceButton()">СЛЕДУЮЩЕЕ ЛИЦО</button>' : ''}</div>
      </div>
    `;
  }, 600);

  // drawLandmarks(points, box.height)

  // setTimeout(function () {
  //   landmarksContainer.classList.add('reveal')
  // }, 500)
};

const particlesConfig = {
  "particles": {
    "number": {
      "value": 200,
      "density": {
        "enable": true,
        "value_area": 3126.65351868777 } },


    "color": {
      "value": "#ffffff" },

    "shape": {
      "type": "circle",
      "stroke": {
        "width": 0,
        "color": "#000000" },

      "polygon": {
        "nb_sides": 5 },

      "image": {
        "src": "img/github.svg",
        "width": 100,
        "height": 100 } },


    "opacity": {
      "value": 0.5,
      "random": false,
      "anim": {
        "enable": false,
        "speed": 1,
        "opacity_min": 0.1,
        "sync": false } },


    "size": {
      "value": 3,
      "random": true,
      "anim": {
        "enable": false,
        "speed": 40,
        "size_min": 0.1,
        "sync": false } },


    "line_linked": {
      "enable": true,
      "distance": 160.3412060865523,
      "color": "#ffffff",
      "opacity": 0.21646062821684559,
      "width": 1.2827296486924182 },

    "move": {
      "enable": true,
      "speed": 1.603412060865523,
      "direction": "none",
      "random": true,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": true,
        "rotateX": 600,
        "rotateY": 1200 } } },



  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": false,
        "mode": "repulse" },

      "onclick": {
        "enable": false,
        "mode": "push" },

      "resize": true },

    "modes": {
      "grab": {
        "distance": 400,
        "line_linked": {
          "opacity": 1 } },


      "bubble": {
        "distance": 400,
        "size": 40,
        "duration": 2,
        "opacity": 8,
        "speed": 3 },

      "repulse": {
        "distance": 64.96617698410762,
        "duration": 0.4 },

      "push": {
        "particles_nb": 4 },

      "remove": {
        "particles_nb": 2 } } },



  "retina_detect": true };