declare function require(name: string): unknown;

import './render';
import {Images, loadImages} from './assets';
import {Box, Dude, Flag, Swing} from './dudes';
import {
  Bodies, Body, Composite, Engine, Render, World, Events, Vector,
} from 'matter-js';
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
    addEventListener('touchstart', (event) => this.activate(true));
    addEventListener('touchend', (event) => this.activate(false));
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
    Events.on(this.engine, 'collisionStart', (event) => {
      let {avatar} = this;
      for (let pair of event.pairs) {
        let other: Body | undefined = undefined;
        if (pair.bodyA == avatar) {
          other = pair.bodyB;
        } else if (pair.bodyB == avatar) {
          other = pair.bodyA;
        }
        if (other && (other as any).dude) {
          this.avatar = other;
          break;
        }
      }
    });
    // Use collisionActive in case the box is already there before becoming the
    // avatar.
    Events.on(this.engine, 'collisionActive', (event) => {
      let {avatar, box, flag} = this;
      if (avatar != box) {
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
          this.win();
          break;
        }
      }
    });
  }

  private initLevel() {
    let {engine, level} = this;
    // First remove the old ones.
    for (let sprite of this.sprites) {
      Composite.remove(engine.world, sprite);
    }
    // Choose placements.
    let blockSize = 48;
    let size = 720 / blockSize - 2;
    let origin = V.create(blockSize, blockSize);
    let count = size * size;
    // Permute on grid indices to avoid starting with intersections.
    let indices = permutation(count, level + 2);
    if (level == 0) {
      indices = [(size - 1) * size + 6, 6 * size + 6];
    }
    let direction = V.create(0, 1);
    let makeInfo = (index: number, direction?: Vector) => {
      let row = Math.floor(index / size);
      let col = index % size;
      direction = direction ||
        V.normalize(V.create(Math.random() - 0.5, Math.random() - 0.5));
      if (level == 0) {
        direction = V.create(0, -1);
      }
      return {
        direction,
        game: this,
        position: V.vadd(V.mul(V.create(col, row), blockSize), origin),
      };
    }
    // Flag then other dudes.
    // Flag doesn't need direction, but eh.
    this.flag = new Flag(makeInfo(indices[0])).body;
    let dudes = indices.slice(1, -1).map((index) => {
      return new Swing(makeInfo(index)).body;
    });
    // Make box orthogonal to at least one swing, so things should be doable.
    this.box = new Box(makeInfo(indices.slice(-1)[0], V.perp(direction))).body;
    this.avatar = this.box;
    this.sprites = [this.flag, this.box].concat(dudes);
    World.add(engine.world, this.sprites);
  }

  private initWorld() {
    let {engine} = this;
    let walls = [
      Bodies.rectangle(360, 5, 720, 10, {isStatic: true}),
      Bodies.rectangle(5, 360, 10, 720, {isStatic: true}),
      Bodies.rectangle(715, 360, 10, 720, {isStatic: true}),
      Bodies.rectangle(360, 715, 720, 10, {isStatic: true}),
    ];
    World.add(engine.world, walls);
    this.flag = new Flag({game: this, position: V.create(672, 672)}).body;
    this.initCollision();
    this.initLevel();
    engine.world.gravity.scale = 0;
    Engine.run(engine);
    let render = Render.create({
      canvas: document.getElementsByTagName('canvas')[0],
      engine,
      options: {height: 720, width: 720, wireframes: false},
    });
    Render.run(render);
  }

  level = 0;

  sprites: Body[] = [];

  win() {
    this.level += 1;
    this.initLevel();
  }

}

function permutation(total: number, keep: number): number[] {
  let indices = [...Array(total).keys()];
  return shuffled(indices).slice(0, keep);
}

function shuffled<Item>(items: Item[]): Item[] {
  let count = items.length;
  let nextInt = () => Math.floor(count * Math.random());
  let result = items.slice();
  // For non-full samples, Vitter's Method D might be good.
  for (let i = result.length - 1; i > 0; i -= 1) {
    let j = nextInt();
    let temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}
