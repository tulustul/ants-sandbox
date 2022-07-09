import type predefinedMaps from "./predefinedMaps";

import { tour1 } from "@/tour/tour1";
import { tour2 } from "@/tour/tour2";
import type { TourFunction } from "@/tour/types";
import { tour3 } from "@/tour/tour3";
import { tour4 } from "@/tour/tour4";

export default {
  "1: Single ant": tour1,
  "2: Two resources": tour2,
  "3: Maze": tour3,
  "4: Ants Wars": tour4,
} as Record<keyof typeof predefinedMaps.tour, TourFunction>;
