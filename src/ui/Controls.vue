<script setup lang="ts">
import { PauseIcon, PlayIcon } from "@heroicons/vue/solid";

import Slider from "./forms/Slider.vue";
import { state } from "./state";

function togglePause() {
  state.simulationSettings.pause = !state.simulationSettings.pause;
}
</script>

<template>
  <div class="controls">
    <button class="btn btn-icon shadow" :onclick="togglePause">
      <PlayIcon v-if="state.simulationSettings.pause" />
      <PauseIcon v-else />
    </button>

    <Slider
      v-model="state.simulationSettings.speed"
      class="grow shadow"
      label="Speed"
      :default="1"
      :min="0.1"
      :max="5"
      :step="0.1"
    />
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}
.btn-icon {
  --size: 45px;
}
</style>
