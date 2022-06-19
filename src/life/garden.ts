import type { Canvas } from "@/canvas";
import { FieldGraphics } from "@/canvas/fieldGraphics";
import { FieldsLayer } from "@/canvas/fieldsLayer";
import { getDistanceBetween } from "@/utils/distance";
import { Container, Graphics } from "pixi.js";
import type { Ant } from "./ant";
import { FIELD_CELL_SIZE } from "./const";
import type { Corpse } from "./corpse";
import { Field } from "./field";
import { FoodField } from "./food";
import { Colony } from "./colony";
import { gardenSettings, simulationSettings, visualSettings } from "./settings";

export class Garden {
  colonies: Colony[] = [];
  ants: Ant[] = [];
  corpses: Corpse[] = [];

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

  antsMap: Ant[][] = [];

  corpsesContainer = new Container();
  antsContainer = new Container();

  corpsesPhase = 0;
  corpsesTime = 120;

  isDestroyed = false;

  constructor(
    public canvas: Canvas,
    public width: number,
    public height: number
  ) {
    this.fieldWidth = Math.ceil(this.width / FIELD_CELL_SIZE);
    this.fieldHeight = Math.ceil(this.height / FIELD_CELL_SIZE);

    this.background = new Graphics();
    this.drawBackground();

    this.foodField = new FoodField(this);
    this.rockField = new Field(this);
    this.antsField = new Field(this, FIELD_CELL_SIZE * 6);

    for (let i = 0; i < this.antsField.data.length; i++) {
      this.antsField.data[i] = 1;
      this.antsMap[i] = [];
    }

    this.foodGraphics = new FieldGraphics(this, [0, 255, 0]);
    this.foodGraphics.bindData(this.foodField.data);

    this.rockGraphics = new FieldGraphics(this, [180, 180, 180]);
    this.rockGraphics.bindData(this.rockField.data);

    this.fieldsLayer = new FieldsLayer(this, canvas);

    canvas.app.stage.addChild(this.corpsesContainer);
    canvas.app.stage.addChild(this.antsContainer);
  }

  drawBackground() {
    this.background.beginFill(0x000000, 1);
    this.background.drawRect(0, 0, this.width, this.height);
    this.background.endFill();
    this.background.zIndex = -1;

    this.canvas.app.stage.addChild(this.background);
  }

  tick(totalTicks: number) {
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

    for (const colony of this.colonies) {
      colony.tick(totalTicks);
    }

    for (
      let i = this.corpsesPhase++;
      i < this.corpses.length;
      i += this.corpsesTime
    ) {
      this.corpses[i].tick(this.corpsesTime);
    }
    if (this.corpsesPhase === this.corpsesTime) {
      this.corpsesPhase = 0;
    }

    this.foodField.tick();
    this.foodGraphics.texture.update();

    this.antsContainer.visible = visualSettings.antsEnabled;
  }

  destroy() {
    this.isDestroyed = true;

    this.background.destroy();

    while (this.colonies.length) {
      this.colonies[0].destroy();
    }

    while (this.corpses.length) {
      this.corpses[0].destroy();
    }

    this.foodGraphics.destroy();
    this.rockGraphics.destroy();

    this.fieldsLayer.destroy();
  }

  placeRandomColony(numberOfAnts: number) {
    // if (gardenSettings.horizontalMirror && gardenSettings.verticalMirror) {

    // }

    let x = 0;
    let y = 0;

    if (gardenSettings.horizontalMirror && gardenSettings.verticalMirror) {
      if (this.colonies.length % 4 === 1) {
        const lastColony = this.colonies[this.colonies.length - 1];
        [x, y] = [this.width - lastColony.sprite.x, lastColony.sprite.y];
      } else if (this.colonies.length % 4 === 2) {
        const lastColony = this.colonies[this.colonies.length - 2];
        [x, y] = [lastColony.sprite.x, this.height - lastColony.sprite.y];
      } else if (this.colonies.length % 4 === 3) {
        const lastColony = this.colonies[this.colonies.length - 3];
        [x, y] = [
          this.width - lastColony.sprite.x,
          this.height - lastColony.sprite.y,
        ];
      }
    } else if (gardenSettings.horizontalMirror) {
      if (this.colonies.length % 2 === 1) {
        const lastColony = this.colonies[this.colonies.length - 1];
        [x, y] = [this.width - lastColony.sprite.x, lastColony.sprite.y];
      }
    } else if (gardenSettings.verticalMirror) {
      if (this.colonies.length % 2 === 1) {
        const lastColony = this.colonies[this.colonies.length - 1];
        [x, y] = [lastColony.sprite.x, this.height - lastColony.sprite.y];
      }
    }

    if (!x || !y) {
      [x, y] = this.getRandomColonyPosition();
    }

    if (!x || !y) {
      return;
    }

    const colony = new Colony(x, y, this, this.canvas.app);
    colony.setStartingAntsNumber(numberOfAnts);

    this.colonies.push(colony);

    return colony;
  }

  getRandomColonyPosition() {
    const minimalDistanceFromOtherColony =
      Math.min(this.width, this.height) / this.colonies.length / 2;

    let tries = 0;
    while (tries++ < 50) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;

      if (this.rockField.getAt(x, y) !== 0) {
        continue;
      }

      const closestColonyDistance = this.getClosesColonyDistance(x, y);
      if (
        closestColonyDistance &&
        closestColonyDistance < minimalDistanceFromOtherColony
      ) {
        continue;
      }

      return [x, y];
    }
    return [0, 0];
  }

  getClosesColonyDistance(x: number, y: number): number | null {
    let closestDistance = null;

    for (const colony of this.colonies) {
      const distance = getDistanceBetween(
        x,
        y,
        colony.sprite.x,
        colony.sprite.y
      );
      if (!closestDistance || distance < closestDistance) {
        closestDistance = distance;
      }
    }

    return closestDistance;
  }
}
