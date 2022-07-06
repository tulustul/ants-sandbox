import { Sprite } from "pixi.js";

import { getDistanceBetween, Velocity, Vec } from "@/utils";
import { resources } from "@/canvas";

import type { Colony } from "./colony";
import type { PheromoneField } from "./pheromone";
import { simulationSettings, type FieldSampler } from "./settings";
import { Corpse } from "./corpse";
import { FIELD_CELL_SIZE } from "./const";

export const enum AntMode {
  toFood,
  toHome,
  toEnemy,
}

export const enum AntType {
  worker,
  soldier,
}

const properDirectionSampler: FieldSampler = {
  angle: Math.PI * 2,
  angleSamplesCount: 2,
  distanceSamplesCount: 5,
  angleSamples: [0, Math.PI],
};

const WORKER_MAX_DISPERSE_TICKS = 4000;
const SOLDIER_MAX_DISPERSE_TICKS = 6000;

const MAX_PHEROMONE_STRENGTH = 0.01;

// Worker pheromone disperse settings.
const WORKER_DISPERSE_TIMEOUT = 150;
const WORKER_DISPERSE_STRENGTH = 1.1;
const TO_FOOD_DISPERSE_MARKER_STRENGTH = 100;

// Soldier pheromone disperse settings.
const SOLDIER_DISPERSE_TIMEOUT = 500;
const SOLDER_DISPERSE_STRENGTH = 1.5;
const TO_ENEMY_DISPERSE_MARKER_STRENGTH = 200;

export class Ant {
  sprite: Sprite;
  velocity: Velocity;

  mode: AntMode;

  maxEnergy = 1 + (Math.random() - 0.5) * 1.6;
  energy = this.maxEnergy;

  healthPoints: number;
  maxHealthPoints: number;

  lastCellIndex = 0;
  lastAntCellIndex = 0;
  updatedLastAntCell = false;
  isInAntsMap = false;

  // The amount of food the ant is carrying.
  food = 0;

  // Pheromone disperse props.
  // Dispertion is process of removing a pheromone. If e.g. a source of food is depleted, the ants disperse the toFood pheromone to force other ants to look for a new source.
  maxDisperseTicksLeft = 0;
  disperseTicksLeft = 0;
  disperseTimeout = 0;
  disperseStrength = 0;

  pheromoneToFollow: PheromoneField;
  pheromoneToDrop: PheromoneField | null;
  pheromoneToDisperse: PheromoneField | null = null;
  pheromoneStrength = MAX_PHEROMONE_STRENGTH;

  // Ant that a soldier is chasing.
  targetAnt: Ant | null = null;

  // Needed to overcome an issue with soldiers trying to attack each other while being separated by a thin wall.
  attackAfterRockColisionTimeout = 0;

  constructor(
    public type: AntType,
    x: number,
    y: number,
    public colony: Colony
  ) {
    this.velocity = new Velocity(
      Math.random() * Math.PI * 2,
      this.type === AntType.worker ? 4 : 5
    );

    this.maxHealthPoints =
      this.type === AntType.worker ? 30 : 200 + 100 * (Math.random() - 0.5);
    this.healthPoints = this.maxHealthPoints;

    this.mode = this.type === AntType.worker ? AntMode.toFood : AntMode.toEnemy;

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

  /** Called in every simulation step.
   *
   * @returns True if the ant is still living. False otherwise.
   */
  fastTick() {
    this.energy -= 0.00004;
    this.pheromoneStrength *= 0.9997;

    if (this.energy <= 0) {
      this.die();
      this.colony.stats.starvedAnts++;
      return false;
    }

    this.updateSprite();

    this.checkAndResolveMapBoundaries(this.velocity.x, this.velocity.y);

    const [antsFieldIndex, fieldIndex] = this.getFieldsIndices();

    const newFieldIndex = this.processColisions(fieldIndex);
    this.processPheromoneDisperseTimeout();
    this.updateAntsField(newFieldIndex, antsFieldIndex);
    this.processFightMechanic(newFieldIndex, antsFieldIndex);

    if (newFieldIndex !== this.lastCellIndex) {
      this.processDroppingPheromone(newFieldIndex);
    }

    return true;
  }

  /** Called every few frames. Following the pheromone is a very expensive operation and performing it rarely greatly increases performance. */
  slowTick() {
    this.followField(
      this.pheromoneToFollow,
      simulationSettings.performance.pheromoneSampler,
      false
    );

    this.brainTick();
  }

  /**
   * Called once in a while. It uses more precise field sampler.
   * Fixes ant direction if it goes in the wrong way. A normal, quick sampling cannot do that.
   */
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

  getFieldsIndices() {
    const [x, y] = [this.sprite.x, this.sprite.y];
    return [
      this.colony.garden.antsField.getIndex(x, y),
      this.colony.garden.rockField.getIndex(x, y),
    ];
  }

  updateSprite() {
    this.sprite.x += this.velocity.x;
    this.sprite.y += this.velocity.y;
    this.sprite.rotation = this.velocity.rotation + Math.PI / 2;
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
    this.velocity = new Velocity(newVel.rotation(), newVel.length);

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

      if (this.colony.garden.rockField.getAt(this.sprite.x, this.sprite.y)) {
        // Don't teleport ants on rocks.
        this.sprite.x -= moveVec.x;
        this.sprite.y -= moveVec.y;
        return;
      }

      // Don't teleport ant beyond map.
      this.checkAndResolveMapBoundaries(moveVec.x, moveVec.y);

      if (Math.random() > 0.9) {
        this.turnStrongly(0.3);
      }
    }
  }

