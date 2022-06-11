<script setup lang="ts">
import Slider from './forms/Slider.vue';
import {state} from './state';
import {defaultSimulationSettings} from '@/life/settings';
import { transferFields } from '@/utils/object';
import FieldGroup from './forms/FieldGroup.vue';


function reset() {
  transferFields(state.simulationSettings, defaultSimulationSettings);
}
</script>

<template>
  <Slider
    label="Pheromone dissipation"
    v-model="state.simulationSettings.pheromoneDissipation"
    :default="defaultSimulationSettings.pheromoneDissipation"
    :min="1"
    :max="1.05"
    :step="0.001"
  />

  <Slider
    label="Ant seeking randomness"
    v-model="state.simulationSettings.antSeekRandomness"
    :default="defaultSimulationSettings.antSeekRandomness"
    :min="0.5"
    :max="10"
    :step="0.1"
  />

  <FieldGroup label="Performance">
    <Slider
      label="Ant tick timeout"
      v-model="state.simulationSettings.performance.antSlowTickTimeout"
      :default="defaultSimulationSettings.performance.antSlowTickTimeout"
      :min="1"
      :max="20"
      :step="1"
    />

    <Slider
      label="Ant precise tick timeout"
      v-model="state.simulationSettings.performance.antPreciseTickTimeout"
      :default="defaultSimulationSettings.performance.antPreciseTickTimeout"
      :min="1"
      :max="300"
      :step="1"
    />

    <FieldGroup label="Slow tick sampler">
      <Slider
        label="Angle"
        v-model="state.simulationSettings.performance.fastFieldSampler.angle"
        :default="defaultSimulationSettings.performance.fastFieldSampler.angle"
        :min="0.1"
        :max="2*Math.PI"
        :step="0.1"
      />
      <Slider
        label="Angle samples"
        v-model="state.simulationSettings.performance.fastFieldSampler.angleSamplesCount"
        :default="defaultSimulationSettings.performance.fastFieldSampler.angleSamplesCount"
        :min="1"
        :max="20"
        :step="1"
      />
      <Slider
        label="Distance samples"
        v-model="state.simulationSettings.performance.fastFieldSampler.distanceSamplesCount"
        :default="defaultSimulationSettings.performance.fastFieldSampler.distanceSamplesCount"
        :min="1"
        :max="10"
        :step="1"
      />
    </FieldGroup>

    <FieldGroup label="Precise tick sampler">
      <Slider
        label="Angle"
        v-model="state.simulationSettings.performance.preciseFieldSampler.angle"
        :default="defaultSimulationSettings.performance.preciseFieldSampler.angle"
        :min="0.1"
        :max="2*Math.PI"
        :step="0.1"
      />
      <Slider
        label="Angle samples"
        v-model="state.simulationSettings.performance.preciseFieldSampler.angleSamplesCount"
        :default="defaultSimulationSettings.performance.preciseFieldSampler.angleSamplesCount"
        :min="1"
        :max="20"
        :step="1"
      />
      <Slider
        label="Distance samples"
        v-model="state.simulationSettings.performance.preciseFieldSampler.distanceSamplesCount"
        :default="defaultSimulationSettings.performance.preciseFieldSampler.distanceSamplesCount"
        :min="1"
        :max="10"
        :step="1"
      />
    </FieldGroup>
  </FieldGroup>

  <button class="btn" :onclick="reset">Reset All</button>
</template>

<style>
</style>
