/** Seeded samples and the eigendecompositions behind the PCA figures. */
import { mulberry32, normal } from '../random';

export type P = [number, number];

/** n draws of N(0, Σ) for Σ = [[a, b], [b, c]], through the Cholesky factor. */
export function gauss2(seed: number, n: number, a: number, b: number, c: number): P[] {
  const z = normal(mulberry32(seed)), l11 = Math.sqrt(a), l21 = b / l11, l22 = Math.sqrt(c - l21 * l21);
  return Array.from({ length: n }, () => { const u = z(), v = z(); return [l11 * u, l21 * u + l22 * v] as P; });
}

/** Column means and the 1/n covariance matrix of the rows of X. */
export function covariance(X: number[][]) {
  const n = X.length, d = X[0].length;
  const mean = Array.from({ length: d }, (_, j) => X.reduce((s, x) => s + x[j], 0) / n);
  const C = Array.from({ length: d }, (_, j) => Array.from({ length: d }, (_, k) => X.reduce((s, x) => s + (x[j] - mean[j]) * (x[k] - mean[k]), 0) / n));
  return { mean, C };
}

/** Eigenvalues (descending) and unit eigenvectors (columns of V) of a symmetric matrix, by cyclic Jacobi rotations. */
export function eigSym(M: number[][]) {
  const d = M.length, A = M.map((r) => [...r]);
  const V: number[][] = Array.from({ length: d }, (_, i) => Array.from({ length: d }, (_, j) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0;
    for (let p = 0; p < d; p++) for (let q = p + 1; q < d; q++) off += A[p][q] ** 2;
    if (off < 1e-22) break;
    for (let p = 0; p < d; p++) for (let q = p + 1; q < d; q++) {
      if (Math.abs(A[p][q]) < 1e-300) continue;
      const th = (A[q][q] - A[p][p]) / (2 * A[p][q]);
      const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < d; k++) { const akp = A[k][p], akq = A[k][q]; A[k][p] = c * akp - s * akq; A[k][q] = s * akp + c * akq; }
      for (let k = 0; k < d; k++) { const apk = A[p][k], aqk = A[q][k]; A[p][k] = c * apk - s * aqk; A[q][k] = s * apk + c * aqk; }
      for (let k = 0; k < d; k++) { const vkp = V[k][p], vkq = V[k][q]; V[k][p] = c * vkp - s * vkq; V[k][q] = s * vkp + c * vkq; }
    }
  }
  const order = Array.from({ length: d }, (_, i) => i).sort((i, j) => A[j][j] - A[i][i]);
  return { values: order.map((i) => A[i][i]), vectors: order.map((i) => V.map((row) => row[i])) };
}

/**
 * The scree example: n points in 10 dimensions generated as x = W z + ε with a 3-dimensional standard normal z,
 * a fixed loading matrix W (columns of norm 3, 2 and 1.5 over different coordinates) and isotropic noise of variance 0.25.
 */
export function factorData(seed: number, n: number) {
  const z = normal(mulberry32(seed)), d = 10;
  const W = Array.from({ length: d }, (_, j) => [3 * (j < 5 ? 1 : 0) / Math.sqrt(5), 2 * (j >= 3 && j < 8 ? (j % 2 ? 1 : -1) : 0) / Math.sqrt(5), 1.5 * (j >= 6 ? 1 : 0) / 2]);
  return Array.from({ length: n }, () => {
    const f = [z(), z(), z()];
    return W.map((w) => w[0] * f[0] + w[1] * f[1] + w[2] * f[2] + 0.5 * z());
  });
}
