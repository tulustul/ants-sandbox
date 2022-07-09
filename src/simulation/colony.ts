import { Application, Graphics } from "pixi.js";

import type { DumpedColony } from "@/types";
import { state } from "@/ui/state";
import { desaturateColor, getNextColor } from "@/utils";

import { Ant, AntType } from "./ant";
import type { Garden } from "./garden";
import { PheromoneField } from "./pheromone";
import { gardenSettings } from "./settings";

const initialColonyStats = {
  food: 0,
  totalFood: 0,

  livingAnts: 0,
  totalAnts: 0,
  starvedAnts: 0,
  killedAnts: 0,
  killedEnemyAnts: 0,

  workers: 0,
  soldiers: 0,
};

// Used for charts.
const initialColonyHistory = {
  food: [] as number[],
  totalFood: [] as number[],

  livingAnts: [] as number[],
  totalAnts: [] as number[],
  starvedAnts: [] as number[],
  killedAnts: [] as number[],
  killedEnemyAnts: [] as number[],
  warCoef: [] as number[],

  workers: [] as number[],
  soldiers: [] as number[],
};

export type ColonyHistory = typeof initialColonyHistory;

function getFirstUnusedBitId(colonies: Colony[]): number {
  let id = 1;
  for (let i = 0; i < 31; i++) {
    let isUsed = false;
    for (const colony of colonies) {
      if (colony.bitId === id) {
        isUsed = true;
        break;
      }
    }
    if (!isUsed) {
      return id;
    }
    id = id << 1;
  }
  return 0;
}

const ANT_COST = 100;

export class Colony {
  static lastId = 1;

  id = Colony.lastId++;
  bitId: number;

  sprite: Graphics;

  ants: Ant[] = [];
  startingAnts = 1;
  antsToRelease = 1;

  stats = { ...initialColonyStats };
  history = JSON.parse(
    JSON.stringify(initialColonyHistory)
  ) as typeof initialColonyHistory;

  antsLimit = gardenSettings.colonySizeLimit;
  lastAntBirth = 0;
  warCoef = 0;
  cumulatedAggresiveness = 0;

  antsMeanEnergy = 3;
  freedom = 0.003;
  aggresiveness = Math.random();

  color: number;
  corpseColor: number;

  toFoodField: PheromoneField;
  toHomeField: PheromoneField;
  toEnemyField: PheromoneField;
  foodHereField: PheromoneField;
  enemyHereField: PheromoneField;

  constructor(
    x: number,
    y: number,
    public garden: Garden,
    public app: Application
  ) {
    this.color = getNextColor(this.garden);
    this.corpseColor = desaturateColor(this.color, 0.6);

    this.bitId = getFirstUnusedBitId(this.garden.colonies);

    this.toFoodField = new PheromoneField(this.garden);
    this.toHomeField = new PheromoneField(this.garden);
    this.toEnemyField = new PheromoneField(this.garden);
    this.foodHereField = new PheromoneField(this.garden);
    this.enemyHereField = new PheromoneField(this.garden);
    this.sprite = new Graphics();

    this.sprite.beginFill(this.color, 1);
    this.sprite.drawCircle(0, 0, 50);
    this.sprite.endFill();
    this.sprite.zIndex = -1;

    this.sprite.x = x;
    this.sprite.y = y;

    this.sprite.interactive = true;
    this.sprite.on("pointerdown", () => {
      state.trackedColony = this.id;
    });

    app.stage.addChild(this.sprite);

    this.refreshNestPheromones();
  }

  setStartingAntsNumber(numberOfAnts: number) {
    this.stats.food = numberOfAnts * ANT_COST + numberOfAnts * 10;
    this.stats.totalFood = this.stats.food;
    this.antsToRelease = numberOfAnts;
  }

  destroy() {
    while (this.ants.length) {
      this.ants[0].destroy();
    }
    this.sprite.destroy();
    this.app.stage.removeChild(this.sprite);
    const colonyIndex = this.garden.colonies.indexOf(this);
    if (colonyIndex !== -1) {
      this.garden.colonies.splice(colonyIndex, 1);
    }
  }

  addFood(food: number) {
    this.stats.food += food;
    this.stats.totalFood += food;
  }

