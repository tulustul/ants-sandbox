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
  antsBirthRate: 1 / 60,
  performance: {
    antSlowTickTimeout: 3,
    antPreciseTickTimeout: 180,
    fastFieldSampler: getFieldSampler(Math.PI / 2, 3, 3),
    preciseFieldSampler: getFieldSampler(Math.PI * 2, 20, 5),
  },
};

export type MapGenerationType = "empty" | "random" | "image";

export const defaultGardenSettings = {
  type: "random" as MapGenerationType,

  width: 5_000,
  height: 5_000,

  numberOfColonies: 4,
  startingAnts: 100,
  colonySizeLimit: 500,

  foodEnabled: true,
  foodScale: 0.2,
  foodSize: 0.48,
  foodRichness: 10,

  rockEnabled: true,
  rockScale: 0.6,
  rockSize: 0.43,

  horizontalMirror: false,
  verticalMirror: false,
};

export type PheromoneVisualSettings = {
  enabled: boolean;
  exposure: number;
  contrast: number;
  intensity: number;
};

const defaultPheromoneVisualSettings: PheromoneVisualSettings = {
  enabled: true,
  contrast: 1,
  exposure: 1,
  intensity: 0.15,
};

export const defaultVisualSettings = {
  toFood: { ...defaultPheromoneVisualSettings },
  toHome: { ...defaultPheromoneVisualSettings },
  toEnemy: { ...defaultPheromoneVisualSettings },
  antsEnabled: true,
  corpsesEnabled: true,
};

export const simulationSettings = getFromStorage(
  "simulationSettings",
  defaultSimulationSettings
);

export const gardenSettings = getFromStorage(
  "gardenSettings",
  defaultGardenSettings
);

if (gardenSettings.type === "image") {
  gardenSettings.type = "random";
}

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
    localStorage.removeItem(key);
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
