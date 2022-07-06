import { AntType } from "@/simulation";
import type { Simulation } from "@/ui/simulation";
import { state } from "@/ui/state";
import type { TourStep } from "./types";
import { loadTourMap, resetSettings } from "./utils";

export function tour1(simulation: Simulation): TourStep[] {
  resetSettings();

  return [
    {
      description: "[TODO] This is ant. Ants are nice.",
    },
    {
      description: "Spawn more ants.",
      nextCallback: () =>
        simulation.garden.colonies[0].addAnts(AntType.worker, 25),
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
      description: "Fun?",
      nextCallback: () => loadTourMap(simulation, "2: Maze"),
    },
  ];
}
