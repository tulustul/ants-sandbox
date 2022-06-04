import { reactive, watch } from "vue";

import {
  getFieldSampler,
  simulationSettings,
  gardenSettings,
  visualSettings,
  type FieldSampler,
} from "@/life/settings";
import { simulationStats } from "@/life/stats";
import { transferFields } from "@/utils/object";

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
  },
  trackedNest: 1,
};

export const state = reactive(_state);

storeSettings("simulationSettings", state.simulationSettings);
storeSettings("gardenSettings", state.gardenSettings);
storeSettings("visualSettings", state.visualSettings);

syncFieldSampler(state.simulationSettings.performance.fastFieldSampler);
syncFieldSampler(state.simulationSettings.performance.preciseFieldSampler);

function syncFieldSampler(sampler: FieldSampler) {
  watch(sampler, () => {
    const newSampler = getFieldSampler(
      sampler.angle,
      sampler.angleSamplesCount,
      sampler.distanceSamplesCount
    );
    transferFields(sampler, newSampler);
  });
}

function storeSettings(key: string, data: any) {
  watch(data, () => localStorage.setItem(key, JSON.stringify(data)));
}
