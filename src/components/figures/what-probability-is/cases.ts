// Original fixture inputs specified for this project with Codex assistance.
// The PRNG helper has its own pinned public-domain provenance and notice.
import { mulberry32 } from '../random';
export const probability = 3 / 8;
export const sampleSize = 4096;
export const seeds = [101, 103, 107];
export const runs = seeds.map(seed => {
  const random = mulberry32(seed);
  let count = 0;
  return Array.from({length: sampleSize}, () => { count += Number(random() < probability); return count; });
});
export const mixes = [
  { jobs: [140, 40, 20], long: [7, 10, 16] },
  { jobs: [80, 40, 80], long: [4, 10, 64] },
];
export const rates = [1 / 20, 1 / 4, 4 / 5];
