import type { Simulation } from "@/ui/simulation";
import { state } from "@/ui/state";
import type { TourStep } from "./types";
import { resetSettings } from "./utils";

export function tour2(simulation: Simulation): TourStep[] {
  resetSettings();

  return [
    {
      description: "[TODO] Maze",
    },
    {
      description: "Let's speed up time a little ",
      nextCallback: () => (state.simulationSettings.speed = 10),
    },
    {
      description: "Let's speed up even more",
      nextCallback: () => (state.simulationSettings.maxSpeed = true),
    },
    {
      description: "The end :)",
      nextCallback: () => {
        state.tourMode = false;
        resetSettings();
      },
    },
  ];
}
