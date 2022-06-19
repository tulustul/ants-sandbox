import type { Field } from "./field";

export function processRock(rock: Field) {
  const segmentation = new Uint32Array(rock.data.length);
  let segmentId = 1;

  for (let x = 0; x < rock.width; x++) {
    for (let y = 0; y < rock.height; y++) {
      const index = y * rock.width + x;
      if (rock.data[index] !== 0 && segmentation[index] === 0) {
        segmentRock(rock, segmentation, segmentId++, index);
      }
    }
  }
}

function segmentRock(
  rock: Field,
  segmentation: Uint32Array,
  segmentId: number,
  index: number
) {
  const visited = new Set<number>();
  const edges = new Set<number>();
  let toProcess = new Set([index]);

  while (toProcess.size) {
    const newToProcess = new Set<number>();
    for (const index of toProcess) {
      if (visited.has(index)) {
        continue;
      }

      if (index < 0 || index >= rock.data.length) {
        continue;
      }

      visited.add(index);

      let isEdge = false;

      segmentation[index] = segmentId;

      if (rock.data[index - 1] !== 0) {
        newToProcess.add(index - 1);
      } else {
        isEdge = true;
      }

      if (rock.data[index + 1] !== 0) {
        newToProcess.add(index + 1);
      } else {
        isEdge = true;
      }

      if (rock.data[index - rock.width] !== 0) {
        newToProcess.add(index - rock.width);
      } else {
        isEdge = true;
      }

      if (rock.data[index + rock.width] !== 0) {
        newToProcess.add(index + rock.width);
      } else {
        isEdge = true;
      }

      if (isEdge) {
        edges.add(index);
      }
    }
    toProcess = newToProcess;
  }

  let depth = 0;
  visited.clear();
  toProcess = edges;
  const depthData = new Float32Array(rock.data.length);
  while (toProcess.size) {
    depth++;
    const newToProcess = new Set<number>();
    for (const index of toProcess) {
      if (visited.has(index)) {
        continue;
      }

      if (segmentation[index] !== segmentId) {
        continue;
      }

      visited.add(index);

      depthData[index] = depth;

      newToProcess.add(index - 1);
      newToProcess.add(index + 1);
      newToProcess.add(index - rock.width);
      newToProcess.add(index + rock.width);
    }
    toProcess = newToProcess;
  }

  for (const index of visited) {
    const val = depthData[index] / depth / 2 + 0.3;
    rock.data[index] = val + Math.random() * 0.07;
  }
}
