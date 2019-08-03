declare function require(name: string): unknown;

addEventListener('load', main);

function loadImage(path: string): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    let image = new Image;
    image.onload = () => resolve(image);
    image.src = path;
  });
}

let ball = loadImage(require('./assets/blueball.png') as string);

async function main() {
  console.log(await ball);
}

function paint() {
  //
}
