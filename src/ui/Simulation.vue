<script setup lang="ts">
import { inject } from 'vue';
import type { Simulation } from './simulation';
import Slider from './forms/Slider.vue';
import {state} from './state';
import {defaultSimulationSettings} from '@/life/simulation';
import { transferFields } from '@/utils/object';

const simulation = inject<Simulation>('simulation')!;


function restartSimulation() {
  simulation.restart()
}

function reset() {
  transferFields(state.simulationSettings, defaultSimulationSettings);
}
</script>

<template>
  <button class="btn" :onclick="restartSimulation">Restart</button>

  <Slider
    label="Pheromone dissipation"
    v-model="state.simulationSettings.pheromoneDissipation"
    :default="defaultSimulationSettings.pheromoneDissipation"
    :min="1"
    :max="1.05"
    :step="0.001"
  />

  <Slider
    label="Ant tick timeout"
    v-model="state.simulationSettings.antSlowTickTimeout"
    :default="defaultSimulationSettings.antSlowTickTimeout"
    :min="1"
    :max="20"
    :step="1"
  />

  <Slider
    label="Ant precise tick timeout"
    v-model="state.simulationSettings.antPreciseTickTimeout"
    :default="defaultSimulationSettings.antPreciseTickTimeout"
    :min="1"
    :max="300"
    :step="1"
  />

  <Slider
    label="Ant seeking randomness"
    v-model="state.simulationSettings.antSeekRandomness"
    :default="defaultSimulationSettings.antSeekRandomness"
    :min="0.5"
    :max="10"
    :step="0.1"
  />

  <button class="btn" :onclick="reset">Reset All</button>
</template>

<style>
</style>
