declare function require(name: string): unknown;

import './render';
import {Sprite, V} from './render';
import {Images, loadImages} from './assets';
import {
  Bodies, Body, Engine, Events, IBodyRenderOptionsSprite, Render, Vector, World,
} from 'matter-js';

addEventListener('load', main);

async function main() {
  let images = await loadImages();
  // paint(images);
  new Game(images);
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

class Game {

  constructor(images: Images) {
    this.images = images;
    this.initWorld();
    addEventListener('mousedown', () => this.act(true));
    addEventListener('mouseup', () => this.act(false));
    addEventListener('keydown', () => this.act(true));
    addEventListener('keyup', () => this.act(false));
  }

  act(active: boolean) {
    this.active = active;
  }

  active = false;

  images: Images;

  initWorld() {
    let engine = Engine.create();
    let ball = Bodies.circle(360, 48, 24, {
      frictionAir: 0,
      render: {
        sprite: {
          gridIndex: {x: 0, y: 1},
          gridSize: {x: 1, y: 2},
          texture: this.images.ball,
          xScale: 3,
          yScale: 3,
        } as Sprite as any as IBodyRenderOptionsSprite,
      },
      restitution: 1,
    });
    Body.setVelocity(ball, {x: 0, y: 5});
    let walls = [
      Bodies.rectangle(360, 5, 720, 10, {isStatic: true}),
      Bodies.rectangle(5, 360, 10, 720, {isStatic: true}),
      Bodies.rectangle(715, 360, 10, 720, {isStatic: true}),
      Bodies.rectangle(360, 715, 720, 10, {isStatic: true}),
    ];
    World.add(engine.world, [ball].concat(walls));
    engine.world.gravity.scale = 0;
    let vel1 = Vector.create();
    let vel2 = Vector.create();
    Events.on(engine, 'beforeUpdate', () => {
      let speed = 5;
      V.copy(ball.velocity, vel1);
      if (this.active) {
        V.perp(vel1, vel2);
        V.vadd(vel1, V.mul(vel2, 0.05, vel2), vel1);
      }
      V.mul(V.normalize(vel1, vel1), speed, vel1);
      Body.setAngle(ball, 0);
      Body.setVelocity(ball, vel1);
    });
    Engine.run(engine);
    let render = Render.create({
      canvas: document.getElementsByTagName('canvas')[0],
      engine,
      options: {height: 720, width: 720, wireframes: false},
    });
    Render.run(render);
  }

}
