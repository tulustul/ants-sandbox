import { AntType, getPheromoneSampler } from "@/simulation";
import type { Simulation } from "@/ui/simulation";
import { state } from "@/ui/state";
import type { TourStep } from "./types";
import { loadTourMap, resetSettings, trackFirstAnt } from "./utils";

export function tour1(simulation: Simulation): TourStep[] {
  resetSettings();

  state.visualSettings.toHome.intensity = 0.5;
  state.visualSettings.toFood.intensity = 0.7;
  state.simulationSettings.performance.antBrainTickTimeout = 3;
  state.simulationSettings.performance.antGradientCheckTickTimeout = 3000;
  state.simulationSettings.performance.pheromoneSampler = getPheromoneSampler(
    Math.PI / 2,
    11,
    5
  );

  simulation.canvas.camera.transform.scale = 1.5;

  let pauseAt = 150;
  let hasFood = false;

  return [
    {
      description:
        "This is an ant. It left its nest on a journey of finding a source of food.",
      tickCallback: () => {
        trackFirstAnt(simulation);
        const timePassed = simulation.totalTicks >= pauseAt;
        if (timePassed) {
          state.simulationSettings.pause = true;
        }
        return timePassed ? null : "hideNextBtn";
      },
    },
    {
      description:
        "It doesn't have a clue where the food might be so it just wanders randomly.",
    },
    {
      description: `Notice the blue trail that it leaves behind. It's a "to home" pheromone marking a way back to the nest. The ants use this pheromone trail to find a way home.`,
    },
    {
      description: "Let's wait until the ant finds some food.",
      nextCallback: () => {
        pauseAt = 0;
        state.simulationSettings.pause = false;
      },
    },
    {
      description: "Let's wait until the ant finds some food.",
      tickCallback: () => {
        trackFirstAnt(simulation);

        const ant = simulation.garden.ants[0];
        if (ant.food && !pauseAt) {
          pauseAt = simulation.totalTicks + 50;
        }

        if (!pauseAt) {
          return "hideNextBtn";
        }

        const timePassed = simulation.totalTicks >= pauseAt;
        if (timePassed) {
          state.simulationSettings.pause = true;
        }
        return timePassed ? "goToNextStep" : "hideNextBtn";
      },
    },
    {
      description: `It got the food. Now the ant will try to return to the nest using the "to home" pheromone.`,
    },
    {
      description: `Notice that it also leaves a new pheromone behind. This is a "to food" pheromone marking a way to the source of food.`,
    },
    {
      description:
        "A single ant is not an efficient worker. It can easily lose track and start to wander aimlessly. Let's see if our ant will find a way home.",
      nextCallback: () => {
        pauseAt = simulation.totalTicks + 1000;
        state.simulationSettings.pause = false;
      },
    },
    {
      description:
        "A single ant is not an efficient worker. It can easily lose track and start to wander aimlessly. Let's see if our ant will find a way home.",
      tickCallback: () => {
        trackFirstAnt(simulation);

        const ant = simulation.garden.ants[0];
        if (ant.colony.stats.food > 0 && !hasFood) {
          pauseAt = simulation.totalTicks + 20;
          hasFood = true;
        }

        const timePassed = simulation.totalTicks >= pauseAt;
        if (timePassed) {
          state.simulationSettings.pause = true;
        }
        return timePassed ? "goToNextStep" : "hideNextBtn";
      },
    },
    {
      description: `Success! The ant brought the food to the nest. Now it follows the "to food" pheromone.`,
      tickCallback: () => {
        trackFirstAnt(simulation);
      },
    },
    {
      description:
        "If enough food is accumulated in the nest, a new ant is born.",
      tickCallback: () => {
        trackFirstAnt(simulation);
      },
      nextCallback: () => {
        state.simulationSettings.pause = false;
      },
    },
    {
      description: `Nothing spectacular so far. You can observe the ant or press "next" to spawn some more ants.`,
      tickCallback: () => {
        trackFirstAnt(simulation);
      },
      nextCallback: () => {
        resetSettings();
        simulation.garden.colonies[0].addAnts(AntType.worker, 25);
        simulation.canvas.camera.fitToGarden(simulation.garden);
      },
    },
    {
      description: "Let's speed up the time a little.",
      nextCallback: () => {
        state.simulationSettings.speed = 10;
      },
    },
    {
      description: "Let's speed up the time even more.",
      nextCallback: () => {
        state.simulationSettings.maxSpeed = true;
      },
    },
    {
      description: "Now, that's more spectacular than a single ant. Isn't it?",
      tickCallback: () => {
        if (simulation.totalTicks > 85_000) {
          return "goToNextStep";
        }
        return "hideNextBtn";
      },
      nextCallback: () => {
        state.simulationSettings.maxSpeed = false;
        state.simulationSettings.speed = 1;
      },
    },
    {
      description: "Now, that's more spectacular than a single ant. Isn't it?",
    },
    {
      description:
        "An ant is not a very smart creature. Its only objective is to follow the pheromone. It doesn't care about other ants or itself.",
    },
    {
      description:
        "All the beautiful complexity of ant's behavior comes from simple rules of dropping and following various pheromones.",
    },
    {
      description: "Let's check what other cool stuff the ants can do.",
      nextCallback: () => {
        return loadTourMap(simulation, "2: Two resources");
      },
    },
  ];
}
