<script setup lang="ts">
import { useIntervalFn } from "@vueuse/core";
import { ref } from "vue";
import { state } from "./state";

const numberOfAnts = ref(state.simulationStats.numberOfAnts);
const simTime = ref(state.simulationStats.simulationTime);
const ups = ref(state.simulationStats.ups);
const fps = ref(state.simulationStats.fps);

useIntervalFn(() => {
  numberOfAnts.value = state.simulationStats.numberOfAnts;
  simTime.value = state.simulationStats.simulationTime;
  ups.value = state.simulationStats.ups;
  fps.value = state.simulationStats.fps;
}, 200);
</script>

<template>
  <div class="stats">
    <div>Ants: {{ numberOfAnts }}</div>
    <div>Sim time: {{ simTime.toFixed(1) }}ms</div>
    <div>UPS: {{ ups.toFixed(0) }}</div>
    <div>FPS: {{ fps.toFixed(0) }}</div>
  </div>
</template>

<style scoped>
.stats {
  background-color: rgba(0, 0, 0, 0.7);
  text-align: right;
  padding: 5px;
  font-size: 12px;
}
</style>
