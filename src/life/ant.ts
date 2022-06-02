import { getDistanceBetween } from "@/utils/distance";
import { Vec } from "@/utils/vector";
import { Sprite } from "pixi.js";
import type { Field } from "./field";
import type { Nest } from "./nest";
import type { PheromoneField } from "./pheromone";
import { simulationSettings } from "./simulation";
import antUrl from "@/assets/ant.png";

export enum AntMode {
  toFood,
  toHome,
  smellsFood,
}

const followStrength = 0.02;
const repelStrength = 0.04;

const fastSampleAngle = Math.PI / 4;
const fastAngleSamplesCount = 5;
const fastDistaceSamples = 3;
const fastAngleSamples = getAngleSamples(
  fastSampleAngle,
  fastAngleSamplesCount
);

const slowSampleAngle = Math.PI * 2;
const slowAngleSamplesCount = 20;
const slowDistaceSamples = 5;
const slowAngleSamples = getAngleSamples(
  slowSampleAngle,
  slowAngleSamplesCount
);

function getAngleSamples(angle: number, samplesCount: number) {
  const angleStep = angle / (samplesCount - 1);
  const samples: number[] = [];
  for (
    let curAngle = -angle / 2;
    curAngle <= angle / 2;
    curAngle += angleStep
  ) {
    samples.push(curAngle);
  }
  return samples;
}

export class Ant {
  sprite: Sprite;
  velocity = new Vec(0, 5);
  maxEnergy = 1 + (Math.random() - 0.5) * 0.6;
  energy = this.maxEnergy;
  mode: AntMode = AntMode.toFood;

  followPoint: Vec | null = null;

  lastCellIndex = 0;

  food = 0;

  noFood = false;

  isStopped = false;

  repelTicks = 0;
  maxRepelTicks = 5000;

  pheromoneToFollow: PheromoneField;
  pheromoneToDrop: PheromoneField;
  maxPheromoneStrength = 0.01;
  pheromoneStrength = this.maxPheromoneStrength;

  constructor(x: number, y: number, public nest: Nest) {
    this.sprite = Sprite.from(antUrl);

    this.sprite.anchor.set(0.5);

    this.sprite.x = x;
    this.sprite.y = y;

    this.sprite.tint = nest.color;

    nest.app.stage.addChild(this.sprite);

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

    if (this.energy <= 0) {
      this.die();
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

    this.dropPheromone(this.pheromoneToDrop, this.pheromoneStrength);

    if (this.noFood) {
      this.dropPheromone(this.nest.toFoodField, -this.pheromoneStrength, true);
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

    return true;
  }

  slowTick() {
    this.followField(
      this.pheromoneToFollow,
      fastAngleSamples,
      fastDistaceSamples,
      false
    );
    this.brainTick();
  }

  preciseTick() {
    this.followField(
      this.pheromoneToFollow,
      slowAngleSamples,
      slowDistaceSamples,
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
      this.sprite.tint = 0x55ff55;
      this.pheromoneToDrop = this.nest.toFoodField;
    }
  }

  enterToFood() {
    this.mode = AntMode.toFood;
    this.turnAround();
    this.resetRepel();
    this.pheromoneToFollow = this.nest.toFoodField;
    this.pheromoneToDrop = this.nest.toHomeField;
    this.sprite.tint = this.nest.color;
  }

  resetRepel() {
    this.noFood = false;
    this.repelTicks = 0;
  }

  followField(
    field: PheromoneField,
    angleSamples: number[],
    distanceSamples: number,
    chooseBest: boolean
  ) {
    let sumOfValues = 0;
    const values: number[] = [];

    for (const angle of angleSamples) {
      let total = 0;
      for (let i = 1; i <= distanceSamples; i++) {
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

        // value = Math.max(0, Math.pow(field.data[index], 1 / this.nest.freedom));
        // value = field.data[index] * Math.pow(field.maxValues.data[index], 3);
        value = field.maxValues.data[index];
        if (value > 0.00001) {
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
      if (this.food) {
        this.turnRandomly();
      } else {
        this.turnSlightly();
      }
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
        this.velocity.rotate(angleSamples[bestIndex]);
      }
    } else {
      let currentValue = 0;
      const r = Math.random() * sumOfValues;
      for (let i = 0; i < values.length; i++) {
        currentValue += values[i];
        if (r <= currentValue) {
          this.velocity.rotate(angleSamples[i]);
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
      this.nest.foodHereField.data[index] = 10;
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
    this.nest.addFood(3);
    this.nest.feedAnt(this);
    if (this.energy < this.maxEnergy) {
      return;
    }
    this.enterToFood();
  }

  dropPheromone(pheromone: PheromoneField, value: number, force = false) {
    const index = pheromone.getIndex(this.sprite.x, this.sprite.y);
    if (force || index !== this.lastCellIndex) {
      const max = this.pheromoneStrength / this.maxPheromoneStrength;
      pheromone.dropPheromone(index, value, max);
      this.lastCellIndex = index;
    }
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
    this.destroy();
  }
}
