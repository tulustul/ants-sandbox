import type { Canvas } from "@/canvas";
import { makeGardenFromImage } from "@/life/fromImage";
import { Garden } from "@/life/garden";
import { fillGarden } from "@/life/gardenGenerator";
import { Colony } from "@/life/colony";
import { processRock } from "@/life/rock";
import { simulationSettings } from "@/life/settings";
import { simulationStats } from "@/life/stats";
import type { DumpedSimulation } from "@/types";
import {
  compressFloat32Array,
  decompressFloat32Array,
} from "@/utils/compression";
import JSZip from "jszip";
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
      this.garden.rockField.preprocessEmptyAreas();
      for (let i = 0; i < settings.numberOfColonies; i++) {
        this.garden.placeRandomColony(settings.startingAnts);
      }

      if (this.garden.colonies.length) {
        state.trackedColony = this.garden.colonies[0].id;
      }

      processRock(this.garden.rockField);
    }

    this.centerCamera();
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

  async dump(): Promise<string> {
    const data: DumpedSimulation = {
      garden: {
        width: this.garden.width,
        height: this.garden.height,
        foodField: compressFloat32Array(this.garden.foodField.data),
        rockField: compressFloat32Array(this.garden.rockField.data, {
          zeroOrOne: true,
        }),
      },
      colonies: this.garden.colonies.map((colony) => colony.dump()),
    };

    const zip = new JSZip();
    zip.file("map", JSON.stringify(data));

    return await zip.generateAsync({
      type: "base64",
      compression: "DEFLATE",
    });
  }

  async load(zippedData: string) {
    const zip = new JSZip();
    const zipData = await zip.loadAsync(zippedData, { base64: true });
    const sData = await zipData.file("map")!.async("string");
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

    for (const colonyData of data.colonies) {
      const colony = new Colony(
        colonyData.x,
        colonyData.y,
        this.garden,
        this.canvas.app
      );
      colony.antsToRelease = colonyData.antsToRelease ?? 1;
      colony.antsLimit = colonyData.antsLimit ?? 1;
      colony.aggresiveness = colonyData.aggresiveness ?? 0;
      colony.freedom = colonyData.freedom ?? 0.1;
      colony.stats.food = colonyData.food ?? 0;
      colony.stats.totalFood = colonyData.food ?? 0;
      this.garden.colonies.push(colony);
    }

    state.trackedColony = this.garden.colonies[0].id;

    this.centerCamera();
  }

  centerCamera() {
    const camera = this.canvas.camera;
    const widthScale = window.innerWidth / this.garden.width;
    const heightScale = window.innerHeight / this.garden.height;
    camera.transform.scale = Math.min(widthScale, heightScale) * 0.95;
    camera.centerAt(this.garden.width / 2, this.garden.height / 2);
    camera.targetScale = camera.transform.scale;
  }
}
