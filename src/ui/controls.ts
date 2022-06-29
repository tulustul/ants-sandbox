import type { Field } from "@/life/field";
import { processRock } from "@/life/rock";
import type { Simulation } from "./simulation";
import { state } from "./state";

export class Controls {
  public simulation: Simulation | null = null;

  pointers = new Map<number, [number, number]>();

  wasDrawingRock = false;

  firstPointer: number | null = null;

  constructor() {
    window.addEventListener("keydown", (event) => this.onKeyDown(event));
  }

  get camera() {
    return this.simulation!.canvas.camera;
  }

  get garden() {
    return this.simulation!.garden;
  }

  onMouseMove(event: MouseEvent) {
    if (event.buttons === 1) {
      this.camera.moveBy(event.movementX, event.movementY);
    }
    if (state.drawing.type && event.buttons === 2) {
      this.draw(event.clientX, event.clientY);
    }
  }

  onWheel(event: WheelEvent) {
    const scale = 1 - event.deltaY / 200;
    this.camera.scaleByWithEasing(scale, event.clientX, event.clientY);
  }

  onPointerDown(event: PointerEvent) {
    if (this.firstPointer === null) {
      this.firstPointer = event.pointerId;
    }
    this.pointers.set(event.pointerId, [event.clientX, event.clientY]);
    if (state.movingColony) {
      this.moveColony(event);
    }
  }

  onPointerUp(event: PointerEvent) {
    if (this.firstPointer === event.pointerId) {
      this.firstPointer = null;
    }
    this.pointers.delete(event.pointerId);
    if (this.wasDrawingRock) {
      processRock(this.garden.rockField);
      this.garden.gardenLayer.rockGraphics.texture.update();
      this.wasDrawingRock = false;
    }
  }

  onPointerMove(event: PointerEvent) {
    if (event.pointerType === "mouse") {
      this.onMouseMove(event);
      return;
    }

    if (event.pointerId === this.firstPointer) {
      if (state.drawing.type) {
        this.draw(event.clientX, event.clientY);
      } else {
        this.camera.moveBy(event.movementX, event.movementY);
      }
    }

    if (this.pointers.size === 2) {
      // Pinch.
      const oldDistance = this.getPointersDistance();
      this.pointers.set(event.pointerId, [event.clientX, event.clientY]);
      const newDistance = this.getPointersDistance();
      const distanceChange = newDistance / oldDistance;
      const [centerX, centerY] = this.getPointersCenter();
      this.camera.scaleBy(distanceChange, centerX, centerY);
      this.camera.targetScale = this.camera.transform.scale;
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.code === "Space") {
      state.simulationSettings.pause = !state.simulationSettings.pause;
    }
  }

  getPointersDistance() {
    const [p1, p2] = this.pointers.values();
    const [x1, y1] = p1;
    const [x2, y2] = p2;
    return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  }

  getPointersCenter() {
    const [p1, p2] = this.pointers.values();
    const [x1, y1] = p1;
    const [x2, y2] = p2;
    return [x1 + (x2 - x1) / 2, y1 + (y2 - y1) / 2];
  }

  draw(screenX: number, screenY: number) {
    const [x, y] = this.camera.screenToCanvas(screenX, screenY);

    let field: Field | null = null;
    if (state.drawing.type === "food") {
      field = this.garden.foodField;
    } else if (state.drawing.type === "rock") {
      field = this.garden.rockField;
      this.wasDrawingRock = true;
    }
    if (field) {
      const intensity = state.drawing.erasing ? 0 : state.drawing.intensity;
      field.draw(x, y, state.drawing.radius, intensity);
      this.garden.gardenLayer.foodGraphics.texture.update();
      this.garden.gardenLayer.rockGraphics.texture.update();
    }
  }

  moveColony(event: PointerEvent) {
    if (!state.trackedColony || !this.simulation) {
      state.movingColony = false;
      return;
    }

    const garden = this.simulation.garden;

    const colony = garden.colonies.find(
      (colony) => colony.id === state.trackedColony
    );
    if (!colony) {
      state.movingColony = false;
      return;
    }

    const [x, y] = this.camera.screenToCanvas(event.clientX, event.clientY);

    if (x < 0 || y < 0 || x >= garden.width || y >= garden.height) {
      return;
    }

    const rock = garden.rockField.getAt(x, y);
    if (rock) {
      return;
    }

    colony.sprite.x = x;
    colony.sprite.y = y;

    state.movingColony = false;
  }
}
