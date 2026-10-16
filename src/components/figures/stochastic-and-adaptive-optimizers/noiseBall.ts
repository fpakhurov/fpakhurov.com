/**
 * Stochastic gradient descent on a least-squares problem, by examples processed. 500 points with two correlated
 * standard-normal features, y = 2x₁ − x₂ + N(0, 1), loss Q(w) = mean of (⟨w, x⟩ − y)²/2, start w = 0.
 * SGD takes one example per step, in a fresh random order every epoch; its curves average the excess loss
 * Q(w) − Q(ŵ) over 30 shuffling seeds. Full gradient descent takes one step of size 1/L per epoch.
 */
import { mulberry32, normal } from '../random';

export const n = 500;
export const epochs = 10;
export const every = 50;
export const runs = 30;
const z = normal(mulberry32(7));
export const X: [number, number][] = Array.from({ length: n }, () => {
  const a = z(), b = z();
  return [a, 0.6 * a + 0.8 * b];
});
export const y = X.map(([a, b]) => 2 * a - b + z());
// H = XᵀX/n, the Hessian of Q, and the least-squares solution ŵ
const s11 = X.reduce((s, [a]) => s + a * a, 0) / n, s12 = X.reduce((s, [a, b]) => s + a * b, 0) / n, s22 = X.reduce((s, [, b]) => s + b * b, 0) / n;
const t1 = X.reduce((s, [a], i) => s + a * y[i], 0) / n, t2 = X.reduce((s, [, b], i) => s + b * y[i], 0) / n;
const det = s11 * s22 - s12 * s12;
export const wHat: [number, number] = [(s22 * t1 - s12 * t2) / det, (s11 * t2 - s12 * t1) / det];
export const H = [[s11, s12], [s12, s22]];
const tr = s11 + s22, disc = Math.sqrt((tr * tr) / 4 - det);
export const L = tr / 2 + disc, mu = tr / 2 - disc;
export const sigma2 = X.reduce((s, [a, b], i) => s + (y[i] - wHat[0] * a - wHat[1] * b) ** 2, 0) / n;
export const excess = (w: [number, number]) => {
  const d0 = w[0] - wHat[0], d1 = w[1] - wHat[1];
  return 0.5 * (s11 * d0 * d0 + 2 * s12 * d0 * d1 + s22 * d1 * d1);
};

/** Average excess-loss curve of per-example SGD with step schedule eta(k), sampled every `every` examples. */
export const sgdCurve = (eta: (k: number) => number) => {
  const acc = new Array(1 + (epochs * n) / every).fill(0);
  for (let r = 0; r < runs; r += 1) {
    const u = mulberry32(1000 + r);
    let w: [number, number] = [0, 0], k = 0;
    acc[0] += excess(w);
    const idx = Array.from({ length: n }, (_, i) => i);
    for (let e = 0; e < epochs; e += 1) {
      for (let i = n - 1; i > 0; i -= 1) { const j = Math.floor(u() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
      for (const i of idx) {
        const [a, b] = X[i], res = w[0] * a + w[1] * b - y[i], h = eta(k);
        w = [w[0] - h * res * a, w[1] - h * res * b];
        k += 1;
        if (k % every === 0) acc[k / every] += excess(w);
      }
    }
  }
  return acc.map((v) => v / runs);
};

/** Full gradient descent with step 1/L: one step per epoch, value after each epoch. */
export const gdCurve = () => {
  let w: [number, number] = [0, 0];
  const out = [excess(w)];
  for (let e = 0; e < epochs; e += 1) {
    const g0 = s11 * (w[0] - wHat[0]) + s12 * (w[1] - wHat[1]), g1 = s12 * (w[0] - wHat[0]) + s22 * (w[1] - wHat[1]);
    w = [w[0] - g0 / L, w[1] - g1 / L];
    out.push(excess(w));
  }
  return out;
};

export const schedules = {
  big: (_k: number) => 0.1,
  small: (_k: number) => 0.02,
  decay: (k: number) => 0.1 / (1 + k / 250),
};
