export type DumpedGarden = {
  width: number;
  height: number;
  foodField: number[];
  rockField: number[];
};

export type DumpedColony = {
  x: number;
  y: number;
  antsToRelease: number;
  antsLimit: number;
  food: number;
  aggresiveness: number;
  freedom: number;
};

export type DumpedSimulation = {
  garden: DumpedGarden;
  colonies: DumpedColony[];
};
