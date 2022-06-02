export const defaultSimulationSettings = {
  speed: 1,
  pause: false,
  pheromoneDissipation: 1.01,
  antSlowTickTimeout: 2,
  antPreciseTickTimeout: 180,
  antSeekRandomness: 4,
};
export const simulationSettings: typeof defaultSimulationSettings = JSON.parse(
  localStorage.getItem("simulationSettings") ?? "null"
) ?? { ...defaultSimulationSettings };
