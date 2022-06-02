<script setup lang="ts">
import { ref, onMounted, provide, onBeforeMount } from 'vue';

import { Canvas } from '@/canvas';
import { Garden } from '@/life/garden';

import Ui from './Ui.vue'
import { Simulation } from './simulation';
import { state } from './state';
import type { Field } from '@/life/field';

const canvasRef = ref();

let canvas: Canvas;
let simulation:Simulation

onMounted(() => {
  canvas = new Canvas(canvasRef.value);
  simulation = new Simulation(canvas);
  canvas.camera.moveTo(-simulation.garden.width/2+500,-simulation.garden.height/2+500)

  provide('simulation', simulation);

  canvas.app.ticker.add(() => {
    simulation.tick()
    canvas.camera.update()
  })

  window.addEventListener('contextmenu', e => {
    e.preventDefault();
  }, false);
})

function onMouseMove(event: MouseEvent) {
  if (event.buttons === 1) {
    canvas.camera.moveBy(event.movementX, event.movementY)
  }
  if (state.drawing && event.buttons === 2) {
    const [x, y] = canvas.camera.screenToCanvas(event.clientX, event.clientY);

    let field: Field|null=null;
    let value = 0
    if (state.drawing.type === 'food') {
      field = simulation.garden.foodField
    } else if (state.drawing.type === 'rock'){
      field = simulation.garden.rockField
    }
    if (field) {
      field.draw(x, y, state.drawing.radius, state.drawing.intensity);
      field.graphics.texture.update();
    }
  }
}

function onWheel(event: WheelEvent) {
  const scale = event.deltaY > 0 ? 0.8: 1.2;
  canvas.camera.scaleByWithEasing(scale, event.clientX, event.clientY)
}
</script>

<template>
<canvas ref="canvasRef" :onmousemove="onMouseMove" :onwheel="onWheel"></canvas>
<Ui/>
</template>

<style>
@import '@/assets/base.css';

#app {
  height: 100vh;
}

</style>
