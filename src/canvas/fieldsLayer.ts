import type { Garden } from "@/life/garden";
import type { Colony } from "@/life/colony";
import { simulationSettings, visualSettings } from "@/life/settings";
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

  colony: Colony | null = null;

  updatePhase = 0;

  constructor(public garden: Garden, public canvas: Canvas) {
    this.toFood = new FieldGraphics(
      this.garden,
      [30, 250, 30],
      visualSettings.toFood
    );
    this.toFoodMax = new FieldGraphics(
      this.garden,
      [255, 255, 0],
      visualSettings.toFood
    );
    this.toHome = new FieldGraphics(
      this.garden,
      [30, 130, 205],
      visualSettings.toHome
    );
    this.toHomeMax = new FieldGraphics(
      this.garden,
      [0, 0, 255],
      visualSettings.toHome
    );
    this.toEnemy = new FieldGraphics(
      this.garden,
      [200, 50, 50],
      visualSettings.toEnemy
    );
    this.toEnemyMax = new FieldGraphics(
      this.garden,
      [255, 0, 0],
      visualSettings.toEnemy
    );

    this.toFood.sprite.blendMode = BLEND_MODES.ADD;
    this.toFoodMax.sprite.blendMode = BLEND_MODES.ADD;
    this.toHome.sprite.blendMode = BLEND_MODES.ADD;
    this.toHomeMax.sprite.blendMode = BLEND_MODES.ADD;

    this.toFood.sprite.alpha = visualSettings.toFood.density;
    this.toHome.sprite.alpha = visualSettings.toHome.density;
    this.toEnemy.sprite.alpha = visualSettings.toEnemy.density;

    this.toFoodMax.sprite.alpha = visualSettings.toFood.intensity;
    this.toHomeMax.sprite.alpha = visualSettings.toHome.intensity;
    this.toEnemyMax.sprite.alpha = visualSettings.toEnemy.intensity;

    canvas.app.stage.addChild(this.toFood.sprite);
    canvas.app.stage.addChild(this.toFoodMax.sprite);
    canvas.app.stage.addChild(this.toHome.sprite);
    canvas.app.stage.addChild(this.toHomeMax.sprite);
    canvas.app.stage.addChild(this.toEnemy.sprite);
    canvas.app.stage.addChild(this.toEnemyMax.sprite);
  }

  tick() {
    if (this.garden.isDestroyed) {
      return;
    }

    if (this.colony?.id !== state.trackedColony) {
      this.colony =
        this.garden.colonies.find(
          (colony) => colony.id === state.trackedColony
        ) ?? null;
      if (this.colony) {
        this.toFood.bindData(this.colony.toFoodField.data);
        this.toFoodMax.bindData(this.colony.toFoodField.maxValues.data);

        this.toHome.bindData(this.colony.toHomeField.data);
        this.toHomeMax.bindData(this.colony.toHomeField.maxValues.data);

        this.toEnemy.bindData(this.colony.toEnemyField.data);
        this.toEnemyMax.bindData(this.colony.toEnemyField.maxValues.data);
      }
    }

    this.updateField(
      this.toFood,
      visualSettings.toFood.enabled,
      this.updatePhase === 0
    );
    this.updateField(
      this.toFoodMax,
      visualSettings.toFood.enabled,
      this.updatePhase === 1
    );

    this.updateField(
      this.toHome,
      visualSettings.toHome.enabled,
      this.updatePhase === 2
    );
    this.updateField(
      this.toHomeMax,
      visualSettings.toHome.enabled,
      this.updatePhase === 3
    );

    this.updateField(
      this.toEnemy,
      visualSettings.toEnemy.enabled,
      this.updatePhase === 4
    );
    this.updateField(
      this.toEnemyMax,
      visualSettings.toEnemy.enabled,
      this.updatePhase === 5
    );

    if (++this.updatePhase === 6) {
      this.updatePhase = 0;
    }
  }

  updateField(
    fieldGraphics: FieldGraphics,
    isEnabled: boolean,
    update: boolean
  ) {
    fieldGraphics.sprite.visible = isEnabled;
    if (isEnabled && (update || simulationSettings)) {
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
