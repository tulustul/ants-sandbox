import { FIELD_CELL_SIZE } from "@/life/const";
import type { Garden } from "@/life/garden";
import type { PheromoneVisualSettings } from "@/life/settings";
import { Texture, Sprite, FORMATS, TYPES, Filter } from "pixi.js";

const fShaderSrc = `
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec3 tint;
uniform float exposure;
uniform float contrast;

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

  constructor(
    public garden: Garden,
    tint: [number, number, number],
    settings?: PheromoneVisualSettings
  ) {
    this.texture = Texture.EMPTY;
    this.sprite = new Sprite(this.texture);
    this.sprite.scale.x = FIELD_CELL_SIZE;
    this.sprite.scale.y = FIELD_CELL_SIZE;

    const arr = new Float32Array(3);
    arr[0] = tint[0] / 255;
    arr[1] = tint[1] / 255;
    arr[2] = tint[2] / 255;
    this.filter = new Filter(undefined, fShaderSrc, {
      tint: arr,
      exposure: settings?.exposure ?? 1,
      contrast: settings?.contrast ?? 1,
    });
    this.sprite.filters = [this.filter];
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
