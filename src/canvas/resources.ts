import { Loader, Spritesheet } from "pixi.js";

import atlasUrl from "@/assets/atlas.png";
import atlasData from "@/assets/atlas.json";
import grassUrl from "@/assets/grass.jpg";
import ivyUrl from "@/assets/ivy.jpg";
import rockUrl from "@/assets/rock.png";

export const resources = {
  atlas: null as Spritesheet | null,
};

export function loadResources() {
  return new Promise((resolve, reject) => {
    Loader.shared
      .add(atlasUrl)
      .add(grassUrl)
      .add(ivyUrl)
      .add(rockUrl)
      .load(() => {
        const atlas = new Spritesheet(
          Loader.shared.resources[atlasUrl].texture!,
          atlasData
        );
        resources.atlas = atlas;
        atlas.parse(resolve);
      });
  });
}
