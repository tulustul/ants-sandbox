<script setup lang="ts">
import { inject, reactive } from "vue";
import type { Simulation } from "./simulation";
import NestItem from "./NestItem.vue";
import { Nest } from "@/life/nest";
import { state } from "./state";
import NestForm from "./NestForm.vue";

const simulation = inject<Simulation>("simulation")!;

let nests = reactive(simulation.garden.nests) as Nest[];

function addNewNest() {
  const garden = simulation.garden;
  const newNest = new Nest(
    Math.random() * garden.width,
    Math.random() * garden.height,
    garden,
    simulation.canvas.app
  );
  nests.push(newNest);
}
</script>

<template>
  <div class="nests">
    <NestItem v-for="nest of nests" :nest="nest" />
  </div>

  <div>
    <NestForm v-if="state.trackedNest"/>
  </div>

  <button class="btn" :onclick="addNewNest">Add new nest</button>
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
