import { getDistanceBetween } from "@/utils/distance";
import { Vec } from "@/utils/vector";
import { Sprite } from "pixi.js";
import type { Colony } from "./colony";
import type { PheromoneField } from "./pheromone";
import {
  getPheromoneSampler,
  simulationSettings,
  type FieldSampler,
} from "./settings";
import { resources } from "@/canvas/resources";
import { Corpse } from "./corpse";
import { FIELD_CELL_SIZE } from "./const";
import { getAnglesDiff } from "@/utils/rotation";

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

const properDirectionSampler: FieldSampler = {
  angle: Math.PI * 2,
  angleSamplesCount: 2,
  distanceSamplesCount: 5,
  angleSamples: [0, Math.PI],
};

export class Ant {
  sprite: Sprite;
  velocity: Vec;
  maxEnergy = 10 + (Math.random() - 0.5) * 1.6;
  energy = this.maxEnergy;
  mode: AntMode = AntMode.toFood;

  healthPoints: number;
  maxHealthPoints: number;

  lastCellIndex = 0;
  lastAntCellIndex = 0;
  updatedLastAntCell = false;

  food = 0;

  isStopped = false;

  // Worker repel settings.
  workerMaxRepelTicks = 4000;
  workerRepelTimeout = 150;
  workerRepelStrength = 1.1;
  toFoodRepelMarkerStrength = 100;

  // Soldier repel settings.
  soldierMaxRepelTicks = 6000;
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

  constructor(
    public type: AntType,
    x: number,
    y: number,
    public colony: Colony
  ) {
    this.velocity = new Vec(0, this.type === AntType.worker ? 4 : 5);
    this.maxHealthPoints =
      this.type === AntType.worker ? 30 : 200 + 100 * (Math.random() - 0.5);
    this.healthPoints = this.maxHealthPoints;

    const texture =
      this.type === AntType.worker ? "ant.png" : "ant-soldier.png";
    this.sprite = new Sprite(resources.atlas!.textures[texture]);

    this.sprite.anchor.set(0.5);
    this.sprite.scale.x = 0.4;
    this.sprite.scale.y = 0.4;

    this.sprite.x = x;
    this.sprite.y = y;
    this.sprite.zIndex = 1;
    this.sprite.tint = colony.color;

    colony.garden.antsContainer.addChild(this.sprite);

    this.velocity.rotate(Math.random() * Math.PI * 2);

    if (this.type === AntType.worker) {
      this.pheromoneToFollow = colony.toFoodField;
    } else {
      this.pheromoneToFollow = colony.toEnemyField;
    }
    this.pheromoneToDrop = colony.toHomeField;
  }

  destroy() {
    if (this.isInAntsMap) {
      const ants = this.colony.garden.antsMap[this.lastAntCellIndex];
      const index = ants.indexOf(this);
      if (index !== -1) {
        ants.splice(index, 1);
      }
    }
    if (this.updatedLastAntCell) {
      this.colony.garden.antsField.data[this.lastAntCellIndex] ^=
        this.colony.bitId;
    }

    this.colony.onAntDied(this);

    this.colony.ants.splice(this.colony.ants.indexOf(this), 1);
    this.colony.garden.ants.splice(this.colony.garden.ants.indexOf(this), 1);
    this.sprite.destroy();
  }

