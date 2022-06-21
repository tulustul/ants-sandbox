<script setup lang="ts">
import Slider from "./forms/Slider.vue";
import { state } from "./state";
import { defaultSimulationSettings } from "@/life/settings";
import { transferFields } from "@/utils/object";
import FieldGroup from "./forms/FieldGroup.vue";

function reset() {
  transferFields(state.simulationSettings, defaultSimulationSettings);
}
</script>

<template>
  <p><strong>Warning:</strong> Don't touch :)</p>

  <Slider
    v-model="state.simulationSettings.pheromoneDissipation"
    label="Pheromone dissipation"
    :default="defaultSimulationSettings.pheromoneDissipation"
    :min="1"
    :max="1.05"
    :step="0.001"
  />

  <Slider
    v-model="state.simulationSettings.antSeekRandomness"
    label="Ant seeking randomness"
    :default="defaultSimulationSettings.antSeekRandomness"
    :min="0.5"
    :max="10"
    :step="0.1"
  />

  <FieldGroup label="Performance">
    <Slider
      v-model="state.simulationSettings.performance.antSlowTickTimeout"
      label="Ant tick timeout"
      :default="defaultSimulationSettings.performance.antSlowTickTimeout"
      :min="1"
      :max="20"
      :step="1"
    />

    <Slider
      v-model="state.simulationSettings.performance.antPreciseTickTimeout"
      label="Ant precise tick timeout"
      :default="defaultSimulationSettings.performance.antPreciseTickTimeout"
      :min="10"
      :max="500"
      :step="10"
    />

    <FieldGroup label="Slow tick sampler">
      <Slider
        v-model="state.simulationSettings.performance.pheromoneSampler.angle"
        label="Angle"
        :default="defaultSimulationSettings.performance.pheromoneSampler.angle"
        :min="0.1"
        :max="2 * Math.PI"
        :step="0.1"
      />
      <Slider
        v-model="
          state.simulationSettings.performance.pheromoneSampler
            .angleSamplesCount
        "
        label="Angle samples"
        :default="
          defaultSimulationSettings.performance.pheromoneSampler
            .angleSamplesCount
        "
        :min="1"
        :max="20"
        :step="1"
      />
      <Slider
        v-model="
          state.simulationSettings.performance.pheromoneSampler
            .distanceSamplesCount
        "
        label="Distance samples"
        :default="
          defaultSimulationSettings.performance.pheromoneSampler
            .distanceSamplesCount
        "
        :min="1"
        :max="10"
        :step="1"
      />
    </FieldGroup>

    <FieldGroup label="Precise tick sampler">
      <Slider
        v-model="
          state.simulationSettings.performance.precisePheromoneSampler.angle
        "
        label="Angle"
        :default="
          defaultSimulationSettings.performance.precisePheromoneSampler.angle
        "
        :min="0.1"
        :max="2 * Math.PI"
        :step="0.1"
      />
      <Slider
        v-model="
          state.simulationSettings.performance.precisePheromoneSampler
            .angleSamplesCount
        "
        label="Angle samples"
        :default="
          defaultSimulationSettings.performance.precisePheromoneSampler
            .angleSamplesCount
        "
        :min="1"
        :max="20"
        :step="1"
      />
      <Slider
        v-model="
          state.simulationSettings.performance.precisePheromoneSampler
            .distanceSamplesCount
        "
        label="Distance samples"
        :default="
          defaultSimulationSettings.performance.precisePheromoneSampler
            .distanceSamplesCount
        "
        :min="1"
        :max="10"
        :step="1"
      />
    </FieldGroup>
  </FieldGroup>

  <button class="btn" :onclick="reset">Reset All</button>
</template>

<style></style>
