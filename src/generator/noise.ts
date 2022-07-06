import SimplexNoise from "simplex-noise";

export class ComplexNoise {
  private noises: SimplexNoise[];
  private total: number;
  constructor(private scales: number[][], seed: string | undefined) {
    this.noises = scales.map(() => new SimplexNoise(seed));
    this.total = scales.reduce((acc, noise) => acc + noise[1], 0);
  }

  at(x: number, y: number) {
    let noiseValue = 0;
    for (let i = 0; i < this.noises.length; i++) {
      const [scale, intensity] = this.scales[i];
      noiseValue += this.noises[i].noise2D(x * scale, y * scale) * intensity;
    }
    return (noiseValue + this.total) / this.total / 2;
  }
}
