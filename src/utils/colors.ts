import type { Garden } from "@/life/garden";

const COLORS = [
  0xbd7836, // brown
  0x24ff45, // green
  0x24fffb, // cyan
  0xffe024, // yellow
  0xff5458, // red
  0x98c1fb, // light blue
  0xaaaaaa, // dark grey
  0xfbdb98, // pastel orange
  0xb898fb, // light purple
  0xcccccc, // grey
  0xcd55aa, // pink
];

export function getNextColor(garden: Garden): number {
  const usedColors = new Set(garden.nests.map((nest) => nest.color));
  for (const color of COLORS) {
    if (!usedColors.has(color)) {
      return color;
    }
  }

  // Random color.
  return Math.round(Math.random() * 0xffffff);
}

export function colorToHexString(color: number): string {
  return `#${color.toString(16)}`;
}

export function desaturateColor(color: number, desaturation: number) {
  let [r, g, b] = toRGB(color);
  const mean = (r + g + b) / 3;
  r = Math.round(r + (mean - r) * desaturation);
  g = Math.round(g + (mean - g) * desaturation);
  b = Math.round(b + (mean - b) * desaturation);
  return fromRGB(r, g, b);
}

export function toRGB(color: number): [number, number, number] {
  const hex = color.toString(16);
  const r = Number(`0x${hex[0]}${hex[1]}`);
  const g = Number(`0x${hex[2]}${hex[3]}`);
  const b = Number(`0x${hex[4]}${hex[5]}`);
  return [r, g, b];
}

export function fromRGB(r: number, g: number, b: number): number {
  return Number(`0x${r.toString(16)}${g.toString(16)}${b.toString(16)}`);
}
