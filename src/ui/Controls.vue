<script setup lang="ts">
import { ref } from "vue";
import { useIntervalFn } from "@vueuse/core";
import {
  PauseIcon,
  PlayIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/vue/solid";

import { simulationStats } from "@/ui/stats";

import Slider from "./forms/Slider.vue";
import { state } from "./state";

const lowPerformance = ref(false);

let lowPerformanceRepeats = 0;

useIntervalFn(() => {
  const isLowPerformance =
    simulationStats.fps < 50 && simulationStats.simulationTime >= 10;
  if (isLowPerformance) {
    lowPerformanceRepeats++;
  } else {
    lowPerformanceRepeats = 0;
  }
  lowPerformance.value = lowPerformanceRepeats > 10;

  const targetSimTime = 15;
  const simTime = simulationStats.simulationTime;
  if (state.simulationSettings.maxSpeed && !state.simulationSettings.pause) {
    let speed = (state.simulationSettings.speed * targetSimTime) / simTime;
    state.simulationSettings.speed = Math.min(Number(speed.toFixed(1)), 500);
  }
}, 100);

function togglePause() {
  state.simulationSettings.pause = !state.simulationSettings.pause;
}

function toggleMaxSpeed() {
  state.simulationSettings.maxSpeed = !state.simulationSettings.maxSpeed;
}
</script>

<template>
  <div>
    <div v-if="lowPerformance" class="performance-warning">Low perfomance</div>

    <div class="controls">
      <button class="btn btn-icon shadow" @click="togglePause">
        <PlayIcon v-if="state.simulationSettings.pause" />
        <PauseIcon v-else />
      </button>
      <button
        class="btn btn-icon btn-max-speed shadow"
        :class="{ 'btn-primary': state.simulationSettings.maxSpeed }"
        @click="toggleMaxSpeed"
      >
        <ChevronDoubleRightIcon />
      </button>

      <Slider
        v-model="state.simulationSettings.speed"
        class="grow shadow"
        label="Speed"
        :default="1"
        :min="0.1"
        :max="10"
        :step="0.1"
        :logarithmic="true"
        @update:modelValue="() => (state.simulationSettings.maxSpeed = false)"
      />
    </div>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  align-items: flex-end;
  gap: 5px;
}
.performance-warning {
  color: red;
  margin-bottom: 10px;
  background-color: rgba(0, 0, 0, 0.4);
  padding: 2px 10px;
  display: inline-block;
}
.btn-icon {
  --size: 45px;
}
.btn-max-speed {
  padding: 6px;
}
</style>
