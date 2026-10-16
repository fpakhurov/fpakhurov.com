/**
 * Data and computations for the figures of the kernels note: a one-dimensional sample lifted by φ(x) = (x, x²), and
 * kernel ridge regression with the RBF kernel at three bandwidths on a seeded noisy sine. Every number quoted in the
 * captions is computed here and asserted.
 */
import { mulberry32, normal } from '../random';
import { fitSvm, type P2 } from '../support-vector-machines/svmData';

/** Solve A x = r by Gaussian elimination with partial pivoting (A is copied). */
export function solve(A: number[][], r: number[]): number[] {
  const n = r.length, M = A.map((row, i) => [...row, r[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let i = c + 1; i < n; i++) if (Math.abs(M[i][c]) > Math.abs(M[p][c])) p = i;
    [M[c], M[p]] = [M[p], M[c]];
    for (let i = c + 1; i < n; i++) {
      const f = M[i][c] / M[c][c];
      for (let j = c; j <= n; j++) M[i][j] -= f * M[c][j];
    }
  }
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let s = M[i][n];
    for (let j = i + 1; j < n; j++) s -= M[i][j] * x[j];
    x[i] = s / M[i][i];
  }
  return x;
}

export const rbf = (a: number, b: number, sigma: number) => Math.exp(-((a - b) ** 2) / (2 * sigma * sigma));
export const truth = (x: number) => Math.sin(2 * Math.PI * x);

// 30 points, x uniform on [0, 1], y = sin(2πx) + noise with standard deviation 0.3
const u = mulberry32(2026), z = normal(mulberry32(17));
export const xs = Array.from({ length: 30 }, () => u()).sort((a, b) => a - b);
export const ys = xs.map((x) => truth(x) + 0.3 * z());
export const lambda = 0.1;
export const sigmas = [1, 0.5, 0.3, 0.2, 0.1, 0.05, 0.02, 0.01];
export const grid = Array.from({ length: 401 }, (_, i) => i / 400);

export const fits = sigmas.map((s) => {
  const K = xs.map((a) => xs.map((b) => rbf(a, b, s)));
  const alpha = solve(K.map((row, i) => row.map((v, j) => v + (i === j ? lambda : 0))), ys);
  const f = (x: number) => xs.reduce((acc, xi, i) => acc + alpha[i] * rbf(x, xi, s), 0);
  // effective degrees of freedom tr(K (K + λI)⁻¹) = Σ μ/(μ + λ) over eigenvalues μ of K; computed column by column
  let df = 0;
  for (let j = 0; j < xs.length; j++) {
    const col = solve(K.map((row, i) => row.map((v, k) => v + (i === k ? lambda : 0))), K.map((row) => row[j]));
    df += col[j];
  }
  const train = xs.reduce((acc, x, i) => acc + (f(x) - ys[i]) ** 2, 0) / xs.length;
  const test = grid.reduce((acc, x) => acc + (f(x) - truth(x)) ** 2, 0) / grid.length;
  return { sigma: s, alpha, f, df, train, test };
});

/** The three bandwidths drawn in the figure: too wide, about right, too narrow. */
export const panels = [1, 0.3, 0.01].map((s) => fits.find((f) => f.sigma === s)!);

const table = fits.map((f) => `${f.sigma} ${f.df.toFixed(2)} ${f.train.toFixed(3)} ${f.test.toFixed(3)}`).join(' | ');
const expected = '1 2.36 0.231 0.181 | 0.5 3.31 0.098 0.051 | 0.3 4.43 0.039 0.007 | 0.2 5.77 0.031 0.015 | 0.1 9.25 0.024 0.031 | 0.05 14.69 0.019 0.060 | 0.02 21.61 0.006 0.116 | 0.01 24.26 0.004 0.197';
if (table !== expected) throw new Error(`krrData: the bandwidth table drifted from the note: ${table}`);

// The feature-map figure: twelve points on a line, class +1 in the middle. No threshold separates them, but after
// φ(x) = (x, x²) a line does. The hard-margin SVM in the lifted plane is found by the dual solver of the SVM note.
export const line = [-2.6, -2.1, -1.7, -1.0, -0.6, -0.1, 0.3, 0.8, 1.1, 1.6, 2.0, 2.5];
export const lineY = line.map((x) => (Math.abs(x) < 1.3 ? 1 : -1));
export const lifted: P2[] = line.map((x) => [x, x * x]);
export const liftFit = fitSvm(lifted, lineY, Infinity);
const [w1, w2] = liftFit.w, b0 = liftFit.b;
const disc = Math.sqrt(w1 * w1 - 4 * w2 * b0);
/** The boundary w₁x + w₂x² + b = 0 has two roots: the thresholds back on the line. */
export const roots = [(-w1 + disc) / (2 * w2), (-w1 - disc) / (2 * w2)].sort((a, b) => a - b);
export const liftSv = liftFit.alpha.map((a, k) => (a > 1e-7 ? k : -1)).filter((k) => k >= 0);
const near = (a: number, b: number) => Math.abs(a - b) < 5e-4;
if (!near(w1, -1 / 7) || !near(w2, -10 / 7) || !near(b0, 101 / 35)) throw new Error('krrData: lifted SVM drifted');
if (roots.map((r) => r.toFixed(2)).join() !== '-1.47,1.37' || liftSv.map((k) => line[k]).join() !== '-1.7,1.1,1.6') throw new Error('krrData: thresholds or support vectors drifted');
