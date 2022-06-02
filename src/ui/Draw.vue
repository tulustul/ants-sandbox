<script setup lang="ts">
import { state, type DrawingType } from './state';
import Slider from './forms/Slider.vue';

function toggleDraw(type: DrawingType) {
  if (state.drawing.type === type) {
    state.drawing.type = null;
  } else {
    state.drawing.type = type
  }
}
</script>

<template>
<div>
  <button
    class="btn"
    :class="{enabled: state.drawing.type === 'food'}"
    :onclick="()=>toggleDraw('food')"
  >
    Draw food
  </button>
  <button
    class="btn"
    :class="{enabled: state.drawing.type === 'rock'}"
    :onclick="()=>toggleDraw('rock')"
  >
    Draw rock
  </button>
</div>

<Slider
  label="Radius"
  v-model="state.drawing.radius"
  :min="0"
  :max="30"
  :step="1"
/>

<Slider
  label="Intensity"
  v-model="state.drawing.intensity"
  :min="0"
  :max="100"
  :step="1"
/>

</template>

<style>
button.enabled {
  background-color: darkgreen;
}
</style>
