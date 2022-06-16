<script setup lang="ts">
import { inject, ref, watch } from "vue";
import type { Simulation } from "./simulation";
import type { Nest } from "@/life/nest";
import NestItem from "./NestItem.vue";
import { state } from "./state";
import NestForm from "./NestForm.vue";

const simulation = inject<Simulation>("simulation")!;

let nests = ref(simulation.garden.nests);

let trackedNest = ref(getTrackedNest() ?? null);

watch(state, () => {
  nests.value = [...simulation.garden.nests];

  if (state.trackedNest) {
    trackedNest.value = getTrackedNest() ?? null;
  } else {
    trackedNest.value = null;
  }
});

function getTrackedNest() {
  return simulation.garden.nests.find((nest) => nest.id === state.trackedNest);
}

function addNewNest() {
  const nest = simulation.garden.placeRandomNest(
    state.gardenSettings.startingAnts
  );
  if (nest) {
    setTimeout(() => (state.trackedNest = nest.id));
  }
}
</script>

<template>
  <button class="btn btn-primary" :onclick="addNewNest">Add new nest</button>

  <div class="nests">
    <NestItem
      v-for="nest of nests"
      v-bind:key="nest.id"
      :nest="(nest as Nest)"
    />
  </div>

  <div>
    <NestForm v-if="trackedNest" :nest="(trackedNest as Nest)" />
  </div>
</template>

<style scoped>
.nests {
  overflow-y: auto;
  max-height: 200px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
</style>
