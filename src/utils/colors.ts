import type { Garden } from "@/life/garden";
import type { Simulation } from "@/ui/simulation";

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
