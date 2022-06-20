<script setup lang="ts">
import { inject, ref, type Ref } from "vue";

import { useIntervalFn } from "@vueuse/core";
import type { Simulation } from "./simulation";
import { RadioGroup, RadioOption } from "./forms";
import ColoniesChart from "./widgets/ColoniesChart.vue";
import type { Colony } from "@/life/colony";

const simulation = inject<Simulation>("simulation")!;

const colonies = ref(simulation.garden.colonies) as Ref<Colony[]>;

useIntervalFn(() => {
  colonies.value = simulation.garden.colonies;
}, 200);

let tab = ref("domestic");
</script>

<template>
  <RadioGroup v-model="tab">
    <RadioOption label="Domestic" value="domestic" />
    <RadioOption label="Warfare" value="warfare" />
    <RadioOption label="Total" value="total" />
  </RadioGroup>

  <template v-if="tab === 'domestic'">
    <ColoniesChart
      :colonies="colonies"
      label="Current food"
      field="food"
      :yAxisPrecision="0"
    />
    <ColoniesChart
      :colonies="colonies"
      label="Living ants"
      field="livingAnts"
    />
    <ColoniesChart :colonies="colonies" label="Workers" field="workers" />
    <ColoniesChart :colonies="colonies" label="Soldiers" field="soldiers" />
  </template>

  <template v-if="tab === 'warfare'">
    <ColoniesChart
      :colonies="colonies"
      label="Killed ants"
      field="killedAnts"
    />
    <ColoniesChart
      :colonies="colonies"
      label="Killed enemy ants"
      field="killedEnemyAnts"
    />
    <ColoniesChart :colonies="colonies" label="Soldiers" field="soldiers" />
    <ColoniesChart
      :colonies="colonies"
      label="War coefficient"
      field="warCoef"
      :yAxisPrecision="3"
    />
  </template>

  <template v-if="tab === 'total'">
    <ColoniesChart :colonies="colonies" label="Total food" field="totalFood" />
    <ColoniesChart :colonies="colonies" label="Total ants" field="totalAnts" />
    <ColoniesChart
      :colonies="colonies"
      label="Starved ants"
      field="starvedAnts"
    />
  </template>
</template>

<style scoped></style>
