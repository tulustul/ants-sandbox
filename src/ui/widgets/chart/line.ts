import { MAX_POINTS } from "./const";
import type { ChartData } from "./types";

export function drawLineChart(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  chart: ChartData,
  minValue: number,
  maxValue: number
) {
  function getYValue(value: number) {
    return (
      canvas.height -
      ((value - minValue) / (maxValue - minValue)) * canvas.height
    );
  }
  ctx.strokeStyle = chart.color;
  ctx.lineWidth = 3;

  let x = 0;

  ctx.beginPath();
  ctx.moveTo(x, getYValue(chart.data[0]));
  const dataStep = Math.ceil(chart.data.length / MAX_POINTS);
  const xStep = (canvas.width / chart.data.length) * dataStep;
  for (let i = 1; i < chart.data.length; i += dataStep) {
    x += xStep;
    ctx.lineTo(x, getYValue(chart.data[i]));
  }
  ctx.stroke();
}
