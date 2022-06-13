import { resources } from "@/canvas/resources";
import { Sprite } from "pixi.js";
import { Ant, AntType } from "./ant";
import type { Garden } from "./garden";

export class Corpse {
  decayTime = 60 * 60 * 3;
  decayTimeLeft = this.decayTime;
  sprite: Sprite;
  garden: Garden;
  alpha = 0.8;

  constructor(ant: Ant) {
    this.garden = ant.nest.garden;

    const texture =
      ant.type === AntType.worker ? "ant-dead.png" : "ant-warrior-dead.png";
    this.sprite = new Sprite(resources.atlas!.textures[texture]);

    this.sprite.anchor.set(0.5);

    this.sprite.x = ant.sprite.x;
    this.sprite.y = ant.sprite.y;
    this.sprite.rotation = ant.sprite.rotation;
    this.sprite.alpha = this.alpha;

    this.sprite.tint = ant.nest.corpseColor;

    this.garden.corpsesContainer.addChild(this.sprite);
  }

  destroy() {
    this.garden.corpses.splice(this.garden.corpses.indexOf(this), 1);
    this.garden.corpsesContainer.removeChild(this.sprite);
    this.sprite.destroy();
  }

  tick(ticks: number) {
    this.decayTimeLeft -= ticks;
    this.sprite.alpha = (this.decayTimeLeft / this.decayTime) * this.alpha;
    if (this.decayTimeLeft <= 0) {
      this.destroy();
    }
  }
}
