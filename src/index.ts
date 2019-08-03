import {Images, loadImages} from './assets';

addEventListener('load', main);

async function main() {
  let images = await loadImages();
  paint(images);
}

let y = 0;
let start = 0;

function paint(images: Images, dt: number = 0) {
  y += 180 * dt;
  let canvas = document.getElementsByTagName('canvas')[0];
  let context = canvas.getContext('2d')!;
  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(images.ball, 0, 16, 16, 16, 100, Math.round(y), 48, 48);
  requestAnimationFrame((timestamp) => {
    let dt = 0;
    if (start) {
      dt = timestamp - start;
    }
    dt /= 1000;
    if (dt > 1 / 10) {
      dt = 0;
    }
    start = timestamp;
    paint(images, dt);
  });
}