  fastTick() {
    this.energy -= 0.00004;
    this.pheromoneStrength *= 0.9997;

    const antsField = this.colony.garden.antsField;

    if (this.energy <= 0) {
      this.die();
      this.colony.stats.starvedAnts++;
      return false;
    }

    this.sprite.x += this.velocity.x;
    this.sprite.y += this.velocity.y;
    this.sprite.rotation = this.velocity.rotation() + Math.PI / 2;

    const x = Math.max(
      1,
      Math.min(this.colony.garden.width - 1, this.sprite.x)
    );
    const y = Math.max(
      1,
      Math.min(this.colony.garden.height - 1, this.sprite.y)
    );

    const antsFieldIndex = antsField.getIndex(x, y);
    const rockField = this.colony.garden.rockField;
    let fieldIndex = rockField.getIndex(x, y);

    /** Colision checking. */
    if (rockField.data[fieldIndex] > 0) {
      this.sprite.x -= this.velocity.x;
      this.sprite.y -= this.velocity.y;

      const x = Math.max(
        1,
        Math.min(this.colony.garden.width - 1, this.sprite.x)
      );
      const y = Math.max(
        1,
        Math.min(this.colony.garden.height - 1, this.sprite.y)
      );

      fieldIndex = rockField.getIndex(x, y);

      this.resolveColision(fieldIndex);
      return true;
    }

    /** Repel timeout check. */
    if (this.repelTicksLeft) {
      this.repelTicksLeft--;
      if (this.repelTicksLeft <= 0) {
        this.enterToHome();
      }
    }

    /** Map boundaries checking. */
    if (this.sprite.x < 1) {
      this.sprite.x = 1;
      this.turnRandomly();
    }
    if (this.sprite.x > this.colony.garden.width - 1) {
      this.sprite.x = this.colony.garden.width - 1;
      this.turnRandomly();
    }
    if (this.sprite.y < 1) {
      this.sprite.y = 1;
      this.turnRandomly();
    }
    if (this.sprite.y > this.colony.garden.height - 1) {
      this.sprite.y = this.colony.garden.height - 1;
      this.turnRandomly();
    }

    /**
     * Updating antsField with bitId.
     * This is a mechanism of a fast enemy detection. Each colony has a bit flag (bitId) and the map is divided into cells (antsField). When the ant enters the cell, it sets the flag on the cell. When it leaves the cell, it removes it. When the ant sees a flag which doesn't match its colony, then there is an enemy nearby.
     */
    if (antsFieldIndex !== this.lastAntCellIndex) {
      // Changing cell.
      if (this.isInAntsMap) {
        // Unregister from previous cell.
        const ants = this.colony.garden.antsMap[this.lastAntCellIndex];
        const index = ants.indexOf(this);
        if (index !== -1) {
          ants.splice(index, 1);
        }
        this.isInAntsMap = false;
      }

      if (this.updatedLastAntCell) {
        // Remove bitId from last cell.
        antsField.data[this.lastAntCellIndex] ^= this.colony.bitId;
      }

      // Check if flag has to be set.
      if ((antsField.data[antsFieldIndex] & this.colony.bitId) === 0) {
        antsField.data[antsFieldIndex] |= this.colony.bitId;
        this.updatedLastAntCell = true;
      } else {
        this.updatedLastAntCell = false;
      }

      if (antsField.data[antsFieldIndex] !== this.colony.bitId) {
        // There is an enemy nearby.
        if (this.type === AntType.worker) {
          // Workers should just flee.
          this.enterToHomeSeeEnemy();
          this.colony.enemyHereField.data[fieldIndex] =
            this.toEnemyRepelMarkerStrength;
        }
      }
      this.lastAntCellIndex = antsFieldIndex;
    }

    /** Processing fighting mechanics.  */
    if (this.targetAnt) {
      if (this.targetAnt.healthPoints > 0 && this.targetAnt.energy > 0) {
        this.attackAnt(this.targetAnt);
      } else {
        this.targetAnt = null;
      }
    } else if (antsField.data[antsFieldIndex] !== this.colony.bitId) {
      if (!this.isInAntsMap) {
        // Add the ant to the list of ants in this cell. The soldiers use this list to query the closest enemy ant to attack. This is done only when the ant senses an enemy nearby for performance reasons.
        this.colony.garden.antsMap[antsFieldIndex].push(this);
        this.isInAntsMap = true;
      }

      if (this.type === AntType.soldier) {
        if (this.colony.enemyHereField.data[fieldIndex]) {
          this.repelToEnemy();
          this.colony.enemyHereField.data[fieldIndex]--;
        }
        this.attackClosesAnt(antsFieldIndex);
      }
    }

    /** Dropping pheromone trails. */
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
    for (const ant of this.colony.garden.antsMap[antsFieldindex]) {
      if (ant.colony === this.colony) {
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
        this.colony.stats.killedEnemyAnts++;
        ant.colony.stats.killedAnts++;
      }
      const distanceToMove = 25 - distance;
      const moveVec = newVel.copy();
      moveVec.normalize();
      moveVec.rotate(Math.PI);
      moveVec.mulScalar(distanceToMove);
      this.sprite.x += moveVec.x;
      this.sprite.y += moveVec.y;
      if (Math.random() > 0.9) {
        this.turnStrongly(0.3);
      }
    }
  }

