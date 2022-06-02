<script setup lang="ts">
import { inject, watch } from 'vue';
import type { Simulation } from './simulation';
import NestItem from './NestItem.vue';
import { state } from './state';



watch(state, () => {

})

const simulation = inject<Simulation>('simulation')!;

</script>

<template>
<button class="btn" :destroyAllAnts>Destroy all ants</button>
</template>

<style>
</style>


