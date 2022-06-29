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
  maxSpeed: false,
  pheromoneDissipation: 1.009,
  antSeekRandomness: 3,
  antsBirthRate: 1 / 60,
  performance: {
    antBrainTickTimeout: 3,
    antGradientCheckTickTimeout: 180,
    pheromoneSampler: getPheromoneSampler(Math.PI / 2, 3, 3),
    preciseFieldSampler: getPheromoneSampler(Math.PI * 2, 10, 4),
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
  foodCoverage: 0.48,
  foodRichness: 10,
  randomizeFood: false,

  rockEnabled: true,
  rockScale: 0.6,
  rockCoverage: 0.43,
  randomizeRocks: false,

  horizontalMirror: false,
  verticalMirror: false,
};

export type PheromoneVisualSettings = {
  enabled: boolean;
  exposure: number;
  contrast: number;
  intensity: number;
  density: number;
};

const defaultPheromoneVisualSettings: PheromoneVisualSettings = {
  enabled: true,
  contrast: 1,
  exposure: 1,
  intensity: 0.15,
  density: 0.5,
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

export function getPheromoneSampler(
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
