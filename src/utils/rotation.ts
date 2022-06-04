export function getAnglesDiff(angleA: number, angleB: number) {
  const diff = angleA - angleB;
  if (diff < Math.PI) {
    return diff;
  }
  return -(Math.PI - diff);
}
