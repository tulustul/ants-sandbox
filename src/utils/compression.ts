export function compressFloat32Array(buffer: Float32Array) {
  const result: number[] = [];
  let lastValue = buffer[0];
  let reps = 0;

  for (const v of buffer) {
    if (v === lastValue) {
      reps++;
      continue;
    }
    result.push(lastValue);
    result.push(reps);
    lastValue = v;
    reps = 1;
  }
  return result;
}

export function decompressFloat32Array(
  compressedData: number[],
  targetBuffer: Float32Array
) {
  let index = 0;
  for (let i = 0; i < compressedData.length; i += 2) {
    const v = compressedData[i];
    const reps = compressedData[i + 1];
    for (let j = 0; j < reps; j++) {
      targetBuffer[index++] = v;
    }
  }
}
