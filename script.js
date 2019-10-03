const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

const getVideo = () => {
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then(localMediaStream => {
            console.log(localMediaStream);
            video.srcObject = localMediaStream;
            video.play();
        })
        .catch(err => {
            console.error(`Oh no!`, err);
        });
}

const paintToCanvas = () => {
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height; // size of the canvas has to be equal to the size of the video

    return setInterval(() => {
        ctx.drawImage(video, 0, 0, width, height);
        let pixels = ctx.getImageData(0, 0, width, height); // taking pixels out
        // pixels = redEffect(pixels); // messing with them
        pixels = rgbSplit(pixels);
        // pixels = greenScreen(pixels);
        ctx.globalAlpha = 0.8;
        ctx.putImageData(pixels, 0, 0); // putting them back
    }, 500);
} 

const takePhoto = () => {
    // play the sound
    snap.currentTime = 0;
    snap.play();

    // take the data out of the canvas
    const data = canvas.toDataURL('image/jpeg');
    const link = document.createElement('a');
    link.href = data;
    link.setAttribute('download', 'handsome');
    link.innerHTML = `<img src="${data}" alt="beautiful human" />`;
    strip.insertBefore(link, strip.firstChild);
}


const redEffect = (pixels) => {
    for (let i=0; i < pixels.data.length; i+=4) {
        pixels.data[i + 0] = pixels.data[i + 0] + 100; // red channel
        pixels.data[i + 1] = pixels.data[i + 1] - 50; // green channel
        pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // blue channel
    }
    return pixels;
}

const rgbSplit = (pixels) => {
    for (let i=0; i < pixels.data.length; i+=4) {
        pixels.data[i - 400] = pixels.data[i + 0]; // red channel
        pixels.data[i + 400] = pixels.data[i + 1]; // green channel
        pixels.data[i - 400] = pixels.data[i + 2]; // blue channel
    }
    return pixels;
}

const greenScreen = (pixels) => {
    const levels = {};

  document.querySelectorAll('.rgb input').forEach((input) => {
    levels[input.name] = input.value;
  });

  for (i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (red >= levels.rmin
      && green >= levels.gmin
      && blue >= levels.bmin
      && red <= levels.rmax
      && green <= levels.gmax
      && blue <= levels.bmax) {
      // take it out!
      pixels.data[i + 3] = 0;
    }
  }

  return pixels;
}

getVideo();

video.addEventListener('canplay', paintToCanvas);