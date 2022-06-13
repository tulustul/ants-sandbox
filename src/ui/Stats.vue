<script setup lang="ts">
import { useIntervalFn } from "@vueuse/core";
import { ref } from "vue";
import { state } from "./state";

const numberOfAnts = ref(state.simulationStats.numberOfAnts);
const simTime = ref(state.simulationStats.simulationTime);

useIntervalFn(() => {
  numberOfAnts.value = state.simulationStats.numberOfAnts;
  simTime.value = state.simulationStats.simulationTime;
}, 200);
</script>

<template>
  <div class="stats">
    <div>Ants: {{ numberOfAnts }}</div>
    <div>Sim time: {{ simTime.toFixed(1) }}ms</div>
  </div>
</template>

<style scoped>
.stats {
  background-color: rgba(0, 0, 0, 0.7);
  text-align: right;
  padding: 5px;
}
</style>
