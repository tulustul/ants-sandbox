import {
  type Garden,
  type Colony,
  simulationSettings,
  visualSettings,
} from "@/simulation";
import { state } from "@/ui/state";
import { BLEND_MODES } from "pixi.js";

import type { Canvas } from "./canvas";
import { FieldGraphics } from "./fieldGraphics";

/**
 * Renders pheromones of a tracked colony.
 */
export class PheromonesLayer {
  toFood: FieldGraphics;
  toFoodMax: FieldGraphics;

  toHome: FieldGraphics;
  toHomeMax: FieldGraphics;

  toEnemy: FieldGraphics;
  toEnemyMax: FieldGraphics;

  trackedColony: Colony | null = null;

  // Used to update only one texture per frame for better perfomance.
  updatePhase = 0;

  constructor(public garden: Garden, public canvas: Canvas) {
    this.toFood = new FieldGraphics(
      this.garden,
      [30, 250, 30],
      visualSettings.toFood
    );
    this.toFoodMax = new FieldGraphics(
      this.garden,
      [0, 200, 0],
      visualSettings.toFood
    );
    this.toHome = new FieldGraphics(
      this.garden,
      [30, 130, 205],
      visualSettings.toHome
    );
    this.toHomeMax = new FieldGraphics(
      this.garden,
      [0, 0, 200],
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

    if (this.trackedColony?.id !== state.trackedColony) {
      this.trackedColony =
        this.garden.colonies.find(
          (colony) => colony.id === state.trackedColony
        ) ?? null;
      if (this.trackedColony) {
        this.toFood.bindData(this.trackedColony.toFoodField.data);
        this.toFoodMax.bindData(this.trackedColony.toFoodField.maxValues.data);

        this.toHome.bindData(this.trackedColony.toHomeField.data);
        this.toHomeMax.bindData(this.trackedColony.toHomeField.maxValues.data);

        this.toEnemy.bindData(this.trackedColony.toEnemyField.data);
        this.toEnemyMax.bindData(
          this.trackedColony.toEnemyField.maxValues.data
        );
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
    if (isEnabled && (update || simulationSettings.speed > 5)) {
      // If speed is > 10 the updates are too slow and the animation becomes jittery. Let's always update all textures in such case.
      fieldGraphics.texture.update();
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
}
