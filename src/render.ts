import {Body, Render, Vector} from 'matter-js';

export interface Sprite {
  gridIndex: Vector,
  gridSize: Vector,
  texture: HTMLImageElement,
  xOffset?: number,
  yOffset?: number,
  xScale: number,
  yScale: number,
}

export const V = {
  copy: vcopy,
  create: Vector.create,

  mul(a: Vector, b: number, output?: Vector) {
    if (!output) {
      output = V.create();
    }
    output.x = a.x * b;
    output.y = a.y * b;
    return output;
  },

  normalize(a: Vector, output?: Vector) {
    return V.mul(a, 1 / Vector.magnitude(a), output);
  },

  perp(a: Vector, output?: Vector) {
    if (!output) {
      output = V.create();
    }
    output.x = -a.y;
    output.y = a.x;
    return output;
  },

  put: vput,
  vadd: Vector.add,
  vdiv: vdiv,
  vmul: vmul,
}

function vcopy(a: Vector, output: Vector) {
  output.x = a.x;
  output.y = a.y;
  return output;
}

function vdiv(a: Vector, b: Vector, output?: Vector) {
  if (!output) {
    output = V.create();
  }
  output.x = a.x / b.x;
  output.y = a.y / b.y;
  return output;
}

function vmul(a: Vector, b: Vector, output?: Vector) {
  if (!output) {
    output = V.create();
  }
  output.x = a.x * b.x;
  output.y = a.y * b.y;
  return output;
}

function vput(x: number, y: number, output: Vector) {
  output.x = x;
  output.y = y;
  return output;
}

let spriteOffset = V.create();
let spriteSize = V.create();

// Copied and modified from Matter.js render bodies function.
(Render as any).bodies = function(render: Render, bodies: Body[], context: CanvasRenderingContext2D) {
  let c = context;
  let {options} = render;
  let showInternalEdges =
    (options as any).showInternalEdges || !options.wireframes;

  for (let i = 0; i < bodies.length; i++) {
      let body = bodies[i];

      if (!body.render.visible)
          continue;

      // handle compound parts
      for (let k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
          let part = body.parts[k];

          if (!part.render.visible)
              continue;

          if ((options as any).showSleeping && body.isSleeping) {
              c.globalAlpha = 0.5 * part.render.opacity!;
          } else if (part.render.opacity !== 1) {
              c.globalAlpha = part.render.opacity!;
          }

          if (part.render.sprite && part.render.sprite.texture && !options.wireframes) {
              // part sprite
              let sprite = part.render.sprite as any as Sprite;
              let texture = sprite.texture as any as HTMLImageElement;
              let {gridIndex, gridSize} = sprite;
              vput(texture.width, texture.height, spriteSize);
              vdiv(spriteSize, gridSize, spriteSize);
              vmul(gridIndex, spriteSize, spriteOffset);

              c.translate(part.position.x, part.position.y);
              c.rotate(part.angle);

              c.drawImage(
                  texture,
                  spriteOffset.x,
                  spriteOffset.y,
                  spriteSize.x,
                  spriteSize.y,
                  spriteSize.x * -sprite.xOffset! * sprite.xScale,
                  spriteSize.y * -sprite.yOffset! * sprite.yScale,
                  spriteSize.x * sprite.xScale,
                  spriteSize.y * sprite.yScale,
              );

              // revert translation, hopefully faster than save / restore
              c.rotate(-part.angle);
              c.translate(-part.position.x, -part.position.y);
          } else {
              // part polygon
              if ((part as any).circleRadius) {
                  c.beginPath();
                  c.arc(part.position.x, part.position.y, (part as any).circleRadius, 0, 2 * Math.PI);
              } else {
                  c.beginPath();
                  c.moveTo(part.vertices[0].x, part.vertices[0].y);

                  for (let j = 1; j < part.vertices.length; j++) {
                      if (!(part.vertices[j - 1] as any).isInternal || showInternalEdges) {
                          c.lineTo(part.vertices[j].x, part.vertices[j].y);
                      } else {
                          c.moveTo(part.vertices[j].x, part.vertices[j].y);
                      }

                      if ((part.vertices[j] as any).isInternal && !showInternalEdges) {
                          c.moveTo(part.vertices[(j + 1) % part.vertices.length].x, part.vertices[(j + 1) % part.vertices.length].y);
                      }
                  }

                  c.lineTo(part.vertices[0].x, part.vertices[0].y);
                  c.closePath();
              }

              if (!options.wireframes) {
                  c.fillStyle = part.render.fillStyle!;

                  if (part.render.lineWidth) {
                      c.lineWidth = part.render.lineWidth;
                      c.strokeStyle = part.render.strokeStyle!;
                      c.stroke();
                  }

                  c.fill();
              } else {
                  c.lineWidth = 1;
                  c.strokeStyle = '#bbb';
                  c.stroke();
              }
          }

          c.globalAlpha = 1;
      }
  }
};
