import { reactive } from "vue";

const _visualSettings = {
  shaders: {
    pheromoneExposure: 2,
    pheromoneContrast: 1,
  },
};

export const visualSettings = reactive(_visualSettings);
