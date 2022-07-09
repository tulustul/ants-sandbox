import type { Simulation } from "@/ui/simulation";
import { state } from "@/ui/state";
import type { TourStep } from "./types";
import { loadTourMap, resetSettings } from "./utils";

export function tour3(simulation: Simulation): TourStep[] {
  resetSettings();

  state.simulationSettings.pause = true;

  let pauseAt = 0;

  return [
    {
      description:
        "Ants can solve mazes! This one is simple but they can solve as easily much more complex mazes.",
      nextCallback: () => {
        state.simulationSettings.pause = false;
        state.simulationSettings.speed = 12;
      },
    },
    {
      description: "...",
      tickCallback: () => {
        if (simulation.garden.colonies[0].stats.totalFood >= 150) {
          return "goToNextStep";
        }
        return "hideNextBtn";
      },
      nextCallback: () => {
        state.simulationSettings.speed = 1;
      },
    },
    {
      description: "Path found. Easy-peasy. But it's not perfect yet.",
    },
    {
      description: "Let's now look at how the ants optimize the path.",
      nextCallback: () => {
        state.simulationSettings.maxSpeed = true;
        pauseAt = simulation.totalTicks + 15000;
      },
    },
    {
      description:
        "Notice the path's micro-optimizations. The pheromone trails show the shadows of old paths.",

      tickCallback: () => {
        if (pauseAt > simulation.totalTicks) {
          return "hideNextBtn";
        }
        state.simulationSettings.maxSpeed = false;
        state.simulationSettings.speed = 1;
      },
      nextCallback: () => {
        state.simulationSettings.maxSpeed = true;
      },
    },
    {
      description: "Prepare for the final tour!",
      nextCallback: () => {
        return loadTourMap(simulation, "4: Ants Wars");
      },
    },
  ];
}

// nextCallback: () => {
//   state.tourMode = false;
//   resetSettings();
// },
