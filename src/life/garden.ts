import type { Canvas } from "@/canvas";
import { FieldGraphics } from "@/canvas/fieldGraphics";
import { FieldsLayer } from "@/canvas/fieldsLayer";
import { getDistanceBetween } from "@/utils/distance";
import { Container, Graphics } from "pixi.js";
import type { Ant } from "./ant";
import { Field } from "./field";
import { FoodField } from "./food";
import { Nest } from "./nest";
import { simulationSettings, visualSettings } from "./settings";

export class Garden {
  nests: Nest[] = [];
  ants: Ant[] = [];

  fieldCellSize = 20;

  foodField: FoodField;
  rockField: Field;
  antsField: Field;

  foodGraphics: FieldGraphics;
  rockGraphics: FieldGraphics;

  antSlowTickOffset = 0;
  antPreciseTickOffset = 0;

  background: Graphics;

  fieldWidth: number;
  fieldHeight: number;

  fieldsLayer: FieldsLayer;

  antsContainer = new Container();

  constructor(
    public canvas: Canvas,
    public width: number,
    public height: number
  ) {
    this.fieldWidth = Math.ceil(this.width / this.fieldCellSize);
    this.fieldHeight = Math.ceil(this.height / this.fieldCellSize);

    this.background = new Graphics();
    this.drawBackground();

    this.foodField = new FoodField(this);
    this.rockField = new Field(this);
    this.antsField = new Field(this, this.fieldCellSize * 3);

    for (let i = 0; i < this.antsField.data.length; i++) {
      this.antsField.data[i] = 1;
    }

    this.foodGraphics = new FieldGraphics(this, [0, 255, 0]);
    this.foodGraphics.bindData(this.foodField.data);

    this.rockGraphics = new FieldGraphics(this, [180, 180, 180]);
    this.rockGraphics.bindData(this.rockField.data);

    this.fieldsLayer = new FieldsLayer(this, canvas);

    canvas.app.stage.addChild(this.antsContainer);
  }

  drawBackground() {
    this.background.beginFill(0x000000, 1);
    this.background.drawRect(0, 0, this.width, this.height);
    this.background.endFill();
    this.background.zIndex = -1;

    this.canvas.app.stage.addChild(this.background);
  }

  tick() {
    this.antSlowTickOffset++;
    this.antPreciseTickOffset++;

    const pef = simulationSettings.performance;

    for (let i = 0; i < this.ants.length; i++) {
      const ant = this.ants[i];
      if (!ant.fastTick()) {
        continue;
      }
      if ((i + this.antPreciseTickOffset) % pef.antPreciseTickTimeout === 0) {
        ant.preciseTick();
      } else if ((i + this.antSlowTickOffset) % pef.antSlowTickTimeout === 0) {
        ant.slowTick();
      }
    }

    if (this.antSlowTickOffset === pef.antSlowTickTimeout) {
      this.antSlowTickOffset = 0;
    }

    if (this.antPreciseTickOffset === pef.antPreciseTickTimeout) {
      this.antPreciseTickOffset = 0;
    }

    for (const nest of this.nests) {
      nest.tick();
    }

    this.foodField.tick();
    this.foodGraphics.texture.update();

    this.antsContainer.visible = visualSettings.antsEnabled;
  }

  destroy() {
    this.background.destroy();

    while (this.nests.length) {
      this.nests[0].destroy();
    }

    this.foodGraphics.destroy();
    this.rockGraphics.destroy();

    this.fieldsLayer.destroy();
  }

  placeRandomNest(numberOfAnts: number) {
    const minimalDistanceFromOtherNest =
      Math.min(this.width, this.height) / this.nests.length / 2;

    let tries = 0;
    while (tries++ < 50) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;

      if (this.rockField.getAt(x, y) !== 0) {
        continue;
      }

      const closestNestDistance = this.getClosesNestDistance(x, y);
      if (
        closestNestDistance &&
        closestNestDistance < minimalDistanceFromOtherNest
      ) {
        continue;
      }

      const nest = new Nest(x, y, this, this.canvas.app);
      nest.setStartingAntsNumber(numberOfAnts);

      this.nests.push(nest);

      return;
    }
  }

  getClosesNestDistance(x: number, y: number): number | null {
    let closestDistance = null;

    for (const nest of this.nests) {
      const distance = getDistanceBetween(x, y, nest.sprite.x, nest.sprite.y);
      if (!closestDistance || distance < closestDistance) {
        closestDistance = distance;
      }
    }

    return closestDistance;
  }
}
