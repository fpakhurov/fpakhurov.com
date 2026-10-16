/**
 * A seeded synthetic rating matrix of rank 2 and its recovery by alternating least squares, for the
 * recommender-systems note. True ratings are 3 + p_u · q_i (clipped to [1, 5]); a random 40% of the cells are
 * observed with noise of standard deviation 0.25; ALS fits rank-2 factors to the observed cells only.
 */
import { mulberry32, normal } from '../random';

export function makeData(seed = 7, users = 12, items = 16, rate = 0.4) {
  const rand = mulberry32(seed);
  const gauss = normal(rand);
  const P = Array.from({ length: users }, () => [gauss() * 0.9, gauss() * 0.9]);
  const Q = Array.from({ length: items }, () => [gauss() * 0.9, gauss() * 0.9]);
  const truth = P.map((p) => Q.map((q) => Math.min(5, Math.max(1, 3 + p[0] * q[0] + p[1] * q[1]))));
  const obs = truth.map((row) => row.map(() => rand() < rate));
  // every user and every item keeps at least two observed cells
  for (let u = 0; u < users; u++) for (let k = 0; obs[u].filter(Boolean).length < 2; k++) obs[u][(u * 5 + k) % items] = true;
  for (let i = 0; i < items; i++) for (let k = 0; obs.filter((r) => r[i]).length < 2; k++) obs[(i * 3 + k) % users][i] = true;
  const R = truth.map((row, u) => row.map((v, i) => (obs[u][i] ? v + 0.25 * gauss() : NaN)));
  return { truth, obs, R };
}

/** Solve the 2 × 2 system (A + lam I) x = b. */
const solve2 = (A: number[][], b: number[], lam: number) => {
  const a = A[0][0] + lam, c = A[0][1], d = A[1][1] + lam;
  const det = a * d - c * c;
  return [(d * b[0] - c * b[1]) / det, (a * b[1] - c * b[0]) / det];
};

/** Rank-2 ALS on the observed cells around their mean; lam is the ridge penalty of every row solve. */
export function als(R: number[][], obs: boolean[][], lam = 0.3, iters = 60, seed = 3) {
  const users = R.length, items = R[0].length;
  const vals: number[] = [];
  R.forEach((row, u) => row.forEach((v, i) => { if (obs[u][i]) vals.push(v); }));
  const mu = vals.reduce((s, v) => s + v, 0) / vals.length;
  const rand = mulberry32(seed);
  const P = Array.from({ length: users }, () => [0, 0]);
  const Q = Array.from({ length: items }, () => [rand() - 0.5, rand() - 0.5]);
  const step = (A: number[][], B: number[][], cell: (a: number, b: number) => [boolean, number]) => {
    A.forEach((_, a) => {
      const G = [[0, 0], [0, 0]], g = [0, 0];
      B.forEach((v, b) => {
        const [seen, r] = cell(a, b);
        if (!seen) return;
        G[0][0] += v[0] * v[0]; G[0][1] += v[0] * v[1]; G[1][1] += v[1] * v[1];
        g[0] += v[0] * (r - mu); g[1] += v[1] * (r - mu);
      });
      A[a] = solve2(G, g, lam);
    });
  };
  for (let t = 0; t < iters; t++) {
    step(P, Q, (u, i) => [obs[u][i], R[u][i]]);
    step(Q, P, (i, u) => [obs[u][i], R[u][i]]);
  }
  const fit = P.map((p) => Q.map((q) => mu + p[0] * q[0] + p[1] * q[1]));
  return { mu, P, Q, fit };
}

/** Baseline: the mean of each item's observed ratings. */
export function itemMeans(R: number[][], obs: boolean[][]) {
  const m = Array.from({ length: R[0].length }, (_, i) => {
    const v = R.map((row, u) => (obs[u][i] ? row[i] : NaN)).filter((x) => !Number.isNaN(x));
    return v.reduce((s, x) => s + x, 0) / v.length;
  });
  return R.map(() => m.slice());
}

/** Root mean squared error against the truth over the unobserved cells. */
export function rmseMissing(fit: number[][], truth: number[][], obs: boolean[][]) {
  let s = 0, n = 0;
  truth.forEach((row, u) => row.forEach((v, i) => { if (!obs[u][i]) { s += (fit[u][i] - v) ** 2; n++; } }));
  return Math.sqrt(s / n);
}
