import { simulationSettings } from "@/life/simulation";
import { simulationStats } from "@/life/stats";
import { reactive, watch } from "vue";

export type DrawingType = "food" | "rock" | null;

const _state = {
  simulationSettings,
  simulationStats,
  drawing: {
    type: null as DrawingType,
    radius: 10,
    intensity: 10,
  },
  trackedNest: 1,
};

export const state = reactive(_state);

watch(state.simulationSettings, () => {
  localStorage.setItem(
    "simulationSettings",
    JSON.stringify(state.simulationSettings)
  );
});
