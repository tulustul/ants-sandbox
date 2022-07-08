import { reactive, watch } from "vue";

import {
  getPheromoneSampler,
  simulationSettings,
  gardenSettings,
  visualSettings,
  type FieldSampler,
} from "@/simulation/settings";
import { simulationStats } from "@/ui/stats";
import { transferFields } from "@/utils";

export type DrawingType = "food" | "rock" | null;

const _state = {
  simulationSettings,
  simulationStats,
  visualSettings,
  gardenSettings,
  drawing: {
    type: null as DrawingType,
    radius: 10,
    intensity: 10,
    horizontalMirror: false,
    verticalMirror: false,
    erasing: false,
  },
  trackedColony: null as number | null,
  movingColony: false,
  imageFile: null as File | null,
  loadedMap: null as string | null,
  tourMode: false,
  isWelcomed: false,
};

export const state = reactive(_state);

storeSettings("simulationSettings", state.simulationSettings);
storeSettings("gardenSettings", state.gardenSettings);
storeSettings("visualSettings", state.visualSettings);

_state.isWelcomed = !!localStorage.getItem("isWelcomed");
_state.tourMode = !_state.isWelcomed;

syncFieldSampler(state.simulationSettings.performance.pheromoneSampler);
syncFieldSampler(state.simulationSettings.performance.preciseFieldSampler);

function syncFieldSampler(sampler: FieldSampler) {
  watch(sampler, () => {
    const newSampler = getPheromoneSampler(
      sampler.angle,
      sampler.angleSamplesCount,
      sampler.distanceSamplesCount
    );
    transferFields(sampler, newSampler);
  });
}

function storeSettings(key: string, data: any) {
  watch(data, () => {
    if (!state.tourMode) {
      localStorage.setItem(key, JSON.stringify(data));
    }
  });
}
