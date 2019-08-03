import {Images, loadImages} from './assets';

addEventListener('load', main);

async function main() {
  let images = await loadImages();
  paint(images);
}

function paint(images: Images) {
  let canvas = document.getElementsByTagName('canvas')[0];
  let context = canvas.getContext('2d')!;
  context.drawImage(images.ball, 0, 0);
}
