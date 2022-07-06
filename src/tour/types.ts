import type { Simulation } from "@/ui/simulation";

export type TourStep = {
  description: string;
  nextCallback?: () => void | Promise<void>;
};

export type TourFunction = (simulation: Simulation) => TourStep[];
