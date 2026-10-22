/** Gaussian process regression in one dimension for the figures: the data, the RBF kernel, Cholesky solves and the evidence. */
import { mulberry32, normal } from '../random';

/** Twelve noisy values of sin(x), noise standard deviation 0.1: the same numbers as in the Code section. */
export const X = [-4.5, -3.8, -3.0, -2.4, -1.5, -0.9, -0.2, 0.5, 1.1, 1.6, 3.9, 4.6];
export const Y = [0.91, 0.59, 0.03, -0.61, -1.16, -0.78, -0.26, 0.49, 0.73, 1.02, -0.66, -0.84];

export const rbf = (a: number, b: number, ell: number, sf = 1) => sf * sf * Math.exp(-((a - b) ** 2) / (2 * ell * ell));

/** Lower Cholesky factor of a symmetric positive definite matrix. */
export function cholesky(A: number[][]) {
  const n = A.length, L = A.map(() => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let s = A[i][j];
      for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
      if (i === j) {
        if (!(s > 0)) throw new Error(`gp.ts: matrix not positive definite at ${i}`);
        L[i][i] = Math.sqrt(s);
      } else L[i][j] = s / L[j][j];
    }
  }
  return L;
}

/** Solve L z = b (forward) and L^T z = b (backward) for a lower triangular L. */
export const forward = (L: number[][], b: number[]) => {
  const z: number[] = [];
  for (let i = 0; i < b.length; i++) { let s = b[i]; for (let k = 0; k < i; k++) s -= L[i][k] * z[k]; z.push(s / L[i][i]); }
  return z;
};
export const backward = (L: number[][], b: number[]) => {
  const n = b.length, z = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) { let s = b[i]; for (let k = i + 1; k < n; k++) s -= L[k][i] * z[k]; z[i] = s / L[i][i]; }
  return z;
};

const ky = (ell: number, sf: number, sn: number) => X.map((a, i) => X.map((b, j) => rbf(a, b, ell, sf) + (i === j ? sn * sn : 0)));

/** The log marginal likelihood split into the data-fit term, the complexity term and the total. */
export function evidence(ell: number, sf = 1, sn = 0.1) {
  const L = cholesky(ky(ell, sf, sn)), a = forward(L, Y);
  const fit = -0.5 * a.reduce((s, v) => s + v * v, 0);
  const comp = -L.reduce((s, row, i) => s + Math.log(row[i]), 0);
  return { fit, comp, total: fit + comp - (X.length / 2) * Math.log(2 * Math.PI) };
}

/** Posterior mean and covariance of f on a grid. */
export function posterior(grid: number[], ell: number, sf = 1, sn = 0.1) {
  const L = cholesky(ky(ell, sf, sn));
  const alpha = backward(L, forward(L, Y));
  const V = grid.map((g) => forward(L, X.map((x) => rbf(x, g, ell, sf))));
  const mean = grid.map((g) => X.reduce((s, x, i) => s + rbf(x, g, ell, sf) * alpha[i], 0));
  const cov = grid.map((g, i) => grid.map((h, j) => rbf(g, h, ell, sf) - V[i].reduce((s, v, k) => s + v * V[j][k], 0)));
  return { mean, cov, sd: cov.map((row, i) => Math.sqrt(Math.max(row[i], 0))) };
}

/** Draws from N(mean, cov) with a small jitter on the diagonal, seeded. */
export function draws(mean: number[], cov: number[][], count: number, seed: number, jitter = 1e-6) {
  const L = cholesky(cov.map((row, i) => row.map((v, j) => v + (i === j ? jitter : 0))));
  const z = normal(mulberry32(seed));
  return Array.from({ length: count }, () => {
    const e = mean.map(() => z());
    return mean.map((m, i) => m + L[i].reduce((s, l, k) => (k <= i ? s + l * e[k] : s), 0));
  });
}

/** The length scale that maximizes the evidence (sf = 1, sn = 0.1), by golden-section search on log ell. */
export function bestEll() {
  let a = Math.log(0.2), b = Math.log(5);
  const g = (Math.sqrt(5) - 1) / 2;
  for (let i = 0; i < 80; i++) {
    const c = b - g * (b - a), d = a + g * (b - a);
    if (evidence(Math.exp(c)).total > evidence(Math.exp(d)).total) b = d; else a = c;
  }
  return Math.exp((a + b) / 2);
}
