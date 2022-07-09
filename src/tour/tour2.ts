import { loadMap } from "@/ui/maps/utils";
import type { Simulation } from "@/ui/simulation";
import { state } from "@/ui/state";
import type { TourStep } from "./types";
import { loadTourMap, resetSettings } from "./utils";

export function tour2(simulation: Simulation): TourStep[] {
  resetSettings();

  let pauseAt = 0;

  return [
    {
      description:
        "In this example, there are two sources of food - one closer to the nest, and the other further away and hidden behind some rocks.",
    },
    {
      description:
        "Let's speed up the time and see how our ants will handle this situation.",
      nextCallback: () => {
        state.simulationSettings.speed = 10;
      },
    },
    {
      description: "...",
      tickCallback: () => {
        if (simulation.totalTicks > 3_000) {
          return "goToNextStep";
        }
        return "hideNextBtn";
      },
      nextCallback: () => {
        state.simulationSettings.speed = 1;
      },
    },
    {
      description:
        "As you can see, the ants found a way to both resources, but most of them are taking the shorter path.",
    },
    {
      description:
        "This is because the longer the ant walks, the weaker pheromone it leaves. Therefore the pheromone to the closer resource is stronger and the ants choose this path more often.",
    },
    {
      description: "Let's speed up even more.",
      nextCallback: () => (state.simulationSettings.speed = 20),
    },
    {
      description: "...",
      tickCallback: () => {
        const foodField = simulation.garden.foodField;
        const index1 = 8 * foodField.width + (foodField.width - 12);
        const index2 = 19 * foodField.width + (foodField.width - 4);
        if (foodField.data[index1] === 0 && foodField.data[index2] === 0) {
          state.simulationSettings.speed = 1;
          state.simulationSettings.pause = true;
          return "goToNextStep";
        }
        return "hideNextBtn";
      },
    },
    {
      description: "Now look closely. The first resource is depleting.",
    },
    {
      description:
        "We don't want the ants to follow the old trail once there is no more food at the destination. It's a waste of energy and time.",
    },
    {
      description: `Here's how the ants solve it. When an ant finds food, it drops a special marker that says: "here's food".`,
    },
    {
      description: `When the other ant discovers this marker and cannot find food in the vicinity for some time, it drops another pheromone that blocks the "to food" pheromone, effectively removing the path to that place.`,
    },
    {
      description: `Let's see it in action.`,
      nextCallback: () => {
        pauseAt = simulation.totalTicks + 3000;
        state.simulationSettings.pause = false;
        state.simulationSettings.speed = 5;
      },
    },
    {
      description: "...",
      tickCallback: () => {
        if (simulation.totalTicks >= pauseAt) {
          state.simulationSettings.pause = true;
          return "goToNextStep";
        }
        return "hideNextBtn";
      },
    },
    {
      description:
        "As you can see, the path to the first resource is gone and the ants started to seek new resources randomly.",
    },
    {
      description:
        "Eventually, most ants will take the path to the second resource.",
      nextCallback: () => {
        state.simulationSettings.pause = false;
      },
    },
    {
      description: "Ready for another scenario?",
      nextCallback: () => {
        return loadTourMap(simulation, "3: Maze");
      },
    },
  ];
}

// nextCallback: () => {
//   state.tourMode = false;
//   resetSettings();
// },
