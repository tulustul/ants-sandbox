import { Container } from "pixi.js";

import type { Garden } from "@/simulation";

import type { Canvas } from "./canvas";
import { FieldGraphics } from "./fieldGraphics";

export class GardenLayer {
  container = new Container();

  foodGraphics: FieldGraphics;
  rockGraphics: FieldGraphics;

  constructor(public garden: Garden, public canvas: Canvas) {
    this.canvas.app.stage.addChild(this.container);

    this.foodGraphics = new FieldGraphics(this.garden, [0, 255, 0]);
    this.foodGraphics.bindData(this.garden.foodField.data);
    this.container.addChild(this.foodGraphics.sprite);

    this.rockGraphics = new FieldGraphics(this.garden, [180, 180, 180]);
    this.rockGraphics.bindData(this.garden.rockField.data);
    this.container.addChild(this.rockGraphics.sprite);
  }

  tick() {
    if (this.garden.isDestroyed) {
      return;
    }
    this.foodGraphics.texture.update();
  }

  destroy() {
    this.foodGraphics.destroy();
    this.rockGraphics.destroy();
  }
}
