<script setup lang="ts">
import { inject, ref } from "vue";
import { TrashIcon } from "@heroicons/vue/solid";

import type { Simulation } from "./simulation";

const name = ref("");

const scenarios: Set<string> = new Set(
  JSON.parse(localStorage.getItem("scenarios") ?? "[]")
);

let simulation = inject<Simulation>("simulation")!;

function dump() {
  if (!name.value) {
    return;
  }
  const dumpedSim = simulation.dump();
  localStorage.setItem(`scenario:${name.value}`, dumpedSim);
  scenarios.add(name.value);
  saveScenariosNames();
  name.value = "";
}

function load(name: string) {
  const data = localStorage.getItem(`scenario:${name}`)!;
  simulation.load(data);
}

function remove(name: string) {
  localStorage.removeItem(`scenario:${name}`);
  scenarios.delete(name);
  saveScenariosNames();
}

function saveScenariosNames() {
  localStorage.setItem("scenarios", JSON.stringify(Array.from(scenarios)));
}
</script>

<template>
  <div class="row save">
    <input
      class="grow"
      type="text"
      placeholder="Scenario name"
      v-model="name"
    />
    <button class="btn" :onclick="dump">Save</button>
  </div>
  <div
    class="row map"
    v-for="map in scenarios"
    v-bind:key="map"
    :onclick="() => (name = map)"
  >
    <button class="btn" :onclick="() => load(map)">Load</button>

    <div class="grow">{{ map }}</div>

    <button class="btn btn-icon" :onclick="() => remove(map)">
      <TrashIcon />
    </button>
  </div>
</template>

<style scoped>
.map {
  cursor: pointer;
}
.map:hover {
  background-color: rgba(0, 0, 0, 0.2);
}
.save {
  align-items: stretch;
}
</style>