  resolveColision(index: number) {
    const rock = this.colony.garden.rockField;
    const rockData = rock.data;
    const rot = this.velocity.rotation;
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
    this.resetDisperse();
    this.pheromoneStrength = MAX_PHEROMONE_STRENGTH;
    this.pheromoneToFollow = this.colony.toHomeField;
    this.pheromoneToDrop = null;
    if (this.type === AntType.worker) {
      if (this.food > 0) {
        this.sprite.texture = resources.atlas!.textures["ant-with-food.png"];
        this.pheromoneToDrop = this.colony.toFoodField;
      } else {
        this.disperseToFood();
      }
    } else {
      this.disperseToEnemy();
    }
  }

  enterToHomeSeeEnemy() {
    if (this.mode !== AntMode.toHome) {
      this.mode = AntMode.toHome;
      this.turnAround();
    }
    this.resetDisperse();
    this.pheromoneStrength = MAX_PHEROMONE_STRENGTH;
    this.pheromoneToFollow = this.colony.toHomeField;
    this.pheromoneToDrop = this.colony.toEnemyField;
  }

  enterToFood() {
    this.mode = AntMode.toFood;
    this.turnAround();
    this.resetDisperse();
    this.pheromoneToFollow = this.colony.toFoodField;
    this.pheromoneToDrop = this.colony.toHomeField;
    this.sprite.texture = resources.atlas!.textures["ant.png"];
  }

  enterToEnemy() {
    this.mode = AntMode.toEnemy;
    this.turnAround();
    this.resetDisperse();
    this.pheromoneToFollow = this.colony.toEnemyField;
    this.pheromoneToDrop = this.colony.toHomeField;
  }

  resetDisperse() {
    this.disperseTicksLeft = 0;
    this.pheromoneToDisperse = null;
  }

  disperseToFood() {
    this.maxDisperseTicksLeft = WORKER_MAX_DISPERSE_TICKS;
    this.disperseTicksLeft = WORKER_MAX_DISPERSE_TICKS;
    this.disperseTimeout = WORKER_DISPERSE_TIMEOUT;
    this.disperseStrength = WORKER_DISPERSE_STRENGTH;
    this.pheromoneToDisperse = this.colony.toFoodField;
  }

