<script lang="ts" setup>
import type { PropType } from "vue";

import type { Colony, ColonyHistory } from "@/life/colony";
import { Chart, ChartLine } from "@/ui/widgets";

defineProps({
  colonies: {
    type: Array as PropType<Colony[]>,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  field: {
    type: String as PropType<keyof ColonyHistory>,
    required: true,
  },
  yAxisPrecision: Number,
});
</script>

<template>
  <div>
    <h3>{{ label }}</h3>
    <Chart :yAxisPrecision="yAxisPrecision">
      <ChartLine
        v-for="colony of colonies"
        v-bind:key="colony.primeId"
        :color="colony.color"
        :data="colony.history[field]"
      />
    </Chart>
  </div>
</template>

<style scoped></style>
