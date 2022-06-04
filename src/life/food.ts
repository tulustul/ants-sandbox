import { Field } from "./field";

export class FoodField extends Field {
  growTime = 200;
  growPhase = 0;
  maxFood = 10;

  placeRandomFood() {
    const size = 10;
    const startX = Math.round(Math.random() * (this.width - size));
    const startY = Math.round(Math.random() * (this.height - size));

    for (let x = startX; x < startX + size; x++) {
      for (let y = startY; y < startY + size; y++) {
        this.data[y * this.height + x] = this.maxFood;
      }
    }
  }

  tick() {}
}
