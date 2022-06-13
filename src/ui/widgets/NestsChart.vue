<script lang="ts" setup>
import type { PropType } from "vue";

import type { Nest, NestHistory } from "@/life/nest";
import { Chart, ChartLine } from "@/ui/widgets";

defineProps({
  nests: {
    type: Array as PropType<Nest[]>,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  field: {
    type: String as PropType<keyof NestHistory>,
    required: true,
  },
});
</script>

<template>
  <div>
    <h3>{{ label }}</h3>
    <Chart>
      <ChartLine
        v-for="nest of nests"
        v-bind:key="nest.primeId"
        :color="nest.color"
        :data="nest.history[field]"
      />
    </Chart>
  </div>
</template>

<style scoped></style>
