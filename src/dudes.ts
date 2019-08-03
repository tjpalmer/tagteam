import {Images} from './assets';
import {Game} from './index';
import {Sprite, V} from './render';
import {
  Bodies, Body, Engine, Events, IBodyRenderOptionsSprite, Vector,
} from 'matter-js';

export interface Dude {
  body: Body;
}

export interface DudeInfo {
  direction: Vector;
  game: Game;
  position: Vector;
}

export class Swing {

  constructor(info: DudeInfo) {
    let {direction, game, position} = info;
    this.game = game;
    let body = this.body = Bodies.circle(position.x, position.y, 24, {
      frictionAir: 0,
      render: {
        sprite: {
          gridIndex: {x: 0, y: 1},
          gridSize: {x: 1, y: 2},
          texture: game.images.ball,
          xScale: 3,
          yScale: 3,
        } as Sprite as any as IBodyRenderOptionsSprite,
      },
      restitution: 1,
    });
    (body as any).dude = this;
    Body.setVelocity(this.body, V.mul(V.normalize(direction), this.speed));
    Events.on(game.engine, 'beforeUpdate', () => this.update());
  }

  body: Body;

  game: Game;

  speed = 5;

  update() {
    let {body, game, speed} = this;
    spriteOf(this).gridIndex.y = game.avatar == this.body ? 1 : 0;
    V.copy(body.velocity, v1);
    if (game.active(this)) {
      V.perp(v1, v2);
      V.vadd(v1, V.mul(v2, 0.05, v2), v1);
    }
    V.mul(V.normalize(v1, v1), speed, v1);
    Body.setAngle(body, 0);
    Body.setAngularVelocity(body, 0);
    Body.setVelocity(body, v1);
  }

}

let v1 = V.create();
let v2 = V.create();

function spriteOf(dude: Dude) {
  return dude.body.render.sprite as any as Sprite;
}
