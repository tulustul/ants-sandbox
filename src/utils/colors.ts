import type { Garden } from "@/life/garden";
import type { Simulation } from "@/ui/simulation";

const COLORS = [
  0xdc143c, 0xff83fa, 0x8470ff, 0x1c86ee, 0x00f5ff, 0x00ee76, 0xc0ff3e,
  0xffd700, 0x8b5a00, 0xff8000, 0xee3b3b,
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
