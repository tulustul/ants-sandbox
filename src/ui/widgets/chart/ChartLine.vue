<script setup lang="ts">
import { inject, onUnmounted, type PropType } from "vue";
import type { ChartState } from "./types";
import { colorToHexString } from "@/utils/colors";

const props = defineProps({
  color: {
    type: Number,
    required: true,
  },
  data: {
    type: Array as PropType<number[]>,
    required: true,
  },
});

const chartState = inject<ChartState>("chartProvider")!;

const id = chartState.lastId++;
chartState.charts.push({
  id,
  type: "line",
  color: colorToHexString(props.color),
  data: props.data,
});

onUnmounted(() => {
  const index = chartState.charts.findIndex((chart) => chart.id === id);
  if (index !== -1) {
    chartState.charts.splice(index, 1);
  }
});
</script>

<template></template>

<style scoped></style>
