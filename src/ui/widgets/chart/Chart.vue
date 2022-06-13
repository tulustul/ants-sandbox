<script setup lang="ts">
import { onMounted, provide, reactive, ref } from "vue";
import type { ChartState } from "./types";
import { drawLineChart } from "./line";
import { MAX_POINTS } from "./const";
import { useIntervalFn } from "@vueuse/core";

const canvasRef = ref<HTMLCanvasElement>();

const state = reactive<ChartState>({
  lastId: 0,
  charts: [],
});

provide("chartProvider", state);

let ctx: CanvasRenderingContext2D;

const minValue = ref(0);
const maxValue = ref(0);

onMounted(() => {
  ctx = canvasRef.value!.getContext("2d")!;
  draw();
});

useIntervalFn(draw, 500);

function draw() {
  let _minValue = Infinity;
  let _maxValue = 0;

  ctx.clearRect(0, 0, canvasRef.value!.width, canvasRef.value!.height);

  for (const chart of state.charts) {
    const dataStep = Math.ceil(chart.data.length / MAX_POINTS);
    for (let i = 0; i < chart.data.length; i += dataStep) {
      const value = chart.data[i];
      if (value < _minValue) {
        _minValue = value;
      }
      if (value > _maxValue) {
        _maxValue = value;
      }
    }
  }

  for (const chart of state.charts) {
    if (chart.type === "line") {
      drawLineChart(canvasRef.value!, ctx, chart, _minValue, _maxValue);
    }
  }

  minValue.value = _minValue;
  maxValue.value = _maxValue;
}
</script>

<template>
  <div class="chart">
    <canvas ref="canvasRef"></canvas>
    <div class="y-axis">
      <span>{{ maxValue }}</span>
      <span>{{ minValue }}</span>
    </div>
  </div>
  <slot />
</template>

<style scoped>
canvas {
  background-color: black;
  height: 120px;
  width: 100%;
}
.chart {
  display: flex;
  position: relative;
  border-radius: 10px;
  overflow: hidden;
}
.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 12px;
  position: absolute;
  height: 100%;
  z-index: 1;
}
.y-axis span {
  background-color: rgba(0, 0, 0, 0.7);
  padding-left: 5px;
}
</style>
