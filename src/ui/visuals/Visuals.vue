<script setup lang="ts">
import { defaultVisualSettings } from "@/simulation";
import { transferFields } from "@/utils";
import { state } from "@/ui/state";
import { Checkbox } from "@/ui/forms";

import PheromoneSettings from "./PheromoneSettings.vue";

function reset() {
  transferFields(state.visualSettings, defaultVisualSettings);
}
</script>

<template>
  <PheromoneSettings
    label="To food pheromone"
    :settings="state.visualSettings.toFood"
    :defaults="defaultVisualSettings.toFood"
    tooltip="A pheromone dropped by ants that found the food and are returning to nest."
  ></PheromoneSettings>

  <PheromoneSettings
    label="To home pheromone"
    :settings="state.visualSettings.toHome"
    :defaults="defaultVisualSettings.toHome"
    tooltip="A pheromone dropped by ants that left the nest and are looking for food."
  ></PheromoneSettings>

  <PheromoneSettings
    label="To enemy pheromone"
    :settings="state.visualSettings.toEnemy"
    :defaults="defaultVisualSettings.toEnemy"
    tooltip="A pheromone left by ants that smelled an enemy ant and are fleeing to the nest."
  ></PheromoneSettings>

  <Checkbox label="Ants enabled" v-model="state.visualSettings.antsEnabled" />

  <Checkbox
    label="Corpses enabled"
    v-model="state.visualSettings.corpsesEnabled"
  />

  <button class="btn" :onclick="reset">Reset to defaults</button>
</template>

<style scoped></style>
