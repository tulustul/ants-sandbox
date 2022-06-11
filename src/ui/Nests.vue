<script setup lang="ts">
import { inject, reactive } from "vue";
import type { Simulation } from "./simulation";
import NestItem from "./NestItem.vue";
import type { Nest } from "@/life/nest";
import { state } from "./state";
import NestForm from "./NestForm.vue";

const simulation = inject<Simulation>("simulation")!;

let nests = reactive(simulation.garden.nests) as Nest[];

function addNewNest() {
  simulation.garden.placeRandomNest(state.gardenSettings.startingAnts);
}
</script>

<template>
  <button class="btn btn-primary" :onclick="addNewNest">Add new nest</button>

  <div class="nests">
    <NestItem v-for="nest of nests" :nest="nest" />
  </div>

  <div>
    <NestForm v-if="state.trackedNest"/>
  </div>
</template>

<style scoped>
.nests {
  overflow-y: auto;
  max-height: 200px;
  display: flex;
  flex-direction: column;
  gap:5px;
}
</style>
