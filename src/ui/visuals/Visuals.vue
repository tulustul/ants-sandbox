<script setup lang="ts">
import { inject, watch } from "vue";
import type { Simulation } from "../simulation";
import { state } from "../state";
import { Checkbox } from "../forms";
import { transferFields } from "@/utils/object";
import {
  defaultVisualSettings,
  type PheromoneVisualSettings,
} from "@/life/settings";
import PheromoneSettings from "./PheromoneSettings.vue";
import type { FieldGraphics } from "@/canvas/fieldGraphics";

const simulation = inject<Simulation>("simulation")!;

const fieldsLayer = simulation.garden.fieldsLayer;

watch(state.visualSettings.toFood, (toFood) => {
  applySettings(fieldsLayer.toFood, fieldsLayer.toFoodMax, toFood);
});

watch(state.visualSettings.toHome, (toHome) => {
  applySettings(fieldsLayer.toHome, fieldsLayer.toHomeMax, toHome);
});

watch(state.visualSettings.toEnemy, (toEnemy) => {
  applySettings(fieldsLayer.toEnemy, fieldsLayer.toEnemyMax, toEnemy);
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
  ></PheromoneSettings>

  <PheromoneSettings
    label="To home pheromone"
    :settings="state.visualSettings.toHome"
    :defaults="defaultVisualSettings.toHome"
  ></PheromoneSettings>

  <PheromoneSettings
    label="To enemy pheromone"
    :settings="state.visualSettings.toEnemy"
    :defaults="defaultVisualSettings.toEnemy"
  ></PheromoneSettings>

  <Checkbox label="Ants enabled" v-model="state.visualSettings.antsEnabled" />

  <Checkbox
    label="Corpses enabled"
    v-model="state.visualSettings.corpsesEnabled"
  />

  <button class="btn" :onclick="reset">Reset All</button>
</template>

<style scoped></style>
