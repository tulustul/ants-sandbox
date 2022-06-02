import { FieldGraphics } from "@/canvas/field";
import { Vec } from "@/utils/vector";
import type { Garden } from "./garden";

export class Field {
  data: Float32Array;
  width: number;
  height: number;
  graphics: FieldGraphics;

  constructor(public garden: Garden, tint: [number, number, number]) {
    this.width = Math.round(garden.width / garden.fieldCellSize);
    this.height = Math.round(garden.height / garden.fieldCellSize);
    this.data = new Float32Array(this.width * this.height);
    this.graphics = new FieldGraphics(this, tint);
  }

  getIndex(x: number, y: number) {
    return (
      Math.round(y / this.garden.fieldCellSize) * this.height +
      Math.round(x / this.garden.fieldCellSize)
    );
  }

  getCoords(index: number) {
    const x = index % this.height;
    return new Vec(
      x * this.garden.fieldCellSize,
      ((index - x) / this.height) * this.garden.fieldCellSize
    );
  }

  getAt(x: number, y: number) {
    return this.data[this.getIndex(x, y)];
  }

  destroy() {
    this.graphics.destroy();
  }

  draw(atX: number, atY: number, radius: number, value: number) {
    atX = Math.round(atX / this.garden.fieldCellSize);
    atY = Math.round(atY / this.garden.fieldCellSize);
    const halfRadius = Math.round(radius / 2);
    for (let x = atX - halfRadius; x < atX + halfRadius; x++) {
      for (let y = atY - halfRadius; y < atY + halfRadius; y++) {
        this.data[y * this.height + x] = value;
      }
    }
  }
}
