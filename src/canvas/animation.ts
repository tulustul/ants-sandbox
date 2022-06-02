export abstract class Animation {
  private progress = 0;
  private diff: number;

  constructor(
    public start: number,
    public end: number,
    private duration: number
  ) {
    this.diff = end - start;
  }

  step(stepTime: number): number | null {
    if (this.progress >= this.duration) {
      return null;
    }
    this.progress += stepTime;
    const eased = this.ease(this.progress / this.duration);
    return this.start + this.diff * Math.min(eased, 1);
  }

  protected abstract ease(t: number): number;
}

export class AnimationEaseOutQuad extends Animation {
  protected ease(t: number) {
    return t * (2 - t);
  }
}

export class AnimationEaseOutCubic extends Animation {
  protected ease(t: number) {
    return --t * t * t + 1;
  }
}
