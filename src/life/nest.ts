import type { DumpedNest } from "@/types";
import { state } from "@/ui/state";
import { desaturateColor, getNextColor } from "@/utils/colors";
import { getNextPrimeNumber } from "@/utils/primeNumbers";
import { Application, Graphics } from "pixi.js";
import { Ant, AntType } from "./ant";
import type { Garden } from "./garden";
import { PheromoneField } from "./pheromone";
import { gardenSettings } from "./settings";

export class Nest {
  static lastId = 1;

  id = Nest.lastId++;
  sprite: Graphics;
  ants: Ant[] = [];
  startingsAnts = 1;
  antCost = 20;
  food = 1;
  totalFood = this.food;
  antsLimit = gardenSettings.colonySizeLimit;
  totalAnts = 0;
  starvedAnts = 0;
  killedAnts = 0;
  killedEnemyAnts = 0;

  freedom = 0.004;
  color: number;
  corpseColor: number;
  primeId: number;

  warriors = 100;

  toFoodField: PheromoneField;
  toHomeField: PheromoneField;
  toEnemyField: PheromoneField;
  foodHereField: PheromoneField;

  constructor(
    x: number,
    y: number,
    public garden: Garden,
    public app: Application
  ) {
    this.color = getNextColor(this.garden);
    this.corpseColor = desaturateColor(this.color, 0.6);

    this.primeId = getNextPrimeNumber(this.garden);

    this.toFoodField = new PheromoneField(this.garden);
    this.toHomeField = new PheromoneField(this.garden);
    this.toEnemyField = new PheromoneField(this.garden);
    this.foodHereField = new PheromoneField(this.garden);
    this.sprite = new Graphics();

    this.sprite.beginFill(this.color, 1);
    this.sprite.drawCircle(0, 0, 50);
    this.sprite.endFill();
    this.sprite.zIndex = -1;

    this.sprite.x = x;
    this.sprite.y = y;

    this.sprite.interactive = true;
    this.sprite.on("pointerdown", () => {
      state.trackedNest = this.id;
    });

    app.stage.addChild(this.sprite);
  }

  setStartingAntsNumber(numberOfAnts: number) {
    this.food = numberOfAnts * this.antCost + numberOfAnts * 10;
    this.totalFood = this.food;
  }

  destroy() {
    this.sprite.destroy();
    this.app.stage.removeChild(this.sprite);
    while (this.ants.length) {
      this.ants[0].destroy();
    }
    const nestIndex = this.garden.nests.indexOf(this);
    if (nestIndex !== -1) {
      this.garden.nests.splice(nestIndex, 1);
    }
  }

  addFood(food: number) {
    this.food += food;
    this.totalFood += food;
  }

  feedAnt(ant: Ant) {
    if (this.food > 0) {
      ant.energy = ant.maxEnergy;
      this.food--;
    }
  }

  releaseAnt() {
    const type = Math.random() > 0.65 ? AntType.warrior : AntType.worker;

    this.food = Math.max(0, this.food - 20);
    const ant = new Ant(type, this.sprite.x, this.sprite.y, this);
    this.ants.push(ant);
    this.garden.ants.push(ant);
    this.totalAnts++;
  }

  tick() {
    if (
      this.ants.length < this.antsLimit &&
      this.food > this.ants.length * 10
    ) {
      this.releaseAnt();
    }

    if (Math.random() > 0.99) {
      this.toHomeField.draw(this.sprite.x, this.sprite.y, 3, 1000000);
    }

    this.toFoodField.tick();
    this.toHomeField.tick();
    this.toEnemyField.tick();
  }

  getEnemyDirection() {}

  dump(): DumpedNest {
    return {
      x: this.sprite.x,
      y: this.sprite.y,
      antsLimit: this.antsLimit,
      startingAnts: this.startingsAnts,
    };
  }
}
