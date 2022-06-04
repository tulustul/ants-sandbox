import type { Garden } from "@/life/garden";
import type { Nest } from "@/life/nest";
import { visualSettings } from "@/life/settings";
import { state } from "@/ui/state";
import { BLEND_MODES } from "pixi.js";
import type { Canvas } from "./canvas";
import { FieldGraphics } from "./fieldGraphics";

export class FieldsLayer {
  toFood: FieldGraphics;
  toFoodMax: FieldGraphics;

  toHome: FieldGraphics;
  toHomeMax: FieldGraphics;

  toEnemy: FieldGraphics;
  toEnemyMax: FieldGraphics;

  nest: Nest | null = null;

  constructor(public garden: Garden, public canvas: Canvas) {
    this.toFood = new FieldGraphics(this.garden, [30, 250, 30]);
    this.toFoodMax = new FieldGraphics(this.garden, [255, 255, 0]);
    this.toHome = new FieldGraphics(this.garden, [30, 130, 205]);
    this.toHomeMax = new FieldGraphics(this.garden, [0, 0, 255]);
    this.toEnemy = new FieldGraphics(this.garden, [200, 50, 50]);
    this.toEnemyMax = new FieldGraphics(this.garden, [255, 0, 0]);

    this.toFood.sprite.blendMode = BLEND_MODES.ADD;
    this.toFoodMax.sprite.blendMode = BLEND_MODES.ADD;
    this.toHome.sprite.blendMode = BLEND_MODES.ADD;
    this.toHomeMax.sprite.blendMode = BLEND_MODES.ADD;

    this.toFoodMax.sprite.alpha = 0.1;
    this.toHomeMax.sprite.alpha = 0.1;
  }

  tick() {
    if (this.nest?.id !== state.trackedNest) {
      this.nest =
        this.garden.nests.find((nest) => nest.id === state.trackedNest) ?? null;
      if (this.nest) {
        this.toFood.bindData(this.nest.toFoodField.data);
        this.toFoodMax.bindData(this.nest.toFoodField.maxValues.data);

        this.toHome.bindData(this.nest.toHomeField.data);
        this.toHomeMax.bindData(this.nest.toHomeField.maxValues.data);

        this.toEnemy.bindData(this.nest.toEnemyField.data);
        this.toEnemyMax.bindData(this.nest.toEnemyField.maxValues.data);
      }
    }

    this.updateField(this.toFood, visualSettings.toFoodEnabled);
    this.updateField(this.toFoodMax, visualSettings.toFoodMaxEnabled);
    this.updateField(this.toHome, visualSettings.toHomeEnabled);
    this.updateField(this.toHomeMax, visualSettings.toHomeMaxEnabled);
    this.updateField(this.toEnemy, visualSettings.toEnemyEnabled);
    this.updateField(this.toEnemyMax, visualSettings.toEnemyMaxEnabled);

    this.toFoodMax.sprite.alpha = visualSettings.maxOpacity;
    this.toHomeMax.sprite.alpha = visualSettings.maxOpacity;
    this.toEnemyMax.sprite.alpha = visualSettings.maxOpacity;
  }

  updateField(fieldGraphics: FieldGraphics, isEnabled: boolean) {
    fieldGraphics.sprite.visible = isEnabled;
    if (isEnabled) {
      {
        fieldGraphics.texture.update();
      }
    }
  }

  destroy() {
    this.toFood?.destroy();
    this.toFoodMax?.destroy();
    this.toHome?.destroy();
    this.toHomeMax?.destroy();
    this.toEnemy?.destroy();
    this.toEnemyMax?.destroy();
  }

  get graphics() {
    return [
      this.toFood,
      this.toFoodMax,
      this.toHome,
      this.toHomeMax,
      this.toEnemy,
      this.toEnemyMax,
    ];
  }
}
