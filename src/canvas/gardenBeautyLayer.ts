import type { Garden } from "@/life/garden";
import {
  Container,
  Filter,
  FORMATS,
  Loader,
  SCALE_MODES,
  Texture,
  TYPES,
  WRAP_MODES,
} from "pixi.js";
import type { Canvas } from "./canvas";
import { FieldGraphics } from "./fieldGraphics";
import grassUrl from "@/assets/grass.jpg";
import ivyUrl from "@/assets/ivy.jpg";
import rockUrl from "@/assets/rock.png";

const vShaderSrc = `
attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;
uniform mat3 filterMatrix;

varying vec2 vTextureCoord;
varying vec2 vFilterCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;

vec4 filterVertexPosition( void )
{
    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aVertexPosition * (outputFrame.zw * inputSize.zw);
}

void main(void)
{
	gl_Position = filterVertexPosition();
	vTextureCoord = filterTextureCoord();
	vFilterCoord = ( filterMatrix * vec3( vTextureCoord, 1.0)  ).xy;
}
`;

const fShaderSrc = `
varying vec2 vFilterCoord;
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D grassSampler;
uniform sampler2D ivySampler;
uniform sampler2D rockSampler;

uniform highp vec4 inputSize;
uniform highp vec4 outputFrame;
uniform highp vec4 inputClamp;

void main(void){
  vec4 color = texture2D(uSampler, vTextureCoord);
  // vec2 textureCoords = vTextureCoord * inputSize.xy / outputFrame.zw * 4.0;
  // vec2 textureCoords = clamp(vec2(vTextureCoord.x + map.x, vTextureCoord.y + map.y), inputClamp.xy, inputClamp.zw);

  if (color.g > 0.0 && color.r != color.g) {
    gl_FragColor = texture2D(ivySampler, vFilterCoord);
  } else if (color.g == 0.0) {
    // vec4 map =  texture2D(grassSampler, vFilterCoord);
    // map.xy = inputSize.zw * map.xy;
    // gl_FragColor = texture2D(grassSampler, clamp(vec2(vTextureCoord.x + map.x, vTextureCoord.y + map.y), inputClamp.xy, inputClamp.zw));
    gl_FragColor = texture2D(grassSampler, vFilterCoord) * color.r * 4.0;
  } else {
    gl_FragColor = texture2D(rockSampler, vFilterCoord) * color.r * 4.0;
  }
}
`;

export class GardenBeautyLayer {
  container = new Container();

  foodGraphics: FieldGraphics;
  rockGraphics: FieldGraphics;
  filter: Filter;

  constructor(public garden: Garden, public canvas: Canvas) {
    this.canvas.app.stage.addChild(this.container);

    this.foodGraphics = new FieldGraphics(this.garden, [0, 255, 0]);
    this.foodGraphics.texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;
    this.foodGraphics.bindData(this.garden.foodField.data);
    this.container.addChild(this.foodGraphics.sprite);

    this.rockGraphics = new FieldGraphics(this.garden, [180, 180, 180]);
    this.rockGraphics.texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;
    this.rockGraphics.bindData(this.garden.rockField.data);
    this.container.addChild(this.rockGraphics.sprite);

    Loader.shared.resources[grassUrl].texture!.baseTexture.wrapMode =
      Loader.shared.resources[ivyUrl].texture!.baseTexture.wrapMode =
      Loader.shared.resources[rockUrl].texture!.baseTexture.wrapMode =
        WRAP_MODES.REPEAT;

    this.filter = new Filter(vShaderSrc, fShaderSrc, {
      grassSampler: Loader.shared.resources[grassUrl].texture,
      ivySampler: Loader.shared.resources[ivyUrl].texture,
      rockSampler: Loader.shared.resources[rockUrl].texture,
    });
    this.filter.autoFit = true;
    this.filter.legacy = true;
    this.container.filters = [this.filter];
  }

  getTexture(data: Float32Array) {
    return Texture.fromBuffer(
      data,
      this.garden.fieldWidth,
      this.garden.fieldHeight,
      {
        format: FORMATS.RED,
        type: TYPES.FLOAT,
      }
    );
  }

  destroy() {
    this.foodGraphics.destroy();
    this.rockGraphics.destroy();
  }

  tick() {
    if (this.garden.isDestroyed) {
      return;
    }

    this.foodGraphics.texture.update();
  }
}
