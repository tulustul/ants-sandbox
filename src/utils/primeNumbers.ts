import type { Garden } from "@/life/garden";

const PRIME_NUMBERS = [2, 3, 5, 7, 11, 13, 17, 23, 29, 31];

export function getNextPrimeNumber(garden: Garden): number {
  const usedPrimes = new Set(garden.nests.map((nest) => nest.primeId));
  for (const prime of PRIME_NUMBERS) {
    if (!usedPrimes.has(prime)) {
      return prime;
    }
  }
  return 111; //?
}
