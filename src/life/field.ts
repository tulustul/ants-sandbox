import { Vec } from "@/utils/vector";
import type { Garden } from "./garden";

export class Field {
  data: Float32Array;
  width: number;
  height: number;
  cellSize: number;

  constructor(public garden: Garden, cellSize?: number) {
    if (!cellSize) {
      cellSize = garden.fieldCellSize;
    }
    this.cellSize = cellSize;
    this.width = Math.ceil(garden.width / this.cellSize);
    this.height = Math.ceil(garden.height / this.cellSize);
    this.data = new Float32Array(this.width * this.height);
  }

  getIndex(x: number, y: number) {
    return (
      Math.floor(y / this.cellSize) * this.width + Math.floor(x / this.cellSize)
    );
  }

  getCoords(index: number) {
    const x = index % this.height;
    return new Vec(
      x * this.cellSize,
      ((index - x) / this.height) * this.cellSize
    );
  }

  getAt(x: number, y: number) {
    return this.data[this.getIndex(x, y)];
  }

  draw(atX: number, atY: number, radius: number, value: number) {
    atX = Math.floor(atX / this.cellSize);
    atY = Math.floor(atY / this.cellSize);
    const halfRadius = radius / 2;

    const minX = Math.round(atX - halfRadius);
    const maxX = minX + radius;

    const minY = Math.round(atY - halfRadius);
    const maxY = minY + radius;

    for (let x = minX; x < maxX; x++) {
      for (let y = minY; y < maxY; y++) {
        this.data[y * this.width + x] = value;
      }
    }
  }
}
