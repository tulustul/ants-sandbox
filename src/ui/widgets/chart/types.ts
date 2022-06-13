export type ChartState = {
  lastId: number;
  charts: ChartData[];
};

export type ChartData = {
  id: number;
  color: string;
  type: "line";
  data: number[];
};
