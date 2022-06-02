<script setup lang="ts">
  import { inject, onBeforeUnmount, ref, watch } from 'vue';
import type { Simulation } from './simulation';
  import { state } from './state';
  import { visualSettings } from './visuals';
import Slider from './forms/Slider.vue';

  const simulation = inject<Simulation>('simulation')!;

  watch(visualSettings.shaders, () => {
    for (const nest of simulation.garden.nests) {
      nest.toFoodField.graphics.filter.uniforms.exposure = visualSettings.shaders.pheromoneExposure
      nest.toFoodField.graphics.filter.uniforms.contrast = visualSettings.shaders.pheromoneContrast

      nest.toHomeField.graphics.filter.uniforms.exposure = visualSettings.shaders.pheromoneExposure
      nest.toHomeField.graphics.filter.uniforms.contrast = visualSettings.shaders.pheromoneContrast
    }
  })

</script>

<template>
  <Slider
    label="Pheromone exposure"
    v-model="visualSettings.shaders.pheromoneExposure"
    :default="1"
    :min="0.2"
    :max="5"
    :step="0.2"
  />
  <Slider
    label="Pheromone contrast"
    v-model="visualSettings.shaders.pheromoneContrast"
    :default="1"
    :min="0.4"
    :max="2"
    :step="0.1"
  />
</template>

<style scoped>
</style>
