import { Container, Graphics } from "pixi.js";

import { type Canvas, PheromonesLayer, GardenLayer } from "@/canvas";
import { getDistanceBetween } from "@/utils";

import type { Ant } from "./ant";
import { FIELD_CELL_SIZE } from "./const";
import type { Corpse } from "./corpse";
import { Field, FoodField, RockField } from "./field";
import { Colony } from "./colony";
import { gardenSettings, simulationSettings, visualSettings } from "./settings";

export class Garden {
  colonies: Colony[] = [];
  ants: Ant[] = [];
  corpses: Corpse[] = [];

  foodField: FoodField;
  rockField: RockField;
  antsField: Field;

  antSlowTickOffset = 0;
  antPreciseTickOffset = 0;

  background: Graphics;

  fieldWidth: number;
  fieldHeight: number;

  pheromonesLayer: PheromonesLayer;
  gardenLayer: GardenLayer;

  antsMap: Ant[][] = [];

  corpsesContainer = new Container();
  antsContainer = new Container();

  corpsesPhase = 0;
  corpsesTime = 120;

  isDestroyed = false;

  pheromoneDegradationTime = 180; // in ticks
  pheromoneDegradationPhase = 0;

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
    this.rockField = new RockField(this);
    this.antsField = new Field(this, FIELD_CELL_SIZE * 6);

    for (let i = 0; i < this.antsField.data.length; i++) {
      this.antsMap[i] = [];
    }

    this.pheromonesLayer = new PheromonesLayer(this, canvas);
    this.gardenLayer = new GardenLayer(this, canvas);

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
      if (
        (i + this.antPreciseTickOffset) % pef.antGradientCheckTickTimeout ===
        0
      ) {
        ant.preciseTick();
      } else if ((i + this.antSlowTickOffset) % pef.antBrainTickTimeout === 0) {
        ant.slowTick();
      }
    }

    if (this.antSlowTickOffset === pef.antBrainTickTimeout) {
      this.antSlowTickOffset = 0;
    }

    if (this.antPreciseTickOffset === pef.antGradientCheckTickTimeout) {
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

    this.gardenLayer.tick();

    this.antsContainer.visible = visualSettings.antsEnabled;
    this.corpsesContainer.visible = visualSettings.corpsesEnabled;

    this.degradePheromones();
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

    this.pheromonesLayer.destroy();
    this.gardenLayer.destroy();
  }

  placeRandomColony(numberOfAnts: number) {
    if (this.colonies.length >= 31) {
      return;
    }

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
      Math.min(this.width, this.height) / this.colonies.length / 1.5;

    let tries = 0;
    let [bestX, bestY, largestEmptyArea] = [0, 0, 0];
    while (tries++ < 20) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;

      const index = this.rockField.getIndex(x, y);
      if (this.rockField.data[index] !== 0) {
        continue;
      }

      const closestColonyDistance = this.getClosesColonyDistance(x, y);
      if (
        closestColonyDistance &&
        closestColonyDistance < minimalDistanceFromOtherColony
      ) {
        continue;
      }

      if (this.rockField.emptySegmentsMap.size) {
        const emptyArea = this.rockField.getEmptyAreaAt(index);
        if (emptyArea < this.rockField.area / this.colonies.length / 2) {
          if (emptyArea > largestEmptyArea) {
            largestEmptyArea = emptyArea;
            bestX = x;
            bestY = y;
          }
          continue;
        }
      }

      return [x, y];
    }
    return [bestX, bestY];
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

  degradePheromones() {
    // This could be a part of a PheromoneField class but it is aggregated here for all the pheromones for performance reasons.
    const dissipation = 1 / simulationSettings.pheromoneDissipation;
    const size = this.fieldWidth * this.fieldHeight;
    for (
      let i = this.pheromoneDegradationPhase++;
      i < size;
      i += this.pheromoneDegradationTime
    ) {
      for (const colony of this.colonies) {
        if (colony.toFoodField.data[i] > 0) {
          colony.toFoodField.data[i] *= dissipation;
          colony.toFoodField.maxValues.data[i] *= dissipation;
        }
        if (colony.toHomeField.data[i] > 0) {
          colony.toHomeField.data[i] *= dissipation;
          colony.toHomeField.maxValues.data[i] *= dissipation;
        }
        if (colony.toEnemyField.data[i] > 0) {
          colony.toEnemyField.data[i] *= dissipation;
          colony.toEnemyField.maxValues.data[i] *= dissipation;
        }
      }
    }
    if (this.pheromoneDegradationPhase === this.pheromoneDegradationTime) {
      this.pheromoneDegradationPhase = 0;
    }
  }
}
