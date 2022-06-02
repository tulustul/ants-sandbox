import type { Canvas } from "@/canvas";
import type { Ant } from "./ant";
import { Field } from "./field";
import { FoodField } from "./food";
import type { Nest } from "./nest";
import { simulationSettings } from "./simulation";

export class Garden {
  nests: Nest[] = [];
  ants: Ant[] = [];

  fieldCellSize = 20;

  foodField: FoodField;
  rockField: Field;

  antSlowTickOffset = 0;
  antPreciseTickOffset = 0;

  constructor(
    public canvas: Canvas,
    public width: number,
    public height: number
  ) {
    this.foodField = new FoodField(this, [0, 255, 0]);
    this.rockField = new Field(this, [180, 180, 180]);
  }

  tick() {
    this.antSlowTickOffset++;
    this.antPreciseTickOffset++;

    for (let i = 0; i < this.ants.length; i++) {
      const ant = this.ants[i];
      if (!ant.fastTick()) {
        continue;
      }
      if (
        (i + this.antPreciseTickOffset) %
          simulationSettings.antPreciseTickTimeout ===
        0
      ) {
        ant.preciseTick();
      } else if (
        (i + this.antSlowTickOffset) % simulationSettings.antSlowTickTimeout ===
        0
      ) {
        ant.slowTick();
      }
    }

    if (this.antSlowTickOffset === simulationSettings.antSlowTickTimeout) {
      this.antSlowTickOffset = 0;
    }

    if (
      this.antPreciseTickOffset === simulationSettings.antPreciseTickTimeout
    ) {
      this.antPreciseTickOffset = 0;
    }

    for (const nest of this.nests) {
      nest.tick();
    }

    this.foodField.tick();
  }

  destroy() {
    for (const nest of this.nests) {
      nest.destroy();
    }

    this.foodField.destroy();
    this.rockField.destroy();
  }
}
