<script setup lang="ts">
import { inject, watch } from "vue";

import {
  defaultVisualSettings,
  type PheromoneVisualSettings,
} from "@/simulation";
import type { FieldGraphics } from "@/canvas";
import { transferFields } from "@/utils";
import type { Simulation } from "@/ui/simulation";
import { state } from "@/ui/state";
import { Checkbox } from "@/ui/forms";

import PheromoneSettings from "./PheromoneSettings.vue";

const simulation = inject<Simulation>("simulation")!;

const pheromonesLayer = simulation.garden.pheromonesLayer;

watch(state.visualSettings.toFood, (toFood) => {
  applySettings(pheromonesLayer.toFood, pheromonesLayer.toFoodMax, toFood);
});

watch(state.visualSettings.toHome, (toHome) => {
  applySettings(pheromonesLayer.toHome, pheromonesLayer.toHomeMax, toHome);
});

watch(state.visualSettings.toEnemy, (toEnemy) => {
  applySettings(pheromonesLayer.toEnemy, pheromonesLayer.toEnemyMax, toEnemy);
});

function applySettings(
  field: FieldGraphics,
  fieldMax: FieldGraphics,
  settings: PheromoneVisualSettings
) {
  field.filter.uniforms.exposure = settings.exposure;
  field.filter.uniforms.contrast = settings.contrast;
  field.sprite.alpha = settings.density;

  fieldMax.filter.uniforms.exposure = settings.exposure;
  fieldMax.filter.uniforms.contrast = settings.contrast;
  fieldMax.sprite.alpha = settings.intensity;
}

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
