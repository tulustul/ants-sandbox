import { state } from "@/ui/state";
import { Vec } from "@/utils/vector";
import { FIELD_CELL_SIZE } from "./const";
import type { Garden } from "./garden";

export class Field {
  data: Float32Array;
  width: number;
  height: number;
  cellSize: number;

  emptySegmentsMap = new Map<number, number>(); // index -> segmentId
  emptySegmentsSizeMap = new Map<number, number>(); // segmentId -> segment area

  constructor(public garden: Garden, cellSize?: number) {
    if (!cellSize) {
      cellSize = FIELD_CELL_SIZE;
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

  get area() {
    return this.width * this.height;
  }

  draw(
    atX: number,
    atY: number,
    radius: number,
    value: number,
    ignoreMirroring = false
  ) {
    atX = Math.floor(atX / this.cellSize);
    atY = Math.floor(atY / this.cellSize);
    const halfRadius = radius / 2;

    const minX = Math.round(atX - halfRadius);
    const maxX = minX + radius;

    const minY = Math.round(atY - halfRadius);
    const maxY = minY + radius;

    this._draw(minX, maxX, minY, maxY, value);

    if (ignoreMirroring) {
      return;
    }

    if (state.drawing.horizontalMirror) {
      this._draw(this.width - maxX, this.width - minX, minY, maxY, value);
    }
    if (state.drawing.verticalMirror) {
      this._draw(minX, maxX, this.height - maxY, this.height - minY, value);
    }
    if (state.drawing.horizontalMirror && state.drawing.verticalMirror) {
      this._draw(
        this.width - maxX,
        this.width - minX,
        this.height - maxY,
        this.height - minY,
        value
      );
    }
  }

  protected _draw(
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
    value: number
  ) {
    for (let x = minX; x < maxX; x++) {
      for (let y = minY; y < maxY; y++) {
        this.data[y * this.width + x] = value;
      }
    }
  }

  preprocessEmptyAreas() {
    this.emptySegmentsMap.clear();
    this.emptySegmentsSizeMap.clear();
    for (let index = 0; index < this.data.length; index++) {
      if (this.emptySegmentsMap.get(index) !== undefined) {
        continue;
      }
      if (this.data[index] !== 0) {
        continue;
      }

      const segmentId = this.emptySegmentsMap.size;

      const visited = new Set<number>();
      let toProcess = new Set([index]);

      while (toProcess.size) {
        const newToProcess = new Set<number>();
        for (const index of toProcess) {
          if (visited.has(index)) {
            continue;
          }

          if (index < 0 || index >= this.data.length) {
            continue;
          }

          this.emptySegmentsMap.set(index, segmentId);
          visited.add(index);

          if (this.data[index - 1] === 0) {
            newToProcess.add(index - 1);
          }

          if (this.data[index + 1] === 0) {
            newToProcess.add(index + 1);
          }

          if (this.data[index - this.width] === 0) {
            newToProcess.add(index - this.width);
          }

          if (this.data[index + this.width] === 0) {
            newToProcess.add(index + this.width);
          }
        }
        toProcess = newToProcess;
      }
      this.emptySegmentsSizeMap.set(segmentId, visited.size);
    }
  }

  getEmptyAreaAt(index: number) {
    const segment = this.emptySegmentsMap.get(index);
    if (segment === undefined) {
      return 0;
    }
    return this.emptySegmentsSizeMap.get(segment) ?? 0;
  }
}
