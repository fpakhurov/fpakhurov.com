/**
 * The simulation of the precision and recall note: real samples from N(0, I) in two dimensions and three
 * models N(0, s² I) with s = 0.3, 1 and 1.7, 2000 samples each, scored by k-NN precision and recall
 * (k = 3) and by density and coverage (k = 5). Seeded, so the note, the figure and its caption agree.
 */
import { mulberry32 } from '../random';

type P2 = [number, number];

const gaussians = (seed: number, n: number, s: number): P2[] => {
  const rand = mulberry32(seed);
  return Array.from({ length: n }, () => {
    const r = Math.sqrt(-2 * Math.log(1 - rand())), phi = 2 * Math.PI * rand();
    return [s * r * Math.cos(phi), s * r * Math.sin(phi)];
  });
};
const dist = (a: P2, b: P2) => Math.hypot(a[0] - b[0], a[1] - b[1]);
/** Distance from each point to its k-th nearest neighbour in the same set (the point itself excluded). */
function kthNeighbour(A: P2[], k: number) {
  return A.map((a) => {
    const best: number[] = [];
    for (const b of A) {
      const d = dist(a, b);
      if (best.length <= k) best.push(d), best.sort((x, y) => x - y);
      else if (d < best[k]) best[k] = d, best.sort((x, y) => x - y);
    }
    return best[k];
  });
}
const ballsContaining = (p: P2, A: P2[], r: number[]) => A.reduce((c, a, i) => c + (dist(p, a) <= r[i] ? 1 : 0), 0);

export const N = 2000;
export const real = gaussians(1, N, 1);
const rReal3 = kthNeighbour(real, 3), rReal5 = kthNeighbour(real, 5);

export const scenarios = [
  { s: 0.3, seed: 2 },
  { s: 1, seed: 3 },
  { s: 1.7, seed: 4 },
].map(({ s, seed }) => {
  const gen = gaussians(seed, N, s);
  const rGen3 = kthNeighbour(gen, 3);
  const precision = gen.filter((y) => ballsContaining(y, real, rReal3) > 0).length / N;
  const recall = real.filter((x) => ballsContaining(x, gen, rGen3) > 0).length / N;
  const density = gen.reduce((c, y) => c + ballsContaining(y, real, rReal5), 0) / (5 * N);
  const coverage = real.filter((x, i) => gen.some((y) => dist(x, y) <= rReal5[i])).length / N;
  // FID between the two Gaussians themselves: |0|² + Tr(I + s²I − 2sI) = 2(1 − s)².
  return { s, gen, precision, recall, density, coverage, fid: 2 * (1 - s) ** 2 };
});
