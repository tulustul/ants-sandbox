import { FIELD_CELL_SIZE, Garden } from "@/simulation";
import type { Canvas } from "@/canvas";
import { state } from "@/ui/state";

export async function makeGardenFromImage(canvas: Canvas, file: File) {
  const image = await getImageData(file);

  const garden = new Garden(
    canvas,
    image.width * FIELD_CELL_SIZE,
    image.height * FIELD_CELL_SIZE
  );
  for (let i = 0; i < image.data.length; i += 4) {
    const r = image.data[i];
    const g = image.data[i + 1];
    // blue and alpha not used.

    const index = i / 4;

    garden.rockField.data[index] =
      r > 255 - 255 * state.gardenSettings.rockCoverage ? 1 : 0;

    if (!garden.rockField.data[index]) {
      garden.foodField.data[index] =
        g > 255 - 255 * state.gardenSettings.foodCoverage
          ? state.gardenSettings.foodRichness
          : 0;
    }
  }

  return garden;
}

function getImageData(imageFile: File): Promise<ImageData> {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;

  const img = document.createElement("img");
  img.src = URL.createObjectURL(imageFile);

  return new Promise((resolve, reject) => {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0);
      const imageData = context.getImageData(0, 0, img.width, img.height);
      resolve(imageData);
    };
  });
}
