export class AntsSystem {
  worker = new Worker(new URL("../worker.ts", import.meta.url));
}
