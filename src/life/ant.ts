import { getDistanceBetween } from "@/utils/distance";
import { Vec } from "@/utils/vector";
import { Sprite } from "pixi.js";
import type { Nest } from "./nest";
import type { PheromoneField } from "./pheromone";
import { simulationSettings, type FieldSampler } from "./settings";
import { resources } from "@/canvas/resources";

export enum AntMode {
  toFood,
  toHome,
  smellsFood,
}

export class Ant {
  sprite: Sprite;
  velocity = new Vec(0, 5);
  maxEnergy = 1 + (Math.random() - 0.5) * 0.6;
  energy = this.maxEnergy;
  mode: AntMode = AntMode.toFood;

  followPoint: Vec | null = null;

  lastCellIndex = 0;
  lastAntCellIndex = 0;
  updatedLastAntCell = false;

  food = 0;

  noFood = false;

  isStopped = false;

  repelTicks = 0;
  maxRepelTicks = 4000;
  repelTimeout = 200;

  pheromoneToFollow: PheromoneField;
  pheromoneToDrop: PheromoneField;
  maxPheromoneStrength = 0.01;
  pheromoneStrength = this.maxPheromoneStrength;

  constructor(x: number, y: number, public nest: Nest) {
    this.sprite = new Sprite(resources.atlas!.textures["ant.png"]);

    this.sprite.anchor.set(0.5);

    this.sprite.x = x;
    this.sprite.y = y;

    this.sprite.tint = nest.color;

    nest.garden.antsContainer.addChild(this.sprite);

    this.velocity.rotate(Math.random() * Math.PI * 2);

    this.pheromoneToFollow = nest.toFoodField;
    this.pheromoneToDrop = nest.toHomeField;
  }

  destroy() {
    this.nest.ants.splice(this.nest.ants.indexOf(this), 1);
    this.nest.garden.ants.splice(this.nest.garden.ants.indexOf(this), 1);
    this.nest.app.stage.removeChild(this.sprite);
    this.sprite.destroy();
  }

  fastTick() {
    this.energy -= 0.00004;
    this.pheromoneStrength /= 1.0006;

    const antsField = this.nest.garden.antsField;

    if (this.energy <= 0) {
      this.die();
      if (this.updatedLastAntCell) {
        antsField.data[this.lastAntCellIndex] /= this.nest.primeId;
      }
      return false;
    }

    this.sprite.x += this.velocity.x;
    this.sprite.y += this.velocity.y;
    this.sprite.rotation = this.velocity.rotation() + Math.PI / 2;

    const rockField = this.nest.garden.rockField;
    if (rockField.getAt(this.sprite.x, this.sprite.y) > 0) {
      this.sprite.x -= this.velocity.x;
      this.sprite.y -= this.velocity.y;
      this.turnRandomly();
      return true;
    }

    if (this.noFood) {
      this.repelTicks++;
      if (this.repelTicks >= this.maxRepelTicks) {
        this.noFood = false;
        this.repelTicks = 0;
      }
    }

    if (this.sprite.x < 1) {
      this.sprite.x = 1;
      this.turnRandomly();
    }
    if (this.sprite.x > this.nest.garden.width - 1) {
      this.sprite.x = this.nest.garden.width - 1;
      this.turnRandomly();
    }
    if (this.sprite.y < 1) {
      this.sprite.y = 1;
      this.turnRandomly();
    }
    if (this.sprite.y > this.nest.garden.height - 1) {
      this.sprite.y = this.nest.garden.height - 1;
      this.turnRandomly();
    }

    const x = Math.max(1, Math.min(this.nest.garden.width - 1, this.sprite.x));
    const y = Math.max(1, Math.min(this.nest.garden.height - 1, this.sprite.y));

    const antsFieldindex = antsField.getIndex(x, y);
    if (antsFieldindex !== this.lastAntCellIndex) {
      if (this.updatedLastAntCell) {
        antsField.data[this.lastAntCellIndex] /= this.nest.primeId;
      }

      if (antsField.data[antsFieldindex] % this.nest.primeId !== 0) {
        antsField.data[antsFieldindex] *= this.nest.primeId;
        this.updatedLastAntCell = true;
      } else {
        this.updatedLastAntCell = false;
      }

      if (antsField.data[antsFieldindex] !== this.nest.primeId) {
        this.enterToHomeSeeEnemy();
      }
      this.lastAntCellIndex = antsFieldindex;
    }

    const fieldindex = this.nest.garden.foodField.getIndex(x, y);
    if (fieldindex !== this.lastCellIndex) {
      this.dropPheromone(
        fieldindex,
        this.pheromoneToDrop,
        this.pheromoneStrength
      );
      if (this.noFood && this.repelTicks > this.repelTimeout) {
        this.dropPheromone(
          fieldindex,
          this.nest.toFoodField,
          -this.pheromoneStrength
        );
      }
      this.lastCellIndex = fieldindex;
    }

    return true;
  }

  slowTick() {
    this.followField(
      this.pheromoneToFollow,
      simulationSettings.performance.fastFieldSampler,
      false
    );
    this.brainTick();
  }

  preciseTick() {
    this.followField(
      this.pheromoneToFollow,
      simulationSettings.performance.preciseFieldSampler,
      true
    );
    this.brainTick();
  }

  brainTick() {
    if (this.mode === AntMode.toFood) {
      this.toFood();
    } else if (this.mode === AntMode.toHome) {
      this.toHome();
    }
  }

