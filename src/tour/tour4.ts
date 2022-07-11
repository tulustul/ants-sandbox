import type { Simulation } from "@/ui/simulation";
import { state } from "@/ui/state";
import type { TourStep } from "./types";
import { resetSettings, trackFirstSoldier } from "./utils";

export function tour4(simulation: Simulation): TourStep[] {
  resetSettings();

  state.simulationSettings.pause = true;

  return [
    {
      description:
        "In this scenario, a hungry colony of super-aggressive ants is out of food. It has to invade the paradise world of some peaceful ants to survive.",
    },
    {
      description:
        "You will be introduced to a new kind of ants - soldiers, a specialized killing machine.",
    },
    {
      description: "Let's see how it will roll out.",
      nextCallback: () => {
        state.simulationSettings.pause = false;
        state.simulationSettings.speed = 10;
      },
    },
    {
      description: "...",
      tickCallback: () => {
        const colony = simulation.garden.colonies[0];
        if (colony.stats.soldiers >= 1) {
          state.simulationSettings.speed = 1;
          simulation.canvas.camera.transform.scale = 1.5;
          trackFirstSoldier(colony);
          return "goToNextStep";
        }
        return "hideNextBtn";
      },
    },
    {
      description:
        "We already have a couple of soldiers. Look at this scary beast.",
      tickCallback: () => {
        trackFirstSoldier(simulation.garden.colonies[0]);
      },
    },
    {
      description: "Here's how it works.",
    },
    {
      description: `When the worker meets an enemy, it starts fleeing to the nest and leaves a "to enemy" pheromone (marked in red).`,
    },
    {
      description: `Each fleeing ant visiting the nest increases war coefficient of the colony. The higher the coefficient, the more soldiers are born instead of workers.`,
    },
    {
      description: `Soldiers follow "to enemy" pheromone and kill everyone in sight. It's simple as that.`,
    },
    {
      description: `By the way, you can click/tap the other nest to see its pheromone map.`,
    },
    {
      description: `You may now observe how the war is going.`,
    },
    {
      description:
        "This concludes the tour. Learn how to love ants ❤️ It's a wonderful species ☺️",
      nextCallback: () => {
        state.tourMode = false;
        resetSettings();
      },
    },
  ];
}
