<script setup lang="ts">
import { ref, onMounted, provide } from 'vue';

import { Canvas } from '@/canvas';

import Ui from './Ui.vue'
import { Simulation } from './simulation';
import { state } from './state';
import type { Field } from '@/life/field';
import { loadResources } from '@/canvas/resources';

const canvasRef = ref();

let canvas: Canvas;
let simulation:Simulation

onMounted(async () => {
  canvas = new Canvas(canvasRef.value);
  simulation = new Simulation(canvas);
  provide('simulation', simulation);

  window.addEventListener('contextmenu', e => {
    e.preventDefault();
  }, false);

  await loadResources();
  onReady()
})

async function onReady() {
  simulation.start()
  // canvas.camera.moveTo(-simulation.garden.width/2+500,-simulation.garden.height/2+500)

  canvas.app.ticker.add(() => {
    simulation.tick()
    simulation.garden.fieldsLayer.tick();
    canvas.camera.update()
  })
}

function onMouseMove(event: MouseEvent) {
  if (event.buttons === 1) {
    canvas.camera.moveBy(event.movementX, event.movementY)
  }
  if (state.drawing && event.buttons === 2) {
    const [x, y] = canvas.camera.screenToCanvas(event.clientX, event.clientY);

    let field: Field|null=null;
    if (state.drawing.type === 'food') {
      field = simulation.garden.foodField
    } else if (state.drawing.type === 'rock'){
      field = simulation.garden.rockField
    }
    if (field) {
      field.draw(x, y, state.drawing.radius, state.drawing.intensity);
      simulation.garden.foodGraphics.texture.update();
      simulation.garden.rockGraphics.texture.update();
    }
  }
  if (event.ctrlKey) {
    const [x, y] = canvas.camera.screenToCanvas(event.clientX, event.clientY);
    const toFood= simulation.garden.nests[0].toFoodField
    const index = toFood.getIndex(x,y);
    const foodVal = toFood.data[index]
    const foodMaxVal = toFood.maxValues.data[index]
    console.log({foodVal,foodMaxVal})
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
