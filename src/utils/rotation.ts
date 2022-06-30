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

// export function addAngles(angleA: number, angleB: number) {
//   const sum = angleA + angleB;
//   if (sum > Math.PI/2) {
//     return sum
//   }
//   if (diff > Math.PI) {
//     return diff - Math.PI;
//   }
//   if (diff < -Math.PI) {
//     return diff + Math.PI;
//   }
//   return diff;
// }
