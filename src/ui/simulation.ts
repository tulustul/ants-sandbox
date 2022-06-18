import type { Canvas } from "@/canvas";
import { makeGardenFromImage } from "@/life/fromImage";
import { Garden } from "@/life/garden";
import { fillGarden } from "@/life/gardenGenerator";
import { Nest } from "@/life/nest";
import { processRock } from "@/life/rock";
import { simulationSettings } from "@/life/settings";
import { simulationStats } from "@/life/stats";
import type { DumpedSimulation } from "@/types";
import {
  compressFloat32Array,
  decompressFloat32Array,
} from "@/utils/compression";
import { state } from "./state";

export class Simulation {
  garden!: Garden;

  tickAccumulator = 0;

  totalTicks = 0;

  constructor(public canvas: Canvas) {}

  async makeGarden() {
    state.loadedMap = null;

    const settings = state.gardenSettings;

    if (settings.type === "image" && state.imageFile) {
      this.garden = await makeGardenFromImage(this.canvas, state.imageFile);
    } else {
      this.garden = new Garden(this.canvas, settings.width, settings.height);
    }

    if (settings.type === "random") {
      this.randomizeGarden();
    }

    if (settings.type !== "empty") {
      for (let i = 0; i < settings.numberOfNests; i++) {
        this.garden.placeRandomNest(settings.startingAnts);
      }

      if (this.garden.nests.length) {
        state.trackedNest = this.garden.nests[0].id;
      }

      processRock(this.garden.rockField);
    }
  }

  restart() {
    this.garden.destroy();

    this.makeGarden();
  }

  randomizeGarden() {
    const gardenSettings = state.gardenSettings;

    fillGarden({
      garden: this.garden,

      foodEnabled: gardenSettings.foodEnabled,
      foodScale: gardenSettings.foodScale,
      foodSize: gardenSettings.foodSize,
      foodRichness: gardenSettings.foodRichness,

      rockEnabled: gardenSettings.rockEnabled,
      rockScale: gardenSettings.rockScale,
      rockSize: gardenSettings.rockSize,

      horizontalMirror: gardenSettings.horizontalMirror,
      verticalMirror: gardenSettings.verticalMirror,
    });
  }

  tick() {
    if (this.garden.isDestroyed) {
      return;
    }

    const t0 = performance.now();

    if (simulationSettings.pause) {
      return;
    }

    this.tickAccumulator += simulationSettings.speed;

    while (this.tickAccumulator > 1) {
      this.tickAccumulator--;
      this.garden.tick(this.totalTicks++);
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
        rockField: compressFloat32Array(this.garden.rockField.data, {
          zeroOrOne: true,
        }),
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

    processRock(this.garden.rockField);

    for (const nestData of data.nests) {
      const nest = new Nest(
        nestData.x,
        nestData.y,
        this.garden,
        this.canvas.app
      );
      nest.antsToRelease = nestData.antsToRelease ?? 1;
      nest.antsLimit = nestData.antsLimit ?? 1;
      nest.aggresiveness = nestData.aggresiveness ?? 0;
      nest.freedom = nestData.freedom ?? 0.1;
      nest.stats.food = nestData.food ?? 0;
      nest.stats.totalFood = nestData.food ?? 0;
      this.garden.nests.push(nest);
    }

    state.trackedNest = this.garden.nests[0].id;
  }
}
