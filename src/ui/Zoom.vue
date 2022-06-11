<script setup lang="ts">
import { inject } from "vue";
import { PlusIcon, MinusIcon } from "@heroicons/vue/solid";

import type { Simulation } from "./simulation";

let simulation = inject<Simulation>("simulation")!;

function zoomOut() {
  simulation.canvas.camera.scaleByWithEasing(
    0.8,
    window.innerWidth / 2,
    window.innerHeight / 2
  );
}

function zoomIn() {
  simulation.canvas.camera.scaleByWithEasing(
    1.2,
    window.innerWidth / 2,
    window.innerHeight / 2
  );
}
</script>

<template>
  <div class="zooms">
    <button class="btn btn-icon shadow" :onclick="zoomIn">
      <PlusIcon />
    </button>
    <button class="btn btn-icon shadow" :onclick="zoomOut">
      <MinusIcon />
    </button>
  </div>
</template>

<style scoped>
.zooms {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
</style>
