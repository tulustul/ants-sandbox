import { matchObjectStructure, transferFields } from "@/utils/object";

export type FieldSampler = {
  angle: number;
  angleSamplesCount: number;
  distanceSamplesCount: number;
  angleSamples: number[];
};

export const defaultSimulationSettings = {
  speed: 1,
  pause: false,
  pheromoneDissipation: 1.003,
  antSeekRandomness: 3,
  performance: {
    antSlowTickTimeout: 2,
    antPreciseTickTimeout: 180,
    fastFieldSampler: getFieldSampler(Math.PI / 2, 3, 3),
    preciseFieldSampler: getFieldSampler(Math.PI * 2, 20, 5),
  },
};

export const defaultGardenSettings = {
  width: 10_000,
  height: 10_000,

  numberOfNests: 1,
  startingAnts: 100,

  foodEnabled: true,
  foodScale: 0.6,
  foodSize: 0.45,
  foodRichness: 10,

  rockEnabled: true,
  rockScale: 1.7,
  rockSize: 0.4,
};

export const defaultVisualSettings = {
  toFoodEnabled: true,
  toFoodMaxEnabled: true,
  toHomeEnabled: true,
  toHomeMaxEnabled: true,
  toEnemyEnabled: true,
  toEnemyMaxEnabled: true,
  maxOpacity: 0.05,
  antsEnabled: true,
  shaders: {
    pheromoneExposure: 1.6,
    pheromoneContrast: 1,
  },
};

export const simulationSettings = getFromStorage(
  "simulationSettings",
  defaultSimulationSettings
);

export const gardenSettings = getFromStorage(
  "gardenSettings",
  defaultGardenSettings
);

export const visualSettings = getFromStorage(
  "visualSettings",
  defaultVisualSettings
);

function getFromStorage<T>(key: string, default_: T): T {
  const settings = JSON.parse(localStorage.getItem(key) ?? "null") ?? {
    ...default_,
  };

  if (!matchObjectStructure(settings, default_)) {
    transferFields(settings, default_);
  }
  return settings;
}

export function getFieldSampler(
  angle: number,
  angleSamplesCount: number,
  distanceSamplesCount: number
): FieldSampler {
  const angleStep = angle / (angleSamplesCount - 1);
  const angleSamples: number[] = [];
  for (
    let curAngle = -angle / 2;
    curAngle <= angle / 2;
    curAngle += angleStep
  ) {
    angleSamples.push(curAngle);
  }
  return {
    angle,
    angleSamplesCount,
    distanceSamplesCount,
    angleSamples,
  };
}
