import { Application } from "pixi.js";
import { Camera } from ".";

export class Canvas {
  app: Application;
  camera: Camera;

  constructor(view: HTMLCanvasElement) {
    this.app = new Application({
      view,
      resizeTo: window,
    });
    this.camera = new Camera(this);
  }
}
