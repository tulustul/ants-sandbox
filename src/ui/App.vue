<script setup lang="ts">
import { ref, onMounted, provide } from "vue";

import { Canvas } from "@/canvas";

import Ui from "./Ui.vue";
import { Simulation } from "./simulation";
import { loadResources } from "@/canvas/resources";
import { Controls } from "./controls";

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

async function onReady() {
  simulation.makeGarden();

  canvas.app.ticker.add(() => {
    simulation.tick();
    simulation.garden.fieldsLayer.tick();
    canvas.camera.update();
  });

  ready.value = true;
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
