<script setup lang="ts">
import { ref, onMounted, provide, watch } from "vue";

import { Canvas, FieldGraphics } from "@/canvas";

import Ui from "./Ui.vue";
import { Simulation } from "./simulation";
import { loadResources } from "@/canvas/resources";
import { Controls } from "./controls";
import { PerformanceMonitor } from "@/utils/performance";
import { state } from "./state";
import type { PheromoneVisualSettings } from "@/simulation";

const canvasRef = ref();
const ready = ref(false);

let canvas: Canvas;
let simulation: Simulation;
let controls = new Controls();

onMounted(async () => {
  canvas = new Canvas(canvasRef.value);
  simulation = new Simulation(canvas);
  controls.simulation = simulation;
  provide("simulation", simulation);

  window.addEventListener(
    "contextmenu",
    (e) => {
      const el = e.target as HTMLElement;
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        return;
      }
      e.preventDefault();
    },
    false
  );

  await loadResources();
  onReady();
});

function applySettings(
  field: FieldGraphics,
  fieldMax: FieldGraphics,
  settings: PheromoneVisualSettings
) {
  field.filter.uniforms.exposure = settings.exposure;
  field.filter.uniforms.contrast = settings.contrast;
  field.sprite.alpha = settings.density;

  fieldMax.filter.uniforms.exposure = settings.exposure;
  fieldMax.filter.uniforms.contrast = settings.contrast;
  fieldMax.sprite.alpha = settings.intensity;
}

async function onReady() {
  const simMonitor = new PerformanceMonitor();
  const frameMonitor = new PerformanceMonitor();

  simulation.makeGarden();

  let frameT0 = performance.now();
  canvas.app.ticker.add(() => {
    frameMonitor.measure(frameT0);
    state.simulationStats.fps = frameMonitor.ups;
    state.simulationStats.ups =
      frameMonitor.ups * state.simulationSettings.speed;
    frameT0 = performance.now();

    const simT0 = performance.now();
    simulation.tick();
    state.simulationStats.simulationTime = simMonitor.measure(simT0);

    simulation.garden.pheromonesLayer.tick();
    canvas.camera.update();
  });

  ready.value = true;

  setTimeout(() => {
    const pheromonesLayer = simulation.garden.pheromonesLayer;

    watch(state.visualSettings.toFood, (toFood) => {
      applySettings(pheromonesLayer.toFood, pheromonesLayer.toFoodMax, toFood);
    });

    watch(state.visualSettings.toHome, (toHome) => {
      applySettings(pheromonesLayer.toHome, pheromonesLayer.toHomeMax, toHome);
    });

    watch(state.visualSettings.toEnemy, (toEnemy) => {
      applySettings(
        pheromonesLayer.toEnemy,
        pheromonesLayer.toEnemyMax,
        toEnemy
      );
    });
  });
}
</script>

<template>
  <canvas
    ref="canvasRef"
    @wheel="(event: WheelEvent) => controls.onWheel(event)"
    @pointerdown="(event:PointerEvent) => controls.onPointerDown(event)"
    @pointerup="(event:PointerEvent) => controls.onPointerUp(event)"
    @pointermove="(event:PointerEvent) => controls.onPointerMove(event)"
  ></canvas>
  <Ui v-if="ready" />
</template>

<style>
@import "@/assets/base.css";

#app {
  height: 100vh;
  overflow-y: hidden;
}
</style>
