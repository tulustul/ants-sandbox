import type { Canvas } from "@/canvas";
import type { Garden } from "@/simulation";

import { Animation, AnimationEaseOutCubic } from "./animation";

export interface Transform {
  x: number;
  y: number;
  scale: number;
}

export class Camera {
  MAX_ZOOM = 3;
  MIN_ZOOM = 0.03;

  transform = { x: 0, y: 0, scale: 0.4 };
  targetScale = this.transform.scale;

  private scaleAnimation: Animation | null = null;
  private scalePivotX = 0;
  private scalePivotY = 0;

  constructor(private canvas: Canvas) {}

  moveBy(x: number, y: number) {
    this.transform.x += x;
    this.transform.y += y;
    this.updateProjectionMatrix();
  }

  moveTo(x: number, y: number) {
    this.transform.x = x;
    this.transform.y = y;
    this.updateProjectionMatrix();
  }

  centerAt(x: number, y: number) {
    const oldScale = this.transform.scale;

    this.transform.x = -x + window.innerWidth / 2;
    this.transform.y = -y + window.innerHeight / 2;
    this.transform.scale = 1;

    this.scaleTo(oldScale, window.innerWidth / 2, window.innerHeight / 2);
  }

  scaleBy(scaleFactor: number, screenPivotX: number, screenPivotY: number) {
    const newScale = this.transform.scale * scaleFactor;
    this.scaleTo(newScale, screenPivotX, screenPivotY);
  }

  scaleByWithEasing(
    scaleFactor: number,
    screenPivotX: number,
    screenPivotY: number,
    duration = 200
  ) {
    this.targetScale = this.rampScale(this.targetScale * scaleFactor);
    this.scaleToWithEasing(
      this.targetScale,
      screenPivotX,
      screenPivotY,
      duration
    );
  }

  scaleToWithEasing(
    newScale: number,
    screenPivotX: number,
    screenPivotY: number,
    duration = 600
  ) {
    const t = this.transform;
    this.scalePivotX = screenPivotX;
    this.scalePivotY = screenPivotY;
    this.scaleAnimation = new AnimationEaseOutCubic(
      t.scale,
      newScale,
      duration
    );
  }

  scaleTo(scale: number, screenPivotX: number, screenPivotY: number) {
    const t = this.transform;
    const [x1, y1] = this.screenToCanvas(screenPivotX, screenPivotY);

    t.scale = this.rampScale(scale);

    const [x2, y2] = this.screenToCanvas(screenPivotX, screenPivotY);

    t.x += (x2 - x1) * t.scale;
    t.y += (y2 - y1) * t.scale;

    this.updateProjectionMatrix();
  }

  rampScale(scale: number) {
    return Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, scale));
  }

  screenToCanvas(screenX: number, screenY: number): [number, number] {
    const t = this.transform;
    return [(screenX - t.x) / t.scale, (screenY - t.y) / t.scale];
  }

  canvasToScreen(canvasX: number, canvasY: number): [number, number] {
    const t = this.transform;
    return [canvasX * t.scale - t.x, canvasY * t.scale - t.y];
  }

  updateProjectionMatrix() {
    this.canvas.app.stage.x = this.transform.x;
    this.canvas.app.stage.y = this.transform.y;
    this.canvas.app.stage.scale.x = this.transform.scale;
    this.canvas.app.stage.scale.y = this.transform.scale;
  }

  update() {
    const elapsedMS = this.canvas.app.ticker.elapsedMS;

    if (this.scaleAnimation) {
      const newScale = this.scaleAnimation.step(elapsedMS);
      if (newScale === null) {
        this.scaleAnimation = null;
      } else {
        this.scaleTo(newScale, this.scalePivotX, this.scalePivotY);
      }
    }

    this.updateProjectionMatrix();
  }

  fitToGarden(garden: Garden) {
    const widthScale = window.innerWidth / garden.width;
    const heightScale = window.innerHeight / garden.height;
    this.transform.scale = Math.min(widthScale, heightScale) * 0.95;
    this.centerAt(garden.width / 2, garden.height / 2);
    this.targetScale = this.transform.scale;
  }
}
