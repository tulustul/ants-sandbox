import type { Field } from "./field";
import type { Garden } from "./garden";
import { ComplexNoise } from "./noise";

export type GardenGeneratorOptions = {
  garden: Garden;

  foodEnabled: boolean;
  foodSize: number;
  foodScale: number;
  foodRichness: number;

  rockEnabled: boolean;
  rockSize: number;
  rockScale: number;

  horizontalMirror: boolean;
  verticalMirror: boolean;
};

export function fillGarden(options: GardenGeneratorOptions) {
  let rockNoise: ComplexNoise | null = null;
  if (options.rockEnabled) {
    rockNoise = generateRocks(options);
  }

  if (options.foodEnabled) {
    generateFood(options, rockNoise);
  }

  if (options.horizontalMirror) {
    applyHorizontalMirror(options.garden.rockField);
    applyHorizontalMirror(options.garden.foodField);
  }

  if (options.verticalMirror) {
    applyVerticalMirror(options.garden.rockField);
    applyVerticalMirror(options.garden.foodField);
  }
}

function generateRocks(options: GardenGeneratorOptions) {
  const rock = options.garden.rockField;

  const rockScales = [
    // [0.00262 / options.rockScale, 3],
    // [0.0062 / options.rockScale, 2],
    [0.0177 / options.rockScale, 1],
  ];
  const rockNoise = new ComplexNoise(rockScales, Math.random().toString());

  for (let x = 0; x < rock.width; x++) {
    for (let y = 0; y < rock.height; y++) {
      const index = rock.getIndex(x * rock.cellSize, y * rock.cellSize);
      const value = rockNoise.at(x, y);
      if (value > 1 - options.rockSize) {
        rock.data[index] = value;
      }
    }
  }

  return rockNoise;
}

function generateFood(
  options: GardenGeneratorOptions,
  rockNoise: ComplexNoise | null
) {
  const foodScales = [
    [0.0025 / options.foodScale, 6],
    [0.005 / options.foodScale, 5],
    [0.007 / options.foodScale, 4],
    [0.016 / options.foodScale, 3],
    [0.022 / options.foodScale, 2],
    [0.077 / options.foodScale, 1],
  ];
  const foodNoise = new ComplexNoise(foodScales, Math.random().toString());

  const food = options.garden.foodField;
  const rock = options.garden.rockField;

  for (let x = 0; x < food.width; x++) {
    for (let y = 0; y < food.height; y++) {
      const index = food.getIndex(x * food.cellSize, y * food.cellSize);
      let value = foodNoise.at(x, y);
      if (rockNoise) {
        value -= rockNoise.at(x, y) * 0.5;
      } else {
        value -= 0.15;
      }
      if (rock.data[index] === 0 && value > 1 - options.foodSize) {
        food.data[index] = options.foodRichness;
      }
    }
  }
}

function applyHorizontalMirror(field: Field) {
  const xMiddle = Math.ceil(field.width / 2);
  for (let x = xMiddle; x < field.width; x++) {
    for (let y = 0; y < field.height; y++) {
      const mirroredIndex = y * field.width + x;
      const originalIndex = y * field.width + (xMiddle - (x - xMiddle));
      field.data[mirroredIndex] = field.data[originalIndex];
    }
  }
}

function applyVerticalMirror(field: Field) {
  const yMiddle = Math.ceil(field.height / 2);
  for (let x = 0; x < field.width; x++) {
    for (let y = yMiddle; y < field.height; y++) {
      const mirroredIndex = y * field.width + x;
      const originalIndex = (yMiddle - (y - yMiddle)) * field.width + x;
      field.data[mirroredIndex] = field.data[originalIndex];
    }
  }
}
