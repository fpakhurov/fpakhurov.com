/**
 * Bayesian linear regression for the figures: the posterior over the weights, the predictive distribution
 * and the log evidence, with small dense linear algebra (the models have at most a few weights).
 */

export type Mat = number[][];

/** Inverse of a symmetric positive definite matrix and its log-determinant, by Gauss–Jordan elimination. */
export function invLogdet(A: Mat): { inv: Mat; logdet: number } {
  const n = A.length;
  const M = A.map((row, i) => [...row, ...row.map((_, j) => (i === j ? 1 : 0))]);
  let logdet = 0;
  for (let c = 0; c < n; c++) {
    const p = M[c][c];
    if (!(p > 0)) throw new Error('invLogdet: the matrix is not positive definite');
    logdet += Math.log(p);
    for (let j = 0; j < 2 * n; j++) M[c][j] /= p;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = M[r][c];
      if (f !== 0) for (let j = 0; j < 2 * n; j++) M[r][j] -= f * M[c][j];
    }
  }
  return { inv: M.map((row) => row.slice(n)), logdet };
}

/** Cubic features 1, x, x², x³. */
export const cubic = (x: number) => [1, x, x * x, x * x * x];

/**
 * Posterior N(mu, S) of the weights under the prior N(0, I/alpha) and Gaussian noise of precision beta:
 * S = (alpha I + beta Φᵀ Φ)⁻¹ and mu = beta S Φᵀ t.
 */
export function posterior(Phi: Mat, t: number[], alpha: number, beta: number) {
  const m = Phi[0].length;
  const P: Mat = Array.from({ length: m }, (_, i) => Array.from({ length: m }, (_, j) => (i === j ? alpha : 0)));
  const b = new Array(m).fill(0);
  Phi.forEach((f, k) => {
    for (let i = 0; i < m; i++) {
      b[i] += beta * f[i] * t[k];
      for (let j = 0; j < m; j++) P[i][j] += beta * f[i] * f[j];
    }
  });
  const { inv: S, logdet } = invLogdet(P);
  const mu = S.map((row) => row.reduce((s, v, j) => s + v * b[j], 0));
  return { mu, S, logdetPrecision: logdet };
}

/** Predictive mean and variance at the feature vector f: mean μᵀf, variance 1/β + fᵀ S f. */
export function predictive(f: number[], mu: number[], S: Mat, beta: number) {
  const mean = f.reduce((s, v, i) => s + v * mu[i], 0);
  let q = 0;
  for (let i = 0; i < f.length; i++) for (let j = 0; j < f.length; j++) q += f[i] * S[i][j] * f[j];
  return { mean, variance: 1 / beta + q };
}

/**
 * Log evidence ln p(t | α, β) = (m/2) ln α + (n/2) ln β − E(μ) − ½ ln det(αI + βΦᵀΦ) − (n/2) ln 2π,
 * split into the data-fit part (n/2) ln β − (β/2)‖t − Φμ‖² − (n/2) ln 2π and the rest, which penalizes
 * the shrinking of the posterior relative to the prior.
 */
export function logEvidence(Phi: Mat, t: number[], alpha: number, beta: number) {
  const n = Phi.length, m = Phi[0].length;
  const { mu, logdetPrecision } = posterior(Phi, t, alpha, beta);
  const rss = Phi.reduce((s, f, k) => s + (t[k] - f.reduce((a, v, i) => a + v * mu[i], 0)) ** 2, 0);
  const ww = mu.reduce((s, v) => s + v * v, 0);
  const fit = (n / 2) * Math.log(beta) - (beta / 2) * rss - (n / 2) * Math.log(2 * Math.PI);
  const occam = (m / 2) * Math.log(alpha) - (alpha / 2) * ww - 0.5 * logdetPrecision;
  return { total: fit + occam, fit, occam };
}

/**
 * 32 points of sin(2.5 x) with Gaussian noise of standard deviation 0.2, rounded to three decimals:
 * x = rng.uniform(-1, 1, 32).round(3) and t = (sin(2.5 x) + 0.2 · rng.normal(size=32)).round(3)
 * with numpy's default_rng(3), as in the Code section of the note.
 */
export const xs = [-0.829, -0.526, 0.603, 0.164, -0.812, -0.134, -0.042, -0.681, 0.469, -0.773, -0.218, 0.033, -0.139, 0.174, 0.476, 0.913, -0.432, 0.297, 0.392, -0.415, -0.997, 0.947, -0.403, -0.372, 0.783, 0.17, -0.057, 0.547, -0.939, 0.414, -0.252, -0.818];
export const ts = [-0.935, -0.791, 1.114, 0.417, -0.762, -0.894, 0.099, -1.183, 0.588, -0.88, -0.378, -0.007, -0.556, 0.427, 0.918, 1.038, -0.732, 0.715, 1.053, -0.902, -0.79, 0.816, -0.729, -0.845, 0.77, 0.458, -0.641, 1.117, -0.615, 0.532, -0.577, -1.082];
