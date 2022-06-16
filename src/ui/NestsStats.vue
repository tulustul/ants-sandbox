<script setup lang="ts">
import { inject, ref, type Ref } from "vue";

import { useIntervalFn } from "@vueuse/core";
import type { Simulation } from "./simulation";
import { RadioGroup, RadioOption } from "./forms";
import NestsChart from "./widgets/NestsChart.vue";
import type { Nest } from "@/life/nest";

const simulation = inject<Simulation>("simulation")!;

const nests = ref(simulation.garden.nests) as Ref<Nest[]>;

useIntervalFn(() => {
  nests.value = simulation.garden.nests;
}, 200);

let tab = ref("current");
</script>

<template>
  <RadioGroup v-model="tab">
    <RadioOption label="Current" value="current" />
    <RadioOption label="Warfare" value="warfare" />
    <RadioOption label="Total" value="total" />
  </RadioGroup>

  <template v-if="tab === 'current'">
    <NestsChart
      :nests="nests"
      label="Current food"
      field="food"
      :yAxisPrecision="0"
    />
    <NestsChart :nests="nests" label="Living ants" field="livingAnts" />
    <NestsChart :nests="nests" label="Workers" field="workers" />
  </template>

  <template v-if="tab === 'warfare'">
    <NestsChart :nests="nests" label="Killed ants" field="killedAnts" />
    <NestsChart
      :nests="nests"
      label="Killed enemy ants"
      field="killedEnemyAnts"
    />
    <NestsChart :nests="nests" label="Soldiers" field="soldiers" />
    <NestsChart
      :nests="nests"
      label="War coefficient"
      field="warCoef"
      :yAxisPrecision="3"
    />
  </template>

  <template v-if="tab === 'total'">
    <NestsChart :nests="nests" label="Total food" field="totalFood" />
    <NestsChart :nests="nests" label="Total ants" field="totalAnts" />
    <NestsChart :nests="nests" label="Starved ants" field="starvedAnts" />
  </template>
</template>

<style scoped></style>
