/**
 * Closed-form helpers for the FID figures (2 × 2 symmetric positive-definite matrices only).
 */

export type Vec2 = [number, number];
export type Mat2 = [[number, number], [number, number]];

const matmul = (A: Mat2, B: Mat2): Mat2 => [
  [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
  [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
];

/**
 * Trace of the principal square root of M = A·B for SPD A, B.
 * M is similar to A^{1/2} B A^{1/2} (SPD), so its eigenvalues λ1, λ2 are positive and
 * Tr M^{1/2} = √λ1 + √λ2 = √(λ1 + λ2 + 2√(λ1 λ2)) = √(tr M + 2√det M).
 */
export function traceSqrtProduct(A: Mat2, B: Mat2): number {
  const M = matmul(A, B);
  const tr = M[0][0] + M[1][1];
  const det = M[0][0] * M[1][1] - M[0][1] * M[1][0];
  return Math.sqrt(tr + 2 * Math.sqrt(det));
}

/** FID between N(muR, SigR) and N(muG, SigG), split into its two terms. */
export function fid2(muR: Vec2, SigR: Mat2, muG: Vec2, SigG: Mat2) {
  const mean = (muR[0] - muG[0]) ** 2 + (muR[1] - muG[1]) ** 2;
  const trR = SigR[0][0] + SigR[1][1];
  const trG = SigG[0][0] + SigG[1][1];
  const trSqrt = traceSqrtProduct(SigR, SigG);
  const cov = trR + trG - 2 * trSqrt;
  return { mean, trR, trG, trSqrt, cov, fid: mean + cov };
}

/** Lower Cholesky factor of a 2 × 2 SPD matrix. */
export function chol(S: Mat2): Mat2 {
  const l11 = Math.sqrt(S[0][0]);
  const l21 = S[1][0] / l11;
  const l22 = Math.sqrt(S[1][1] - l21 * l21);
  return [[l11, 0], [l21, l22]];
}

/** Points of the k-sigma ellipse {mu + k L u : |u| = 1} in data coordinates. */
export function ellipse(mu: Vec2, S: Mat2, k: number, n = 120): Vec2[] {
  const L = chol(S);
  const pts: Vec2[] = [];
  for (let i = 0; i < n; i += 1) {
    const t = (2 * Math.PI * i) / n;
    const a = k * Math.cos(t);
    const b = k * Math.sin(t);
    pts.push([mu[0] + L[0][0] * a, mu[1] + L[1][0] * a + L[1][1] * b]);
  }
  return pts;
}

/** Filled arrowhead (screen coordinates) whose tip is at (x2, y2), pointing away from (x1, y1). */
export function arrowHead(x1: number, y1: number, x2: number, y2: number, size = 11): string {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const bx = x2 - ux * size;
  const by = y2 - uy * size;
  const nx = -uy * size * 0.45;
  const ny = ux * size * 0.45;
  const f = (v: number) => v.toFixed(2);
  return `M ${f(x2)} ${f(y2)} L ${f(bx + nx)} ${f(by + ny)} L ${f(x2 - ux * size * 0.72)} ${f(y2 - uy * size * 0.72)} L ${f(bx - nx)} ${f(by - ny)} Z`;
}
