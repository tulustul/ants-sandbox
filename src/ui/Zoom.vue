<script setup lang="ts">
  import { inject } from 'vue';
  import type { Simulation } from './simulation';

  let simulation= inject<Simulation>('simulation')!;

  function zoomOut() {
    simulation.canvas.camera.scaleByWithEasing(0.8, window.innerWidth/2, window.innerHeight/2);
  }

  function zoomIn() {
    simulation.canvas.camera.scaleByWithEasing(1.2, window.innerWidth/2, window.innerHeight/2);
  }
</script>

<template>
  <div class="zooms">
    <button :onclick="zoomIn">+</button>
    <button :onclick="zoomOut">-</button>
  </div>
</template>

<style scoped>
  .zooms {
    display: flex;
    flex-direction: column;
  }
</style>
