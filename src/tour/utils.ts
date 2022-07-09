import {
  AntType,
  Colony,
  defaultSimulationSettings,
  defaultVisualSettings,
} from "@/simulation";
import predefinedMaps from "@/ui/maps/predefinedMaps";
import { loadMap } from "@/ui/maps/utils";
import type { Simulation } from "@/ui/simulation";
import { state } from "@/ui/state";
import { transferFields } from "@/utils";

export function resetSettings() {
  transferFields(state.simulationSettings, defaultSimulationSettings);
  transferFields(state.visualSettings, defaultVisualSettings);
  state.drawing.type = null;
  state.movingColony = false;
}

export function loadTourMap(simulation: Simulation, name: string) {
  return loadMap(simulation, name, predefinedMaps.tour);
}

export function trackFirstAnt(simulation: Simulation) {
  const ant = simulation.garden.ants[0];
  const colony = simulation.garden.colonies[0];
  const sprite = ant ? ant.sprite : colony.sprite;
  const camera = simulation.canvas.camera;
  camera.centerAt(sprite.x, sprite.y);
}

export function trackFirstSoldier(colony: Colony) {
  const soldier = colony.ants.find((ant) => ant.type === AntType.soldier)!;
  const camera = colony.garden.canvas.camera;
  camera.centerAt(soldier.sprite.x, soldier.sprite.y);
}
