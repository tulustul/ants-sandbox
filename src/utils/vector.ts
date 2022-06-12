export class Vec {
  constructor(public x: number, public y: number) {}

  rotate(radians: number) {
    const nx = this.x * Math.cos(radians) - this.y * Math.sin(radians);
    const ny = this.x * Math.sin(radians) + this.y * Math.cos(radians);

    this.x = nx;
    this.y = ny;
  }

  rotateTo(radians: number) {
    this.rotate(radians - this.rotation());
  }

  rotation() {
    return Math.atan2(this.y, this.x);
  }

  normalize() {
    const length = this.length;
    this.x /= length;
    this.y /= length;
  }

  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  mulScalar(factor: number) {
    this.x *= factor;
    this.y *= factor;
  }

  sub(vec: Vec) {
    this.x -= vec.x;
    this.y -= vec.y;
  }
}
