import type { DumpedNest } from "@/types";
import { state } from "@/ui/state";
import { desaturateColor, getNextColor } from "@/utils/colors";
import { getNextPrimeNumber } from "@/utils/primeNumbers";
import { Application, Graphics } from "pixi.js";
import { Ant, AntType } from "./ant";
import type { Garden } from "./garden";
import { PheromoneField } from "./pheromone";
import { gardenSettings, simulationSettings } from "./settings";

export type NestStats = {
  food: number;
  totalFood: number;

  livingAnts: number;
  totalAnts: number;
  starvedAnts: number;
  killedAnts: number;
  killedEnemyAnts: number;

  workers: number;
  warriors: number;
};

export type NestHistory = {
  food: number[];
  totalFood: number[];

  livingAnts: number[];
  totalAnts: number[];
  starvedAnts: number[];
  killedAnts: number[];
  killedEnemyAnts: number[];
  warCoef: number[];

  workers: number[];
  warriors: number[];
};

export class Nest {
  static lastId = 1;

  id = Nest.lastId++;
  sprite: Graphics;
  ants: Ant[] = [];
  startingAnts = 1;
  antsToRelease = 1;
  antCost = 20;

  stats: NestStats = {
    food: 0,
    totalFood: 0,

    livingAnts: 0,
    totalAnts: 0,
    starvedAnts: 0,
    killedAnts: 0,
    killedEnemyAnts: 0,

    workers: 0,
    warriors: 0,
  };

  history: NestHistory = {
    food: [],
    totalFood: [],

    livingAnts: [],
    totalAnts: [],
    starvedAnts: [],
    killedAnts: [],
    killedEnemyAnts: [],
    warCoef: [],

    workers: [],
    warriors: [],
  };

  antsLimit = gardenSettings.colonySizeLimit;
  lastAntBirth = 0;
  warCoef = 0;
  cumulatedAggresiveness = 0;

  freedom = 0.004;
  aggresivenessCoef = Math.random();

  color: number;
  corpseColor: number;
  primeId: number;

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
    this.stats.food = numberOfAnts * this.antCost + numberOfAnts * 10;
    this.stats.totalFood = this.stats.food;
    this.antsToRelease = numberOfAnts;
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
    this.stats.food += food;
    this.stats.totalFood += food;
  }

  visit(ant: Ant) {
    if (this.stats.food > 0) {
      this.stats.food -= ant.maxEnergy - ant.energy;
      ant.energy = ant.maxEnergy;
    }
    if (ant.pheromoneToDrop === this.toEnemyField) {
      this.warCoef +=
        (this.aggresivenessCoef / this.ants.length) * (1 - this.warCoef);
    }
  }

  releaseAnt() {
    const type =
      Math.random() < this.warCoef ? AntType.warrior : AntType.worker;

    if (type === AntType.worker) {
      this.stats.workers++;
    } else {
      this.stats.warriors++;
    }

    if (!this.antsToRelease) {
      this.stats.food = Math.max(0, this.stats.food - 20);
    }

    const ant = new Ant(type, this.sprite.x, this.sprite.y, this);
    this.ants.push(ant);
    this.garden.ants.push(ant);
    this.stats.totalAnts++;
    this.stats.livingAnts++;
  }

  tick(totalTicks: number) {
    if (this.antsToRelease > 0) {
      this.releaseAnt();
      this.antsToRelease--;
    } else if (
      this.ants.length < this.antsLimit &&
      this.stats.food > this.ants.length * 10 &&
      this.lastAntBirth + 1 / simulationSettings.antsBirthRate < totalTicks
    ) {
      this.releaseAnt();
      this.lastAntBirth = totalTicks;
    }

    this.toFoodField.tick();
    this.toHomeField.tick();
    this.toEnemyField.tick();

    this.warCoef *= 0.9995 + 0.0005 * (1 - this.aggresivenessCoef);

    if (totalTicks % (60 * 2) === 0) {
      this.storeStats();
    }

    if (this.ants.length === 0) {
      this.sprite.visible = false;
      this.stats.food = 0;
    } else {
      if (Math.random() > 0.99) {
        this.toHomeField.draw(this.sprite.x, this.sprite.y, 3, 1000000);
      }
    }
  }

  onAntDied(ant: Ant) {
    if (ant.type === AntType.worker) {
      this.stats.workers--;
    } else {
      this.stats.warriors--;
    }
    this.stats.livingAnts--;
  }

  storeStats() {
    this.history.food.push(this.stats.food);
    this.history.totalFood.push(this.stats.totalFood);

    this.history.warriors.push(this.stats.warriors);
    this.history.workers.push(this.stats.workers);
    this.history.livingAnts.push(this.stats.livingAnts);
    this.history.totalAnts.push(this.stats.totalAnts);

    this.history.killedAnts.push(this.stats.killedAnts);
    this.history.killedEnemyAnts.push(this.stats.killedEnemyAnts);
    this.history.starvedAnts.push(this.stats.starvedAnts);

    this.history.warCoef.push(this.warCoef);
  }

  dump(): DumpedNest {
    return {
      x: this.sprite.x,
      y: this.sprite.y,
      antsLimit: this.antsLimit,
      antsToRelease: this.antsToRelease,
    };
  }
}
