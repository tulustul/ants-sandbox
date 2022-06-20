import { resources } from "@/canvas/resources";
import { Sprite } from "pixi.js";
import { Ant, AntType } from "./ant";
import type { Garden } from "./garden";

export class Corpse {
  decayTime = 60 * 60 * 5;
  decayTimeLeft = this.decayTime;
  sprite: Sprite;
  garden: Garden;
  alpha = 0.8;
  phase = 1;
  textureName: string;

  constructor(ant: Ant) {
    this.garden = ant.colony.garden;

    this.textureName =
      ant.type === AntType.worker ? "ant-dead" : "ant-soldier-dead";
    this.sprite = new Sprite(
      resources.atlas!.textures[`${this.textureName}-${this.phase}.png`]
    );

    this.sprite.anchor.set(0.5);
    this.sprite.scale.x = 0.4;
    this.sprite.scale.y = 0.4;

    this.sprite.x = ant.sprite.x;
    this.sprite.y = ant.sprite.y;
    this.sprite.rotation = ant.sprite.rotation;
    this.sprite.alpha = this.alpha;

    this.sprite.tint = ant.colony.corpseColor;

    this.garden.corpsesContainer.addChild(this.sprite);
  }

  destroy() {
    this.garden.corpses.splice(this.garden.corpses.indexOf(this), 1);
    this.garden.corpsesContainer.removeChild(this.sprite);
    this.sprite.destroy();
  }

  tick(ticks: number) {
    this.decayTimeLeft -= ticks;
    this.sprite.alpha = 0.4 + (this.decayTimeLeft / this.decayTime) * 0.6;
    const phase = 9 - Math.ceil((this.decayTimeLeft / this.decayTime) * 8);
    if (phase !== this.phase) {
      if (phase > 2) {
        this.textureName = "ant-dead";
      }
      this.phase = phase;
      this.sprite.texture =
        resources.atlas!.textures[`${this.textureName}-${phase}.png`];
    }
    if (this.decayTimeLeft <= 0) {
      this.destroy();
    }
  }
}
