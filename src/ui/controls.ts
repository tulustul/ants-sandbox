import type { Field } from "@/life/field";
import type { Simulation } from "./simulation";
import { state } from "./state";

export class Controls {
  public simulation: Simulation | null = null;

  pointers = new Map<number, [number, number]>();

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
    const scale = event.deltaY > 0 ? 0.8 : 1.2;
    this.camera.scaleByWithEasing(scale, event.clientX, event.clientY);
  }

  onScroll(event: any) {
    const scale = event.deltaY > 0 ? 0.8 : 1.2;
    this.camera.scaleByWithEasing(scale, event.clientX, event.clientY);
  }

  onPointerDown(event: PointerEvent) {
    this.pointers.set(event.pointerId, [event.clientX, event.clientY]);
  }

  onPointerUp(event: PointerEvent) {
    this.pointers.delete(event.pointerId);
  }

  onPointerMove(event: PointerEvent) {
    if (event.pointerType === "mouse") {
      this.onMouseMove(event);
      return;
    }

    if (this.pointers.has(event.pointerId)) {
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

  onPointerCancel(event: PointerEvent) {
    // console.log("onPointerCancel", event);
  }

  onPointerOut(event: PointerEvent) {
    // console.log("onPointerOut", event);
  }

  onPointerLeave(event: PointerEvent) {
    // console.log("onPointerLeave", event);
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
    }
    if (field) {
      field.draw(x, y, state.drawing.radius, state.drawing.intensity);
      this.garden.foodGraphics.texture.update();
      this.garden.rockGraphics.texture.update();
    }
  }
}
