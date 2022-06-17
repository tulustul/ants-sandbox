import { getDistanceBetween } from "@/utils/distance";
import { Vec } from "@/utils/vector";
import { Sprite } from "pixi.js";
import type { Nest } from "./nest";
import type { PheromoneField } from "./pheromone";
import { simulationSettings, type FieldSampler } from "./settings";
import { resources } from "@/canvas/resources";
import { Corpse } from "./corpse";
import { FIELD_CELL_SIZE } from "./const";
import type { Field } from "./field";

export enum AntMode {
  toFood,
  toHome,
  toEnemy,
  smellsFood,
}

export enum AntType {
  worker,
  soldier,
}

export class Ant {
  sprite: Sprite;
  velocity: Vec;
  maxEnergy = 1 + (Math.random() - 0.5) * 0.6;
  energy = this.maxEnergy;
  mode: AntMode = AntMode.toFood;

  healthPoints: number;
  maxHealthPoints: number;

  followPoint: Vec | null = null;

  lastCellIndex = 0;
  lastAntCellIndex = 0;
  updatedLastAntCell = false;

  food = 0;

  isStopped = false;

  // Worker repel settings.
  workerMaxRepelTicks = 2000;
  workerRepelTimeout = 150;
  workerRepelStrength = 1.1;
  toFoodRepelMarkerStrength = 100;

  // Soldier repel settings.
  soldierMaxRepelTicks = 3000;
  soldierRepelTimeout = 500;
  solderRepelStrength = 1.5;
  toEnemyRepelMarkerStrength = 200;

  // Repel props.
  maxRepelTicksLeft = 0;
  repelTicksLeft = 0;
  repelTimeout = 0;
  repelStrength = 0;

  pheromoneToFollow: PheromoneField;
  pheromoneToDrop: PheromoneField | null;
  pheromoneToRepel: PheromoneField | null = null;
  maxPheromoneStrength = 0.01;
  pheromoneStrength = this.maxPheromoneStrength;

  targetAnt: Ant | null = null;

  isInAntsMap = false;

  constructor(public type: AntType, x: number, y: number, public nest: Nest) {
    this.velocity = new Vec(0, this.type === AntType.worker ? 4 : 5);
    this.maxHealthPoints =
      this.type === AntType.worker ? 30 : 200 + 100 * (Math.random() - 0.5);
    this.healthPoints = this.maxHealthPoints;

    const texture =
      this.type === AntType.worker ? "ant.png" : "ant-soldier.png";
    this.sprite = new Sprite(resources.atlas!.textures[texture]);

    this.sprite.anchor.set(0.5);
    if (this.type === AntType.soldier) {
      this.sprite.scale.x = 1.25;
      this.sprite.scale.y = 1.25;
    }

    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.zIndex = 1;
    this.sprite.tint = nest.color;

    nest.garden.antsContainer.addChild(this.sprite);

    this.velocity.rotate(Math.random() * Math.PI * 2);

    if (this.type === AntType.worker) {
      this.pheromoneToFollow = nest.toFoodField;
    } else {
      this.pheromoneToFollow = nest.toEnemyField;
    }
    this.pheromoneToDrop = nest.toHomeField;
  }

  destroy() {
    if (this.isInAntsMap) {
      const ants = this.nest.garden.antsMap[this.lastAntCellIndex];
      const index = ants.indexOf(this);
      if (index !== -1) {
        ants.splice(index, 1);
      }
    }
    if (this.updatedLastAntCell) {
      this.nest.garden.antsField.data[this.lastAntCellIndex] /=
        this.nest.primeId;
    }

    this.nest.onAntDied(this);

    this.nest.ants.splice(this.nest.ants.indexOf(this), 1);
    this.nest.garden.ants.splice(this.nest.garden.ants.indexOf(this), 1);
    this.sprite.destroy();
  }

