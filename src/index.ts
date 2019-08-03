declare function require(name: string): unknown;

import './render';
import {Images, loadImages} from './assets';
import {Box, Dude, Flag, Swing} from './dudes';
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
    addEventListener('keydown', (event) => this.handleKey(event, true));
    addEventListener('keyup', (event) => this.handleKey(event, false));
    addEventListener('mousedown', (event) => this.handleMouse(event, true));
    addEventListener('mouseup', (event) => this.handleMouse(event, false));
  }

  private activate(active: boolean) {
    this.activated = active;
  }

  active(dude: Dude) {
    return this.activated && this.avatar == dude.body;
  }

  activated = false;

  avatar!: Body;

  box!: Body;

  engine = Engine.create();

  flag!: Body;

  private handleKey(event: KeyboardEvent, active: boolean) {
    switch (event.code) {
      case "AltLeft":
      case "AltRight":
      case "ContextMenu":
      case "MetaLeft":
      case "MetaRight":
      case "OSLeft":
      case "OSRight": {
        return;
      }
    }
    this.activate(active);
  }

  private handleMouse(event: MouseEvent, active: boolean) {
    if (event.button != 0) {
      return;
    }
    this.activate(active);
  }

  images: Images;

  private initCollision() {
    let {box, flag} = this;
    Events.on(this.engine, 'collisionStart', (event) => {
      let {avatar} = this;
      for (let pair of event.pairs) {
        let other: Body | undefined = undefined;
        if (pair.bodyA == avatar) {
          other = pair.bodyB;
        } else if (pair.bodyB == avatar) {
          other = pair.bodyA;
        }
        if (other && ((other as any).dude) {
          this.avatar = other;
          break;
        }
      }
    });
    // Use collisionActive in case the box is already there before becoming the
    // avatar.
    Events.on(this.engine, 'collisionActive', (event) => {
      if (this.avatar != box) {
        return;
      }
      for (let pair of event.pairs) {
        let other: Body | undefined = undefined;
        if (pair.bodyA == box) {
          other = pair.bodyB;
        } else if (pair.bodyB == box) {
          other = pair.bodyA;
        }
        if (other == flag) {
          console.log('Win!');
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
      this.box = new Box({
        direction: V.create(-1, 1),
        game: this,
        position: V.create(672, 48),
      }).body,
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
    this.avatar = this.box;
    this.flag = new Flag({game: this, position: V.create(672, 672)}).body;
    this.initCollision();
    World.add(engine.world, [this.flag].concat(dudes).concat(walls));
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
