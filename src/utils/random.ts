export function gaussRandom(mean: number, variance: number) {
  return (
    mean +
    Math.sqrt(-2 * Math.log(1 - Math.random())) *
      Math.cos(2 * Math.PI * Math.random()) *
      variance
  );
}

export function gaussRandomWithBoundaries(
  mean: number,
  variance: number,
  min: number,
  max: number
) {
  const r = gaussRandom(mean, variance);
  if (r < min) {
    return min;
  }
  if (r > max) {
    return max;
  }
  return r;
}
