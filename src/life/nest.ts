import type { DumpedNest } from "@/types";
import { getNextColor } from "@/utils/colors";
import { Application, Graphics, Sprite } from "pixi.js";
import { Ant } from "./ant";
import type { Garden } from "./garden";
import { PheromoneField } from "./pheromone";

export class Nest {
  static lastId = 1;

  id = Nest.lastId++;
  sprite: Graphics;
  ants: Ant[] = [];
  food = 10;
  startingsAnts = 100;
  antsLimit = 2000;
  freedom = 0.004;
  color: number;

  toFoodField: PheromoneField;
  toHomeField: PheromoneField;
  foodHereField: PheromoneField;

  constructor(
    x: number,
    y: number,
    public garden: Garden,
    public app: Application
  ) {
    this.color = getNextColor(this.garden);

    this.toFoodField = new PheromoneField(this.garden, [70, 230, 30]);
    this.toHomeField = new PheromoneField(this.garden, [100, 100, 255]);
    this.foodHereField = new PheromoneField(this.garden, [50, 50, 200]);
    this.sprite = new Graphics();

    this.sprite.beginFill(this.color, 1);
    this.sprite.drawCircle(0, 0, 50);
    this.sprite.endFill();

    this.sprite.x = x;
    this.sprite.y = y;

    app.stage.addChild(this.sprite);
  }

  destroy() {
    this.toFoodField.destroy();
    this.toHomeField.destroy();
    this.foodHereField.destroy();

    this.sprite.destroy();
    this.app.stage.removeChild(this.sprite);
    while (this.ants.length) {
      this.ants[0].destroy();
    }
  }

  addFood(food: number) {
    this.food += food;
    if (this.food > 100) {
      this.food -= 20;
      this.releaseAnt();
    }
  }

  feedAnt(ant: Ant) {
    if (this.food > 0) {
      ant.energy = ant.maxEnergy;
      this.food--;
    }
  }

  releaseAnts() {
    for (let i = 0; i < this.startingsAnts; i++) {
      this.releaseAnt();
    }
  }

  releaseAnt() {
    if (this.ants.length >= this.antsLimit) {
      return;
    }
    const ant = new Ant(this.sprite.x, this.sprite.y, this);
    this.ants.push(ant);
    this.garden.ants.push(ant);
  }

  tick() {
    if (Math.random() > 0.99) {
      this.toHomeField.draw(this.sprite.x, this.sprite.y, 3, 1000000);
    }

    this.toFoodField.tick();
    this.toHomeField.tick();
  }

  dump(): DumpedNest {
    return {
      x: this.sprite.x,
      y: this.sprite.y,
      antsLimit: this.antsLimit,
      startingAnts: this.startingsAnts,
    };
  }
}
