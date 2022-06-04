<script setup lang="ts">
import { inject, onUnmounted, ref, watch } from 'vue';
import type { Simulation } from './simulation';
import { state } from './state';

const simulation = inject<Simulation>('simulation')!;
let nest = getTrackedNest()

const food = ref(nest?.food)
const totalFood = ref(nest?.totalFood)
const ants = ref(nest?.ants.length)
const totalAnts = ref(nest?.totalAnts)
const deadAnts = ref(nest?.deadAnts)

const interval = setInterval(() => {
  food.value = nest?.food
  totalFood.value = nest?.totalFood
  ants.value = nest?.ants.length
  totalAnts.value = nest?.totalAnts
  deadAnts.value = nest?.deadAnts
},100)

onUnmounted(() => {
  clearInterval(interval)
})

watch(state, () => {
  nest = getTrackedNest()
})

function getTrackedNest() {
  return simulation.garden.nests.find(nest=>nest.id===state.trackedNest)
}

function destroyAllAnts() {
  while(nest?.ants.length) {
    nest.ants[0].destroy()
  }
}

</script>

<template>
  <div>Current food: {{food}} </div>
  <div>Total food: {{totalFood}} </div>
  <div>Current ants: {{ants}} </div>
  <div>Total ants: {{totalAnts}} </div>
  <div>Dead ants : {{deadAnts}} </div>

  <button class="btn" :onclick="destroyAllAnts">Destroy all ants</button>

</template>

<style>
</style>


