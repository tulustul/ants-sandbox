export function saveMapsNames(maps: string[]) {
  localStorage.setItem("maps", JSON.stringify(maps.sort()));
}
