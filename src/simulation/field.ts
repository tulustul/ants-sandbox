import { state } from "@/ui/state";

import { FIELD_CELL_SIZE } from "./const";
import type { Garden } from "./garden";

export type DrawOptions = {
  ignoreMirroring?: boolean;
  smooth?: boolean;
};

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
    // Fast integer division.
    return ((y / this.cellSize) >> 0) * this.width + ((x / this.cellSize) >> 0);
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
    options: DrawOptions = {}
  ) {
    atX = Math.floor(atX / this.cellSize);
    atY = Math.floor(atY / this.cellSize);

    this._draw(atX, atY, radius, value, options);

    if (options.ignoreMirroring) {
      return;
    }

    if (state.drawing.horizontalMirror) {
      this._draw(this.width - atX, atY, radius, value, options);
    }
    if (state.drawing.verticalMirror) {
      this._draw(atX, this.height - atY, radius, value, options);
    }
    if (state.drawing.horizontalMirror && state.drawing.verticalMirror) {
      this._draw(this.width - atX, this.height - atY, radius, value, options);
    }
  }

  private _draw(
    atX: number,
    atY: number,
    diameter: number,
    value: number,
    options: DrawOptions
  ) {
    const radius = diameter / 2;

    const minX = Math.round(atX - radius);
    const maxX = minX + diameter;

    const minY = Math.round(atY - radius);
    const maxY = minY + diameter;

    for (let x = minX; x < maxX; x++) {
      for (let y = minY; y < maxY; y++) {
        const distance = Math.sqrt((atX - x) ** 2 + (atY - y) ** 2);
        if (distance <= radius) {
          const index = y * this.width + x;
          const drawValue = options.smooth
            ? value + value * (radius + 1 - distance)
            : value;
          this.drawPixel(index, drawValue);
        }
      }
    }
  }

  protected drawPixel(index: number, value: number) {
    this.data[index] = value;
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

export class FoodField extends Field {
  protected drawPixel(index: number, value: number) {
    if (!this.garden.rockField.data[index]) {
      this.data[index] = value;
    }
  }
}

export class RockField extends Field {
  protected drawPixel(index: number, value: number) {
    this.data[index] = value;
    if (value) {
      this.garden.foodField.data[index] = 0;
    }
  }
}