  enterToHome() {
    this.mode = AntMode.toHome;
    this.turnAround();
    this.resetRepel();
    this.pheromoneToFollow = this.nest.toHomeField;
    if (this.food > 0) {
      this.sprite.texture = resources.atlas!.textures["ant-with-food.png"];
      this.pheromoneToDrop = this.nest.toFoodField;
    } else {
      this.noFood = true;
    }
  }

  enterToHomeSeeEnemy() {
    if (this.mode !== AntMode.toHome) {
      this.mode = AntMode.toHome;
      this.turnAround();
    }
    this.resetRepel();
    this.pheromoneToFollow = this.nest.toHomeField;
    this.pheromoneToDrop = this.nest.toEnemyField;
  }

  enterToFood() {
    this.mode = AntMode.toFood;
    this.turnAround();
    this.resetRepel();
    this.pheromoneToFollow = this.nest.toFoodField;
    this.pheromoneToDrop = this.nest.toHomeField;
    this.sprite.texture = resources.atlas!.textures["ant.png"];
  }

  resetRepel() {
    this.noFood = false;
    this.repelTicks = 0;
  }

  followField(
    field: PheromoneField,
    sampler: FieldSampler,
    chooseBest: boolean
  ) {
    let sumOfValues = 0;
    const values: number[] = [];

    for (const angle of sampler.angleSamples) {
      let total = 0;
      for (let i = 1; i <= sampler.distanceSamplesCount; i++) {
        const vec = new Vec(0, this.nest.garden.fieldCellSize * i);
        vec.rotateTo(this.velocity.rotation() + angle);
        const x = this.sprite.x + vec.x;
        const y = this.sprite.y + vec.y;
        const index = field.getIndex(x, y);
        let value = 0;

        if (this.nest.garden.rockField.data[index]) {
          total = 0;
          break;
        }

        if (
          this.mode === AntMode.toFood &&
          this.nest.garden.foodField.data[index]
        ) {
          total += 10000;
          break;
        }

        // value = field.data[index];
        value = field.maxValues.data[index];
        if (value > 0.001) {
          value = Math.pow(value, 1 / this.nest.freedom);
          value = Math.max(0, value);
        } else {
          value = 0;
        }

        total += value;
      }
      sumOfValues += total;
      values.push(total);
    }

    if (sumOfValues === 0) {
      // if (this.food) {
      // this.turnRandomly();
      // } else {
      this.turnSlightly();
      // }
      return false;
    }

    if (chooseBest) {
      let bestValue = 0;
      let bestIndex = 0;
      for (let i = 0; i < values.length; i++) {
        if (values[i] > bestValue) {
          bestValue = values[i];
          bestIndex = i;
        }
      }

      if (bestIndex) {
        this.velocity.rotate(sampler.angleSamples[bestIndex]);
      }
    } else {
      let currentValue = 0;
      const r = Math.random() * sumOfValues;
      for (let i = 0; i < values.length; i++) {
        currentValue += values[i];
        if (r <= currentValue) {
          this.velocity.rotate(sampler.angleSamples[i]);
          return true;
        }
      }
    }

    this.turnSlightly();
    return false;
  }

  toFood() {
    if (this.energy <= this.maxEnergy * 0.6) {
      this.enterToHome();
      return;
    }

    const foodField = this.nest.garden.foodField;
    const index = foodField.getIndex(this.sprite.x, this.sprite.y);
    const food = foodField.data[index];
    if (food > 0) {
      foodField.data[index]--;
      this.nest.foodHereField.data[index] = 100;
      this.food = 1;
      this.enterToHome();
    } else if (this.nest.foodHereField.data[index] > 0) {
      this.noFood = true;
      this.nest.foodHereField.data[index]--;
    }
  }

  toHome() {
    const distanceToNest = getDistanceBetween(
      this.sprite.x,
      this.sprite.y,
      this.nest.sprite.x,
      this.nest.sprite.y
    );
    if (distanceToNest < 40) {
      this.visitNest();
    }
  }

  visitNest() {
    this.pheromoneStrength = this.maxPheromoneStrength;
    if (this.food) {
      this.nest.addFood(3);
      this.food = 0;
    }
    this.nest.feedAnt(this);
    if (this.energy < this.maxEnergy) {
      return;
    }
    this.enterToFood();
  }

  dropPheromone(index: number, pheromone: PheromoneField, value: number) {
    const max = this.pheromoneStrength / this.maxPheromoneStrength;
    pheromone.dropPheromone(index, value, max);
  }

  turnAround() {
    this.velocity.rotate(Math.PI);
  }

  turnRandomly() {
    this.velocity.rotate(Math.PI * 2 * Math.random());
  }

  turnSlightly() {
    this.velocity.rotate(
      (Math.random() - 0.5) / simulationSettings.antSeekRandomness
    );
  }

  turnStrongly() {
    const r = Math.random();
    const c = r > 0.5 ? -Math.PI / 6 : Math.PI / 6;
    this.velocity.rotate(
      ((r - 0.5) / simulationSettings.antSeekRandomness) * 3 + c
    );
  }

  die() {
    const index = this.nest.garden.foodField.getIndex(
      this.sprite.x,
      this.sprite.y
    );
    this.nest.garden.foodField.data[index] += 20;
    this.nest.deadAnts++;
    this.destroy();
  }
}
