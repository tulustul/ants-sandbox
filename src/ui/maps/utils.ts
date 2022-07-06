import type { Simulation } from "../simulation";
import { state } from "../state";

export function saveMapsNames(maps: string[]) {
  localStorage.setItem("maps", JSON.stringify(maps.sort()));
}

export async function loadMap(
  simulation: Simulation,
  name: string,
  source?: Record<string, string>
) {
  state.loadedMap = null;
  let data: string;
  if (source) {
    const response = await fetch(source[name]);
    data = await response.text();
  } else {
    data = localStorage.getItem(`map:${name}`)!;
  }
  await simulation.load(data);
  state.loadedMap = name;
}
