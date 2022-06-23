export function getAnglesDiff(angleA: number, angleB: number) {
  const diff = angleA - angleB;
  if (diff > Math.PI) {
    return diff - Math.PI;
  }
  if (diff < -Math.PI) {
    return diff + Math.PI;
  }
  return diff;
}