  fastTick() {
    this.energy -= 0.00004;
    this.pheromoneStrength *= 0.9997;

    const antsField = this.nest.garden.antsField;

    if (this.energy <= 0) {
      this.die();
      this.nest.stats.starvedAnts++;
      return false;
    }

    this.sprite.x += this.velocity.x;
    this.sprite.y += this.velocity.y;
    this.sprite.rotation = this.velocity.rotation() + Math.PI / 2;

    let x = Math.max(1, Math.min(this.nest.garden.width - 1, this.sprite.x));
    let y = Math.max(1, Math.min(this.nest.garden.height - 1, this.sprite.y));

    const antsFieldIndex = antsField.getIndex(x, y);
    const rockField = this.nest.garden.rockField;
    let fieldIndex = rockField.getIndex(x, y);

    if (rockField.data[fieldIndex] > 0) {
      this.sprite.x -= this.velocity.x;
      this.sprite.y -= this.velocity.y;

      let x = Math.max(1, Math.min(this.nest.garden.width - 1, this.sprite.x));
      let y = Math.max(1, Math.min(this.nest.garden.height - 1, this.sprite.y));

      fieldIndex = rockField.getIndex(x, y);

      this.resolveColision(fieldIndex);
      return true;
    }

    if (this.repelTicksLeft) {
      this.repelTicksLeft--;
      if (this.repelTicksLeft <= 0) {
        this.pheromoneToRepel = null;
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

    if (antsFieldIndex !== this.lastAntCellIndex) {
      if (this.isInAntsMap) {
        const ants = this.nest.garden.antsMap[this.lastAntCellIndex];
        const index = ants.indexOf(this);
        if (index !== -1) {
          ants.splice(index, 1);
        }
        this.isInAntsMap = false;
      }

      if (this.updatedLastAntCell) {
        antsField.data[this.lastAntCellIndex] /= this.nest.primeId;
      }

      if (antsField.data[antsFieldIndex] % this.nest.primeId !== 0) {
        antsField.data[antsFieldIndex] *= this.nest.primeId;
        this.updatedLastAntCell = true;
      } else {
        this.updatedLastAntCell = false;
      }

      if (antsField.data[antsFieldIndex] !== this.nest.primeId) {
        if (this.type === AntType.worker) {
          this.enterToHomeSeeEnemy();
          this.nest.enemyHereField.data[fieldIndex] =
            this.toEnemyRepelMarkerStrength;
        }
      }
      this.lastAntCellIndex = antsFieldIndex;
    }

    if (this.targetAnt) {
      if (this.targetAnt.healthPoints > 0 && this.targetAnt.energy > 0) {
        this.attackAnt(this.targetAnt);
      } else {
        this.targetAnt = null;
      }
    } else if (antsField.data[antsFieldIndex] !== this.nest.primeId) {
      if (!this.isInAntsMap) {
        this.nest.garden.antsMap[antsFieldIndex].push(this);
        this.isInAntsMap = true;
      }

      if (this.type === AntType.soldier) {
        if (this.nest.enemyHereField.data[fieldIndex]) {
          this.repelToEnemy();
          this.nest.enemyHereField.data[fieldIndex]--;
        }
        this.attackClosesAnt(antsFieldIndex);
      }
    }

    if (fieldIndex !== this.lastCellIndex) {
      if (this.pheromoneToRepel) {
        if (this.repelTicksLeft < this.maxRepelTicksLeft - this.repelTimeout) {
          this.repelPheromone(
            fieldIndex,
            this.pheromoneToRepel,
            this.repelStrength
          );
        }
      }
      if (this.pheromoneToDrop) {
        this.dropPheromone(
          fieldIndex,
          this.pheromoneToDrop,
          this.pheromoneStrength
        );
      }
      this.lastCellIndex = fieldIndex;
    }

    return true;
  }

  attackClosesAnt(antsFieldindex: number) {
    let closestDistance = Infinity;
    let closestAnt: Ant | null = null;
    for (const ant of this.nest.garden.antsMap[antsFieldindex]) {
      if (ant.nest === this.nest) {
        continue;
      }
      const distance = getDistanceBetween(
        this.sprite.x,
        this.sprite.y,
        ant.sprite.x,
        ant.sprite.y
      );
      if (distance < closestDistance) {
        closestDistance = distance;
        closestAnt = ant;
      }
    }

    if (closestAnt) {
      this.attackAnt(closestAnt);
    }
  }

  attackAnt(ant: Ant) {
    const newVel = new Vec(ant.sprite.x, ant.sprite.y);
    newVel.sub(new Vec(this.sprite.x, this.sprite.y));
    newVel.normalize();
    newVel.mulScalar(6);
    this.velocity = newVel;

    const distance = getDistanceBetween(
      this.sprite.x,
      this.sprite.y,
      ant.sprite.x,
      ant.sprite.y
    );

    if (distance < 30) {
      ant.healthPoints--;
      if (ant.healthPoints <= 0) {
        ant.die();
        this.nest.stats.killedEnemyAnts++;
        ant.nest.stats.killedAnts++;
      }
    }
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
    const isFollowing = this.followField(
      this.pheromoneToFollow,
      simulationSettings.performance.preciseFieldSampler,
      true
    );

    // if (!isFollowing && this.mode === AntMode.toFood) {
    //   const sampler = simulationSettings.performance.preciseFieldSampler;
    //   const [sumOfValues, values] = this.sampleNeighbourhood(
    //     this.nest.toHomeField,
    //     sampler
    //   );

    //   let currentValue = 0;
    //   const r = Math.random() * sumOfValues;
    //   for (let i = 0; i < values.length; i++) {
    //     if (values[i] === 0) {
    //       this.velocity.rotate(sampler.angleSamples[i]);
    //       return;
    //     }
    //     // currentValue += 1 - values[i];
    //     // if (r <= currentValue) {
    //     //   this.velocity.rotate(sampler.angleSamples[i]);
    //     //   return;
    //     // }
    //   }
    // }

    this.brainTick();
  }

  brainTick() {
    if (this.mode === AntMode.toFood) {
      this.toFood();
    } else if (this.mode === AntMode.toHome) {
      this.toHome();
    } else if (this.mode === AntMode.toEnemy) {
      this.toEnemy();
    }
  }

  resolveColision(index: number) {
    const rock = this.nest.garden.rockField;
    const rockData = rock.data;
    const rot = this.velocity.rotation();
    const halfPi = Math.PI / 2;

    if (rot < -halfPi) {
      if (rockData[index - 1] === 0) {
        this.velocity.rotateTo(Math.PI);
        return;
      } else if (rockData[index - rock.height] === 0) {
        this.velocity.rotateTo(-halfPi);
        return;
      }
    } else if (rot >= halfPi) {
      if (rockData[index - 1] === 0) {
        this.velocity.rotateTo(Math.PI);
        return;
      } else if (rockData[index + rock.height] === 0) {
        this.velocity.rotateTo(halfPi);
        return;
      }
    } else if (rot < 0) {
      if (rockData[index - rock.height] === 0) {
        this.velocity.rotateTo(-halfPi);
        return;
      } else if (rockData[index + 1] === 0) {
        this.velocity.rotateTo(0);
        return;
      }
    } else if (rot >= 0) {
      if (rockData[index + 1] === 0) {
        this.velocity.rotateTo(0);
        return;
      } else if (rockData[index + rock.height] === 0) {
        this.velocity.rotateTo(halfPi);
        return;
      }
    }

    this.turnRandomly();
  }

  enterToHome() {
    this.mode = AntMode.toHome;
    this.turnAround();
    this.resetRepel();
    this.pheromoneStrength = this.maxPheromoneStrength;
    this.pheromoneToFollow = this.nest.toHomeField;
    this.pheromoneToDrop = null;
    if (this.type === AntType.worker) {
      if (this.food > 0) {
        this.sprite.texture = resources.atlas!.textures["ant-with-food.png"];
        this.pheromoneToDrop = this.nest.toFoodField;
      } else {
        this.repelToFood();
      }
    } else {
      this.repelToEnemy();
    }
  }

  enterToHomeSeeEnemy() {
    if (this.mode !== AntMode.toHome) {
      this.mode = AntMode.toHome;
      this.turnAround();
    }
    this.resetRepel();
    this.pheromoneStrength = this.maxPheromoneStrength;
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

  enterToEnemy() {
    this.mode = AntMode.toEnemy;
    this.turnAround();
    this.resetRepel();
    this.pheromoneToFollow = this.nest.toEnemyField;
    this.pheromoneToDrop = this.nest.toHomeField;
  }

  resetRepel() {
    this.repelTicksLeft = 0;
    this.pheromoneToRepel = null;
  }

  repelToFood() {
    this.maxRepelTicksLeft = this.workerMaxRepelTicks;
    this.repelTicksLeft = this.workerMaxRepelTicks;
    this.repelTimeout = this.workerRepelTimeout;
    this.repelStrength = this.workerRepelStrength;
    this.pheromoneToRepel = this.nest.toFoodField;
  }

  repelToEnemy() {
    this.maxRepelTicksLeft = this.soldierMaxRepelTicks;
    this.repelTicksLeft = this.soldierMaxRepelTicks;
    this.repelTimeout = this.soldierRepelTimeout;
    this.repelStrength = this.solderRepelStrength;
    this.pheromoneToRepel = this.nest.toEnemyField;
  }

  followField(
    field: PheromoneField,
    sampler: FieldSampler,
    chooseBest: boolean
  ) {
    const [sumOfValues, values] = this.sampleNeighbourhood(field, sampler);

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

  sampleNeighbourhood(
    field: PheromoneField,
    sampler: FieldSampler
  ): [number, number[]] {
    let sumOfValues = 0;
    const values: number[] = [];

    for (const angle of sampler.angleSamples) {
      let total = 0;
      for (let i = 1; i <= sampler.distanceSamplesCount; i++) {
        const vec = new Vec(0, FIELD_CELL_SIZE * i);
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

    return [sumOfValues, values];
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
      this.nest.foodHereField.data[index] = this.toFoodRepelMarkerStrength;
      this.food = 1;
      this.enterToHome();
    } else if (this.nest.foodHereField.data[index] > 0) {
      this.repelToFood();
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

  toEnemy() {
    if (this.energy <= this.maxEnergy * 0.6) {
      this.enterToHome();
      return;
    }
    if (
      this.repelTicksLeft &&
      this.repelTicksLeft < this.maxRepelTicksLeft - this.repelTimeout
    ) {
      this.enterToHome();
    }
  }

  visitNest() {
    this.healthPoints = this.maxHealthPoints;
    this.pheromoneStrength = this.maxPheromoneStrength;
    if (this.food) {
      this.nest.addFood(3);
      this.food = 0;
    }
    this.nest.visit(this);
    if (this.energy < this.maxEnergy) {
      return;
    }
    if (this.type === AntType.worker) {
      this.enterToFood();
    } else {
      this.enterToEnemy();
    }
  }

  dropPheromone(index: number, pheromone: PheromoneField, value: number) {
    const max = this.pheromoneStrength / this.maxPheromoneStrength;
    pheromone.dropPheromone(index, value, max);
  }

  repelPheromone(index: number, pheromone: PheromoneField, value: number) {
    pheromone.repelPheromone(index, value);
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
    const corpse = new Corpse(this);
    this.nest.garden.corpses.push(corpse);

    // const index = this.nest.garden.foodField.getIndex(
    //   this.sprite.x,
    //   this.sprite.y
    // );
    // this.nest.garden.foodField.data[index] += 10;

    this.destroy();
  }
}
