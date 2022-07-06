<script setup lang="ts">
import { inject, ref, watch } from "vue";

import type { Colony } from "@/simulation";
import type { Simulation } from "@/ui/simulation";
import { state } from "@/ui/state";

import ColonyItem from "./ColonyItem.vue";
import ColonyForm from "./ColonyForm.vue";

const simulation = inject<Simulation>("simulation")!;

let colonies = ref(simulation.garden.colonies);

let trackedColony = ref(getTrackedColony() ?? null);

watch(state, () => {
  colonies.value = [...simulation.garden.colonies];

  if (state.trackedColony) {
    trackedColony.value = getTrackedColony() ?? null;
    if (!trackedColony.value) {
      state.trackedColony = null;
    }
  } else {
    trackedColony.value = null;
  }
});

function getTrackedColony() {
  return simulation.garden.colonies.find(
    (colony) => colony.id === state.trackedColony
  );
}

function addNewColony() {
  const colony = simulation.garden.placeRandomColony(
    state.gardenSettings.startingAnts
  );
  if (colony) {
    setTimeout(() => (state.trackedColony = colony.id));
  }
}
</script>

<template>
  <button class="btn btn-primary" :onclick="addNewColony">
    Add new colony
  </button>

  <div class="colonies">
    <ColonyItem
      v-for="colony of colonies"
      v-bind:key="colony.id"
      :colony="(colony as Colony)"
    />
  </div>

  <div>
    <ColonyForm v-if="trackedColony" />
  </div>
</template>

<style scoped>
.colonies {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
</style>
