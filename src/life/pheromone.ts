import { Field } from "./field";
import { simulationSettings } from "./simulation";

export class PheromoneField extends Field {
  degradationTime = 60; // in ticks
  degradationPhase = 0;

  maxValues = new Field(this.garden, [0, 0, 0]);

  dropPheromone(index: number, value: number, max: number) {
    if (value > 0) {
      this.maxValues.data[index] = Math.max(max, this.maxValues.data[index]);
    } else {
      this.maxValues.data[index] = Math.min(max, this.maxValues.data[index]);
    }
    if (this.data[index] > max) {
      return;
    }
    // this.data[index] = Math.max(0, this.data[index] + value);
    this.data[index] = Math.max(0, this.data[index] + value);
    this.spreadPheromone(index, value);
  }

  spreadPheromone(index: number, value: number) {
    this.data[index - 1] = Math.max(
      0,
      Math.min(this.maxValues.data[index - 1], this.data[index - 1] + value / 4)
    );
    this.data[index + 1] = Math.max(
      0,
      Math.min(this.maxValues.data[index + 1], this.data[index + 1] + value / 4)
    );
    this.data[index - this.height] = Math.max(
      0,
      Math.min(
        this.maxValues.data[index - this.height],
        this.data[index - this.height] + value / 4
      )
    );
    this.data[index + this.height] = Math.max(
      0,
      Math.min(
        this.maxValues.data[index + this.height],
        this.data[index + this.height] + value / 4
      )
    );
  }

  tick() {
    const dissipation = simulationSettings.pheromoneDissipation;
    for (
      let i = this.degradationPhase++;
      i < this.data.length;
      i += this.degradationTime
    ) {
      if (this.data[i] > 0) {
        this.data[i] /= dissipation;
        this.maxValues.data[i] /= dissipation;
      }
    }
    if (this.degradationPhase === 60) {
      this.degradationPhase = 0;
    }

    this.graphics.texture.update();
  }
}
