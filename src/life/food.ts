import { Field } from "./field";

export class FoodField extends Field {
  growTime = 200;
  growPhase = 0;
  maxFood = 50;

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

  tick() {
    // for (let i = this.growPhase++; i < this.data.length; i += this.growTime) {
    //   if (this.data[i] > 0) {
    //     this.data[i] = Math.max(this.maxFood, this.data[i] + 1);
    //   } else {
    //     let neighbours = this.data[i - 1 - this.height] > 0 ? 1 : 0;
    //     neighbours += this.data[i + 1 - this.height] > 0 ? 1 : 0;
    //     neighbours += this.data[i - 1 - this.height] > 0 ? 1 : 0;
    //     neighbours += this.data[i + 1 + this.height] > 0 ? 1 : 0;
    //     if (neighbours >= 2 && Math.random() > 0.7) {
    //       this.data[i] = 1;
    //     }
    //   }
    // }
    // if (this.growPhase === 60) {
    //   this.growPhase = 0;
    // }

    this.graphics.texture.update();
  }
}
