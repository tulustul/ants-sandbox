export class PerformanceMonitor {
  time = 0;

  constructor(private samples = 10) {}

  measure(t0: number): number {
    // Moving average.
    const t1 = performance.now();
    const dt = t1 - t0;
    this.time = (this.time * (this.samples - 1) + dt) / this.samples;
    return this.time;
  }

  get ups() {
    return 1000 / this.time;
  }
}
