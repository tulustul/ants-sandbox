export class Velocity {
  x!: number;
  y!: number;
  rotation!: number;

  constructor(rotation: number, public length: number) {
    this.rotateTo(rotation);
  }

  rotate(radians: number) {
    radians += this.rotation;
    if (radians >= Math.PI) {
      radians = -Math.PI * 2 + radians;
    } else if (radians < -Math.PI) {
      radians = Math.PI * 2 + radians;
    }
    this.rotateTo(radians);
  }

  rotateTo(radians: number) {
    this.x = -this.length * Math.sin(radians - Math.PI / 2);
    this.y = this.length * Math.cos(radians - Math.PI / 2);
    this.rotation = radians;
  }
}

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
    if (length) {
      this.x /= length;
      this.y /= length;
    }
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

  copy() {
    return new Vec(this.x, this.y);
  }
}
