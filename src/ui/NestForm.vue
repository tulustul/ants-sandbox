<script setup lang="ts">
import { inject, ref, watch } from "vue";
import { useIntervalFn } from "@vueuse/core";

import type { Simulation } from "./simulation";
import { state } from "./state";

const simulation = inject<Simulation>("simulation")!;
let nest = getTrackedNest()!;

const stats = ref(nest.stats);
const warCoef = ref(nest.warCoef);

useIntervalFn(() => {
  stats.value = { ...nest.stats };
  warCoef.value = nest.warCoef;
}, 200);

watch(state, () => {
  nest = getTrackedNest()!;
});

function getTrackedNest() {
  return simulation.garden.nests.find((nest) => nest.id === state.trackedNest);
}

function destroyNest() {
  nest?.destroy();
}
</script>

<template>
  <div>Current food: {{ stats.food.toFixed(0) }}</div>
  <div>Total food: {{ stats.totalFood }}</div>

  <div>Workers: {{ stats.workers }}</div>
  <div>Soldiers: {{ stats.soldiers }}</div>
  <div>Living ants: {{ stats.livingAnts }}</div>
  <div>Total ants: {{ stats.totalAnts }}</div>

  <div>Starved ants : {{ stats.starvedAnts }}</div>
  <div>Killed ants : {{ stats.killedAnts }}</div>
  <div>Killed enemy ants : {{ stats.killedEnemyAnts }}</div>

  <div>War coefficient : {{ warCoef.toFixed(3) }}</div>

  <button class="btn" :onclick="destroyNest">Destroy Nest</button>
</template>

<style></style>
