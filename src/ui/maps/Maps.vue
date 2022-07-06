<script setup lang="ts">
import { inject, reactive, ref } from "vue";

import type { Simulation } from "../simulation";
import MapExport from "./MapExport.vue";
import MapImport from "./MapImport.vue";
import MapsList from "./MapsList.vue";
import { Accordion, AccordionItem } from "@/ui/widgets";
import predefinedMaps from "./predefinedMaps";
import { saveMapsNames } from "./utils";

const name = ref("");

const customMaps = reactive<string[]>(
  Array.from(new Set(JSON.parse(localStorage.getItem("maps") ?? "[]")))
);

let simulation = inject<Simulation>("simulation")!;

async function dump() {
  if (!name.value) {
    return;
  }
  const dumpedSim = await simulation.dump();
  localStorage.setItem(`map:${name.value}`, dumpedSim);
  customMaps.push(name.value);
  name.value = "";
  saveMapsNames(customMaps);
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

  <div class="row">
    <MapExport />
    <MapImport />
  </div>

  <Accordion>
    <AccordionItem label="Tour">
      <MapsList :source="predefinedMaps.tour" />
    </AccordionItem>

    <AccordionItem label="Mazes">
      <MapsList :source="predefinedMaps.mazes" />
    </AccordionItem>

    <AccordionItem label="People">
      <MapsList :source="predefinedMaps.people" />
    </AccordionItem>

    <AccordionItem label="Other">
      <MapsList :source="predefinedMaps.other" />
    </AccordionItem>

    <AccordionItem label="Custom">
      <MapsList :maps="customMaps" @select="(map) => (name = map)" />
    </AccordionItem>
  </Accordion>
</template>

<style scoped>
.save {
  align-items: stretch;
}
</style>