  slowTick() {
    this.followField(
      this.pheromoneToFollow,
      simulationSettings.performance.pheromoneSampler,
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

    if (!isFollowing && this.mode === AntMode.toFood && Math.random() > 0.5) {
      // If the ant goes upward the gradient of toHome then turn around.
      // This makes the ants much better at solving mazes as they penetrate it faster instead of circling around nest.
      // On the other, hand this leads to ants gathering and stucking in dead ends corridors.
      // The Math.random is a simple trick that allows the ants to escape dead ends quicker.
      const [sumOfValues, values] = this.sampleNeighbourhood(
        this.colony.toHomeField,
        properDirectionSampler
      );
      if (values[1] < values[0]) {
        this.turnAround();
        this.turnStrongly(0.3);
      }
    }

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
    const rock = this.colony.garden.rockField;
    const rockData = rock.data;
    const rot = this.velocity.rotation();
    const halfPi = Math.PI / 2;

    if (rot < -halfPi) {
      if (rockData[index - 1] === 0) {
        this.velocity.rotateTo(Math.PI);
        return;
      } else if (rockData[index - rock.width] === 0) {
        this.velocity.rotateTo(-halfPi);
        return;
      }
    } else if (rot >= halfPi) {
      if (rockData[index - 1] === 0) {
        this.velocity.rotateTo(Math.PI);
        return;
      } else if (rockData[index + rock.width] === 0) {
        this.velocity.rotateTo(halfPi);
        return;
      }
    } else if (rot < 0) {
      if (rockData[index - rock.width] === 0) {
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
      } else if (rockData[index + rock.width] === 0) {
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
    this.pheromoneToFollow = this.colony.toHomeField;
    this.pheromoneToDrop = null;
    if (this.type === AntType.worker) {
      if (this.food > 0) {
        this.sprite.texture = resources.atlas!.textures["ant-with-food.png"];
        this.pheromoneToDrop = this.colony.toFoodField;
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
    this.pheromoneToFollow = this.colony.toHomeField;
    this.pheromoneToDrop = this.colony.toEnemyField;
  }

  enterToFood() {
    this.mode = AntMode.toFood;
    this.turnAround();
    this.resetRepel();
    this.pheromoneToFollow = this.colony.toFoodField;
    this.pheromoneToDrop = this.colony.toHomeField;
    this.sprite.texture = resources.atlas!.textures["ant.png"];
  }

  enterToEnemy() {
    this.mode = AntMode.toEnemy;
    this.turnAround();
    this.resetRepel();
    this.pheromoneToFollow = this.colony.toEnemyField;
    this.pheromoneToDrop = this.colony.toHomeField;
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
    this.pheromoneToRepel = this.colony.toFoodField;
  }

  repelToEnemy() {
    this.maxRepelTicksLeft = this.soldierMaxRepelTicks;
    this.repelTicksLeft = this.soldierMaxRepelTicks;
    this.repelTimeout = this.soldierRepelTimeout;
    this.repelStrength = this.solderRepelStrength;
    this.pheromoneToRepel = this.colony.toEnemyField;
  }

  followField(
    field: PheromoneField,
    sampler: FieldSampler,
    chooseBest: boolean
  ) {
    const [maxValue, values] = this.sampleNeighbourhood(field, sampler);

    if (maxValue === 0) {
      this.turnSlightly();
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
        this.turnSlightly();
      }
      return false;
    }

    let sumOfValues = 0;
    for (let i = 0; i < values.length; i++) {
      values[i] = Math.pow(values[i] / maxValue, 1 / this.colony.freedom);
      sumOfValues += values[i];
    }

    let currentValue = 0;
    const r = Math.random() * sumOfValues;
    for (let i = 0; i < values.length; i++) {
      currentValue += values[i];
      if (r <= currentValue) {
        const angle = sampler.angleSamples[i];
        this.velocity.rotate(angle);
        return true;
      }
    }

    this.turnSlightly();
    return false;
  }

  sampleNeighbourhood(
    field: PheromoneField,
    sampler: FieldSampler
  ): [number, number[]] {
    let maxValue = 0;
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

        if (this.colony.garden.rockField.data[index]) {
          total = 0;
          break;
        }

        if (
          this.mode === AntMode.toFood &&
          this.colony.garden.foodField.data[index]
        ) {
          total += 10000;
          break;
        }

        value = field.maxValues.data[index];
        if (value > 0.001) {
          value = Math.pow(value, 1 / this.colony.freedom);
          value = Math.max(0, value);
        } else {
          value = 0;
        }

        total += value;
      }
      if (total > maxValue) {
        maxValue = total;
      }
      values.push(total);
    }

    return [maxValue, values];
  }

  toFood() {
    if (this.energy <= this.maxEnergy * 0.6) {
      this.enterToHome();
      return;
    }

    const foodField = this.colony.garden.foodField;
    const index = foodField.getIndex(this.sprite.x, this.sprite.y);
    const food = foodField.data[index];
    if (food > 0) {
      foodField.data[index]--;
      this.colony.foodHereField.data[index] = this.toFoodRepelMarkerStrength;
      this.food = 1;
      this.enterToHome();
    } else if (this.colony.foodHereField.data[index] > 0) {
      this.repelToFood();
      this.colony.foodHereField.data[index]--;
    }
  }

  toHome() {
    const distanceToColony = getDistanceBetween(
      this.sprite.x,
      this.sprite.y,
      this.colony.sprite.x,
      this.colony.sprite.y
    );
    if (distanceToColony < 40) {
      this.visitColony();
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

  visitColony() {
    this.healthPoints = this.maxHealthPoints;
    this.pheromoneStrength = this.maxPheromoneStrength;
    if (this.food) {
      this.colony.addFood(3);
      this.food = 0;
    }
    this.colony.visit(this);
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

  turn() {
    this.velocity.rotate(
      (Math.random() - 0.5) / simulationSettings.antSeekRandomness
    );
  }

  turnStrongly(power: number) {
    this.velocity.rotate((Math.random() - 0.5) * power);
  }

  die() {
    const corpse = new Corpse(this);
    this.colony.garden.corpses.push(corpse);

    // const index = this.colony.garden.foodField.getIndex(
    //   this.sprite.x,
    //   this.sprite.y
    // );
    // this.colony.garden.foodField.data[index] += 10;

    this.destroy();
  }
}