  disperseToEnemy() {
    this.maxDisperseTicksLeft = SOLDIER_MAX_DISPERSE_TICKS;
    this.disperseTicksLeft = SOLDIER_MAX_DISPERSE_TICKS;
    this.disperseTimeout = SOLDIER_DISPERSE_TIMEOUT;
    this.disperseStrength = SOLDER_DISPERSE_STRENGTH;
    this.pheromoneToDisperse = this.colony.toEnemyField;
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

    const freedom = 1 / this.colony.freedom;

    let sumOfValues = 0;
    for (let i = 0; i < values.length; i++) {
      values[i] = (values[i] / maxValue) ** freedom;
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
    const rot = this.velocity.rotation;
    const [spriteX, spriteY] = [this.sprite.x, this.sprite.y];
    const rockData = this.colony.garden.rockField.data;
    const foodData = this.colony.garden.foodField.data;
    const fieldData = field.maxValues.data;
    const freedom = 1 / this.colony.freedom;

    for (const angle of sampler.angleSamples) {
      const vecX = -FIELD_CELL_SIZE * Math.sin(rot + angle - Math.PI / 2);
      const vecY = FIELD_CELL_SIZE * Math.cos(rot + angle - Math.PI / 2);

      let total = 0;
      for (let i = 1; i <= sampler.distanceSamplesCount; i++) {
        const x = spriteX + vecX * i;
        const y = spriteY + vecY * i;
        const index = field.getIndex(x, y);

        if (rockData[index]) {
          total = 0;
          break;
        }

        if (this.mode === AntMode.toFood && foodData[index]) {
          total += 10000;
          break;
        }

        // This power below is slow, 20% of simulation time :(
        // It greatly improves ants behavior though.
        total += fieldData[index] ** freedom;
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
      this.colony.foodHereField.data[index] = TO_FOOD_DISPERSE_MARKER_STRENGTH;
      this.food = 1;
      this.enterToHome();
    } else if (this.colony.foodHereField.data[index] > 0) {
      this.disperseToFood();
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
      this.disperseTicksLeft &&
      this.disperseTicksLeft < this.maxDisperseTicksLeft - this.disperseTimeout
    ) {
      this.enterToHome();
    }
  }

  visitColony() {
    this.healthPoints = this.maxHealthPoints;
    this.pheromoneStrength = MAX_PHEROMONE_STRENGTH;
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
    const max = this.pheromoneStrength / MAX_PHEROMONE_STRENGTH;
    pheromone.dropPheromone(index, value, max);
  }

  dispersePheromone(index: number, pheromone: PheromoneField, value: number) {
    pheromone.dispersePheromone(index, value);
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

  turnStrongly(power: number) {
    this.velocity.rotate((Math.random() - 0.5) * power);
  }

  die() {
    if (this.food) {
      const toFood = this.colony.garden.foodField;
      const index = toFood.getIndex(this.sprite.x, this.sprite.y);
      toFood.data[index] += this.food;
    }

    const corpse = new Corpse(this);
    this.colony.garden.corpses.push(corpse);
    this.destroy();
  }

  checkAndResolveMapBoundaries(moveX: number, moveY: number) {
    if (
      this.sprite.x < 1 ||
      this.sprite.x > this.colony.garden.width - 1 ||
      this.sprite.y < 1 ||
      this.sprite.y > this.colony.garden.height - 1
    ) {
      this.sprite.x -= moveX;
      this.sprite.y -= moveY;
      this.turnRandomly();
    }
  }

  processPheromoneDisperseTimeout() {
    if (this.disperseTicksLeft) {
      this.disperseTicksLeft--;
      if (this.disperseTicksLeft <= 0) {
        this.enterToHome();
      }
    }
  }

  processDroppingPheromone(fieldIndex: number) {
    if (this.pheromoneToDisperse) {
      if (
        this.disperseTicksLeft <
        this.maxDisperseTicksLeft - this.disperseTimeout
      ) {
        this.dispersePheromone(
          fieldIndex,
          this.pheromoneToDisperse,
          this.disperseStrength
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

  /**
   * Updating antsField with bitId.
   * This is a mechanism of a fast enemy detection. Each colony has a bit flag (bitId) and the map is divided into cells (antsField). When the ant enters the cell, it sets the flag on the cell. When it leaves the cell, it removes it. When the ant sees a flag which doesn't match its colony, then there is an enemy nearby.
   */
  updateAntsField(fieldIndex: number, antsFieldIndex: number) {
    const antsField = this.colony.garden.antsField;

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
            TO_ENEMY_DISPERSE_MARKER_STRENGTH;
        }
      }
      this.lastAntCellIndex = antsFieldIndex;
    }
  }

  processFightMechanic(fieldIndex: number, antsFieldIndex: number) {
    if (this.targetAnt) {
      if (this.targetAnt.healthPoints > 0 && this.targetAnt.energy > 0) {
        this.attackAnt(this.targetAnt);
      } else {
        this.targetAnt = null;
      }
      return;
    }

    if (
      this.colony.garden.antsField.data[antsFieldIndex] !== this.colony.bitId
    ) {
      if (!this.isInAntsMap) {
        // Add the ant to the list of ants in this cell. The soldiers use this list to query the closest enemy ant to attack. This is done only when the ant senses an enemy nearby for performance reasons.
        this.colony.garden.antsMap[antsFieldIndex].push(this);
        this.isInAntsMap = true;
      }

      if (this.type === AntType.soldier) {
        if (this.attackAfterRockColisionTimeout > 0) {
          this.attackAfterRockColisionTimeout--;
          return;
        }
        if (this.colony.enemyHereField.data[fieldIndex]) {
          this.disperseToEnemy();
          this.colony.enemyHereField.data[fieldIndex]--;
        }
        this.attackClosesAnt(antsFieldIndex);
      }
    }
  }

  processColisions(fieldIndex: number) {
    const rockField = this.colony.garden.rockField;

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

      if (this.type === AntType.soldier) {
        this.attackAfterRockColisionTimeout = 10;
      }
    }
    return fieldIndex;
  }
}
