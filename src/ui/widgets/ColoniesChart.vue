<script lang="ts" setup>
import type { PropType } from "vue";

import type { Colony, ColonyHistory } from "@/life/colony";
import { Chart, ChartLine } from "@/ui/widgets";
import Tooltip from "./Tooltip.vue";

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
  tooltip: String,
  yAxisPrecision: Number,
});
</script>

<template>
  <div>
    <h3 class="row space-between">
      <span>{{ label }}</span>
      <Tooltip v-if="tooltip">
        {{ tooltip }}
      </Tooltip>
    </h3>
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