  removeFood(food: number) {
    this.stats.food = Math.max(0, this.stats.food - food);
    this.stats.totalFood = Math.max(0, this.stats.totalFood - food);
  }

  visit(ant: Ant) {
    if (this.stats.food > 0) {
      this.stats.food -= (ant.maxEnergy - ant.energy) * 10;
      ant.energy = ant.maxEnergy;
      ant.energyReturnThreshold = ant.maxEnergy / 2;
    }
    if (ant.pheromoneToDrop === this.toEnemyField) {
      this.warCoef +=
        (this.aggresiveness / this.ants.length) * (1 - this.warCoef);
    }
  }

  releaseRandomAnt() {
    const type =
      Math.random() < this.warCoef ? AntType.soldier : AntType.worker;

    if (!this.antsToRelease) {
      this.stats.food = Math.max(0, this.stats.food - 20);
    }

    this.releaseAnt(type);
  }

  releaseAnt(type: AntType) {
    if (type === AntType.worker) {
      this.stats.workers++;
    } else {
      this.stats.soldiers++;
    }

    const ant = new Ant(type, this.sprite.x, this.sprite.y, this);
    this.ants.push(ant);
    this.garden.ants.push(ant);
    this.stats.totalAnts++;
    this.stats.livingAnts++;
  }

  tick(totalTicks: number) {
    this.processAntBirth(totalTicks);

    this.warCoef *= 0.9995 + 0.0005 * this.aggresiveness;

    if (totalTicks % (60 * 2) === 0) {
      this.storeStats();
    }

    this.sprite.visible = !!this.ants.length;
    if (this.ants.length === 0) {
      this.stats.food = 0;
    } else {
      if (Math.random() > 0.99) {
        this.refreshNestPheromones();
      }
    }
  }

  processAntBirth(totalTicks: number) {
    if (this.antsToRelease > 0) {
      this.releaseRandomAnt();
      this.antsToRelease--;
      return;
    }
    if (this.ants.length >= this.antsLimit) {
      return;
    }

    const requiredFood = this.ants.length * 10;
    const foodSurplus = this.stats.food - requiredFood;
    if (foodSurplus <= 0) {
      return;
    }

    const birthTimeout = Math.round(
      50 / (foodSurplus / (this.stats.food + requiredFood)) ** 3
    );
    if (this.lastAntBirth + birthTimeout < totalTicks) {
      this.releaseRandomAnt();
      this.lastAntBirth = totalTicks;
    }
  }

  refreshNestPheromones() {
    this.toHomeField.maxValues.draw(this.sprite.x, this.sprite.y, 5, 2, {
      ignoreMirroring: true,
      smooth: true,
    });
  }

  onAntDied(ant: Ant) {
    if (ant.type === AntType.worker) {
      this.stats.workers--;
    } else {
      this.stats.soldiers--;
    }
    this.stats.livingAnts--;
  }

  storeStats() {
    this.history.food.push(this.stats.food);
    this.history.totalFood.push(this.stats.totalFood);

    this.history.soldiers.push(this.stats.soldiers);
    this.history.workers.push(this.stats.workers);
    this.history.livingAnts.push(this.stats.livingAnts);
    this.history.totalAnts.push(this.stats.totalAnts);

    this.history.killedAnts.push(this.stats.killedAnts);
    this.history.killedEnemyAnts.push(this.stats.killedEnemyAnts);
    this.history.starvedAnts.push(this.stats.starvedAnts);

    this.history.warCoef.push(this.warCoef);
  }

  dump(): DumpedColony {
    return {
      x: this.sprite.x,
      y: this.sprite.y,
      antsLimit: this.antsLimit,
      antsToRelease: Math.max(this.antsToRelease, this.ants.length),
      food: this.stats.food,
      aggresiveness: this.aggresiveness,
      antsMeanEnergy: this.antsMeanEnergy,
      freedom: this.freedom,
    };
  }

  addAnts(type: AntType, quantity: number) {
    for (let i = 0; i < quantity; i++) {
      this.releaseAnt(type);
    }
  }

  killAnts(type: AntType, quantity: number) {
    let removed = 0;
    for (let i = this.ants.length - 1; i >= 0; i--) {
      const ant = this.ants[i];
      if (ant.type === type) {
        ant.die();
        if (++removed === quantity) {
          return;
        }
      }
    }
  }
}
