<script setup lang="ts">
import Slider from './forms/Slider.vue';
import { state } from './state';


function togglePause() {
  state.simulationSettings.pause = !state.simulationSettings.pause;
}

</script>

<template>
  <div class="controls">
    <button :onclick="togglePause">
      {{state.simulationSettings.pause ? "Play" : "Pause"}}
    </button>

    <Slider
      class="grow"
      label="Speed"
      v-model="state.simulationSettings.speed"
      :default="1"
      :min="0.1"
      :max="10"
      :step="0.1"
    />
  </div>
</template>

<style scoped>
  .controls {
    display: flex;
    align-items: flex-end;
    gap: 15px;
  }
  button {
    border-radius: 50%;
    height: 50px;
    width: 50px;
  }
</style>
