import { defaultSimulationSettings, defaultVisualSettings } from "@/simulation";
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
