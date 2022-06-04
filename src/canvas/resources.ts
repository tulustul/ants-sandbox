import { Loader, Spritesheet } from "pixi.js";

import atlasUrl from "@/assets/atlas.png";
import atlasData from "@/assets/atlas.json";

export const resources = {
  atlas: null as Spritesheet | null,
};

export function loadResources() {
  return new Promise((resolve, reject) => {
    Loader.shared.add(atlasUrl).load(() => {
      const atlas = new Spritesheet(
        Loader.shared.resources[atlasUrl].texture!,
        atlasData
      );
      resources.atlas = atlas;
      atlas.parse(resolve);
    });
  });
}
