import type { Garden } from "@/life/garden";
import { visualSettings } from "@/life/settings";
import { Texture, Sprite, FORMATS, TYPES, Filter } from "pixi.js";

const fShaderSrc = `
varying vec2 vTextureCoord;
// varying vec2 vUvs;
// varying vec2 inputPixel;

uniform sampler2D uSampler;
uniform vec3 tint;
uniform float exposure;
uniform float contrast;

// uniform vec4 inputSize;
// uniform vec4 outputFrame;
// uniform vec4 vFilterCoord;

void main(void){
   float alpha = texture2D(uSampler, vTextureCoord).r;
   alpha *= exposure;
   alpha = pow(alpha, contrast);
   gl_FragColor = vec4(tint.r*alpha, tint.g*alpha, tint.b*alpha, 0);
}
`;

export class FieldGraphics {
  texture: Texture;
  sprite: Sprite;
  filter: Filter;

  constructor(public garden: Garden, tint: [number, number, number]) {
    this.texture = Texture.EMPTY;
    this.sprite = new Sprite(this.texture);
    this.sprite.scale.x = garden.fieldCellSize;
    this.sprite.scale.y = garden.fieldCellSize;

    const arr = new Float32Array(3);
    arr[0] = tint[0] / 255;
    arr[1] = tint[1] / 255;
    arr[2] = tint[2] / 255;
    this.filter = new Filter(undefined, fShaderSrc, {
      tint: arr,
      exposure: visualSettings.shaders.pheromoneExposure,
      contrast: visualSettings.shaders.pheromoneContrast,
    });
    this.sprite.filters = [this.filter];

    garden.canvas.app.stage.addChild(this.sprite);
  }

  bindData(data: Float32Array) {
    this.texture = Texture.fromBuffer(
      data,
      this.garden.fieldWidth,
      this.garden.fieldHeight,
      {
        format: FORMATS.RED,
        type: TYPES.FLOAT,
      }
    );
    this.sprite.texture = this.texture;
  }

  destroy() {
    this.sprite.destroy();
    this.texture.destroy();
  }
}
