import type { Canvas } from "@/canvas";
import { Garden } from "@/life/garden";
import { Nest } from "@/life/nest";
import { simulationSettings } from "@/life/simulation";
import { simulationStats } from "@/life/stats";
import type { DumpedSimulation } from "@/types";
import {
  compressFloat32Array,
  decompressFloat32Array,
} from "@/utils/compression";

export class Simulation {
  garden!: Garden;

  tickAccumulator = 0;

  constructor(public canvas: Canvas) {
    this.randomizeGarden();
  }

  restart() {
    this.garden.destroy();
    this.randomizeGarden();
  }

  randomizeGarden() {
    this.garden = new Garden(this.canvas, 10000, 10000);
    const nest = new Nest(
      this.garden.width / 2,
      this.garden.height / 2,
      this.garden,
      this.garden.canvas.app
    );
    this.garden.nests.push(nest);
    nest.releaseAnts();

    for (let i = 0; i < 50; i++) {
      this.garden.foodField.placeRandomFood();
    }
  }

  tick() {
    const t0 = performance.now();

    if (simulationSettings.pause) {
      return;
    }

    this.tickAccumulator += simulationSettings.speed;

    while (this.tickAccumulator > 1) {
      this.tickAccumulator--;
      this.garden.tick();
    }

    const t1 = performance.now();

    // Moving average.
    simulationStats.numberOfAnts = this.garden.ants.length;
    const dt = t1 - t0;
    simulationStats.simulationTime =
      (simulationStats.simulationTime * 9 + dt) / 10;
  }

  dump(): string {
    const data: DumpedSimulation = {
      garden: {
        width: this.garden.width,
        height: this.garden.height,
        foodField: compressFloat32Array(this.garden.foodField.data),
        rockField: compressFloat32Array(this.garden.rockField.data),
      },
      nests: this.garden.nests.map((nest) => nest.dump()),
    };
    const sData = JSON.stringify(data);
    return btoa(sData);
  }

  load(b64Data: string) {
    const sData = atob(b64Data);
    const data: DumpedSimulation = JSON.parse(sData);
    this.garden.destroy();

    this.garden = new Garden(
      this.canvas,
      data.garden.width,
      data.garden.height
    );
    decompressFloat32Array(data.garden.foodField, this.garden.foodField.data);
    decompressFloat32Array(data.garden.rockField, this.garden.rockField.data);

    for (const nestData of data.nests) {
      const nest = new Nest(
        nestData.x,
        nestData.y,
        this.garden,
        this.canvas.app
      );
      nest.startingsAnts = nestData.startingAnts;
      nest.antsLimit = nestData.antsLimit;
      this.garden.nests.push(nest);
      nest.releaseAnts();
    }
  }
}
