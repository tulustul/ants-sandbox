export function gaussRandom(mean: number, variance: number) {
  return (
    mean +
    Math.sqrt(-2 * Math.log(1 - Math.random())) *
      Math.cos(2 * Math.PI * Math.random()) *
      variance
  );
}
