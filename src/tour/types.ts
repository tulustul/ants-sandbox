import type { Simulation } from "@/ui/simulation";

export type TourStepTickResult = void | null | "hideNextBtn" | "goToNextStep";

export type TourStep = {
  description: string;
  nextCallback?: () => void | Promise<void>;
  tickCallback?: () => TourStepTickResult;
};

export type TourFunction = (simulation: Simulation) => TourStep[];
