declare function require(name: string): unknown;

import './render';
import {Images, loadImages} from './assets';
import {Dude, Swing} from './dudes';
import {Bodies, Body, Engine, Render, World, Events} from 'matter-js';
import {V} from './render';

addEventListener('load', main);

async function main() {
  let images = await loadImages();
  new Game(images);
}

export class Game {

  constructor(images: Images) {
    this.images = images;
    this.initWorld();
    addEventListener('mousedown', () => this.activate(true));
    addEventListener('mouseup', () => this.activate(false));
    addEventListener('keydown', () => this.activate(true));
    addEventListener('keyup', () => this.activate(false));
  }

  private activate(active: boolean) {
    this.activated = active;
  }

  active(dude: Dude) {
    return this.activated && this.avatar == dude.body;
  }

  activated = false;

  avatar!: Body;

  engine = Engine.create();

  images: Images;

  private initCollision() {
    Events.on(this.engine, 'collisionStart', (event) => {
      for (let pair of event.pairs) {
        let other: Body | undefined = undefined;
        if (pair.bodyA == this.avatar) {
          other = pair.bodyB;
        } else if (pair.bodyB == this.avatar) {
          other = pair.bodyA;
        }
        if (other && (other as any).dude) {
          this.avatar = other;
          break;
        }
      }
    });
  }

  private initWorld() {
    let {engine} = this;
    let walls = [
      Bodies.rectangle(360, 5, 720, 10, {isStatic: true}),
      Bodies.rectangle(5, 360, 10, 720, {isStatic: true}),
      Bodies.rectangle(715, 360, 10, 720, {isStatic: true}),
      Bodies.rectangle(360, 715, 720, 10, {isStatic: true}),
    ];
    let dudes = [
      new Swing({
        direction: V.create(0, -1),
        game: this,
        position: V.create(360, 48),
      }).body,
      new Swing({
        direction: V.create(1, 1),
        game: this,
        position: V.create(48, 48),
      }).body,
    ];
    this.avatar = dudes[0];
    this.initCollision();
    World.add(engine.world, dudes.concat(walls));
    engine.world.gravity.scale = 0;
    Engine.run(engine);
    let render = Render.create({
      canvas: document.getElementsByTagName('canvas')[0],
      engine,
      options: {height: 720, width: 720, wireframes: false},
    });
    Render.run(render);
  }

}
