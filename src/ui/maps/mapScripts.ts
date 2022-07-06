import type predefinedMaps from "./predefinedMaps";

import { tour1 } from "@/tour/tour1";
import { tour2 } from "@/tour/tour2";
import type { TourFunction } from "@/tour/types";

export default {
  "1: Single ant": tour1,
  "2: Maze": tour2,
} as Record<keyof typeof predefinedMaps.tour, TourFunction>;
