<script setup lang="ts">
  import { inject, watch } from 'vue';
import type { Simulation } from './simulation';
  import { state } from './state';
import Slider from './forms/Slider.vue';
import Checkbox from './forms/Checkbox.vue';

  const simulation = inject<Simulation>('simulation')!;

  watch(state.visualSettings.shaders, () => {
    for (const graphic of simulation.garden.fieldsLayer.graphics) {
      graphic.filter.uniforms.exposure = state.visualSettings.shaders.pheromoneExposure
      graphic.filter.uniforms.contrast = state.visualSettings.shaders.pheromoneContrast

    }
  })

</script>

<template>
  <Slider
    label="Pheromone exposure"
    v-model="state.visualSettings.shaders.pheromoneExposure"
    :default="1"
    :min="0.2"
    :max="5"
    :step="0.2"
  />
  <Slider
    label="Pheromone contrast"
    v-model="state.visualSettings.shaders.pheromoneContrast"
    :default="1"
    :min="0.4"
    :max="2"
    :step="0.1"
  />
  <Slider
    label="Max opacity"
    v-model="state.visualSettings.maxOpacity"
    :default="0.15"
    :min="0.0"
    :max="1"
    :step="0.01"
  />

  <Checkbox label="To food layer enabled" v-model="state.visualSettings.toFoodEnabled"/>
  <Checkbox label="To food max layer enabled" v-model="state.visualSettings.toFoodMaxEnabled"/>
  <Checkbox label="To home layer enabled" v-model="state.visualSettings.toHomeEnabled"/>
  <Checkbox label="To home max layer enabled" v-model="state.visualSettings.toHomeMaxEnabled"/>
  <Checkbox label="To enemy layer enabled" v-model="state.visualSettings.toEnemyEnabled"/>
  <Checkbox label="To enemy max layer enabled" v-model="state.visualSettings.toEnemyMaxEnabled"/>

  <Checkbox label="Ants enabled" v-model="state.visualSettings.antsEnabled"/>
</template>

<style scoped>
</style>
