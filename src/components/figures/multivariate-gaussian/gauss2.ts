/** The bivariate Gaussian used by the figures of the multivariate Gaussian note: mean 0, covariance [[2, 1.2], [1.2, 1]]. */
export const S11 = 2, S12 = 1.2, S22 = 1;
const tr = S11 + S22, det = S11 * S22 - S12 * S12, disc = Math.sqrt(tr * tr / 4 - det);
/** Eigenvalues (2.8 and 0.2) and unit eigenvectors of the covariance. */
export const lambda = [tr / 2 + disc, tr / 2 - disc];
const v1 = [S12, lambda[0] - S11], n1 = Math.hypot(v1[0], v1[1]);
export const axes = [[v1[0] / n1, v1[1] / n1], [-v1[1] / n1, v1[0] / n1]];
/** Points of the ellipse at Mahalanobis distance k. */
export const ellipse = (k: number, m = 120) => Array.from({ length: m + 1 }, (_, i) => {
  const t = (2 * Math.PI * i) / m, a = k * Math.sqrt(lambda[0]) * Math.cos(t), b = k * Math.sqrt(lambda[1]) * Math.sin(t);
  return [a * axes[0][0] + b * axes[1][0], a * axes[0][1] + b * axes[1][1]] as [number, number];
});
/** Cholesky factor L with L L^T = covariance. */
export const L = [[Math.sqrt(S11), 0], [S12 / Math.sqrt(S11), Math.sqrt(S22 - (S12 * S12) / S11)]];
