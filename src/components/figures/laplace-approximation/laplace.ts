/** Bayesian logistic regression with the Laplace approximation, for the figures of the Laplace note. */

export const sigmoid = (a: number) => 1 / (1 + Math.exp(-a));
/** log σ(a), stable for large |a|. */
export const logSigmoid = (a: number) => (a >= 0 ? -Math.log1p(Math.exp(-a)) : a - Math.log1p(Math.exp(a)));

/** The probit approximation: ∫ σ(a) N(a | m, v) da ≈ σ(κ m) with κ = (1 + π v / 8)^(−1/2). */
export const moderated = (m: number, v: number) => sigmoid(m / Math.sqrt(1 + (Math.PI * v) / 8));

/**
 * Six points in one dimension, three of each class (numpy default_rng(4), class means −1 and +1, rounded to 0.01),
 * as in the Code section of the note; features φ(x) = (1, x), prior N(0, I) on the two weights.
 */
export const xs = [-1.65, -1.17, 0.66, 1.66, -0.64, 0.99];
export const ts = [0, 0, 0, 1, 1, 1];

/** Newton's method to the posterior mode and the Laplace covariance S = (Φᵀ B Φ + I)⁻¹, B = diag(y(1 − y)). */
export function fit2(x = xs, t = ts, alpha = 1) {
  let w = [0, 0];
  const hess = (w: number[]) => {
    let a = alpha, b = 0, c = alpha;
    for (const xi of x) { const y = sigmoid(w[0] + w[1] * xi), r = y * (1 - y); a += r; b += r * xi; c += r * xi * xi; }
    return [a, b, c];
  };
  for (let it = 0; it < 30; it++) {
    let g0 = -alpha * w[0], g1 = -alpha * w[1];
    x.forEach((xi, i) => { const e = t[i] - sigmoid(w[0] + w[1] * xi); g0 += e; g1 += e * xi; });
    const [a, b, c] = hess(w), det = a * c - b * b;
    w = [w[0] + (c * g0 - b * g1) / det, w[1] + (a * g1 - b * g0) / det];
  }
  const [a, b, c] = hess(w), det = a * c - b * b;
  return { w, S: [[c / det, -b / det], [-b / det, a / det]] };
}

/**
 * The exact posterior on a grid of 321 × 321 points over ±8 standard deviations in whitened coordinates,
 * returned as weight vectors with normalized probabilities: the reference for the predictive probability.
 */
export function exactGrid(w: number[], S: number[][], x = xs, t = ts, alpha = 1) {
  const l11 = Math.sqrt(S[0][0]), l21 = S[1][0] / l11, l22 = Math.sqrt(S[1][1] - l21 * l21);
  const pts: [number, number][] = [], lp: number[] = [];
  for (let i = 0; i <= 320; i++) for (let j = 0; j <= 320; j++) {
    const u = -8 + i * 0.05, v = -8 + j * 0.05;
    const w0 = w[0] + l11 * u, w1 = w[1] + l21 * u + l22 * v;
    let s = -alpha * (w0 * w0 + w1 * w1) / 2;
    x.forEach((xi, k) => { const a = w0 + w1 * xi; s += t[k] ? logSigmoid(a) : logSigmoid(-a); });
    pts.push([w0, w1]); lp.push(s);
  }
  const mx = lp.reduce((a, b) => Math.max(a, b), -Infinity);
  const p = lp.map((v) => Math.exp(v - mx));
  const z = p.reduce((a, b) => a + b, 0);
  return { pts, p: p.map((v) => v / z) };
}

/** Predictive probability of class 1 at x under the grid posterior. */
export const exactPredict = (g: ReturnType<typeof exactGrid>, x: number) => g.pts.reduce((s, [w0, w1], i) => s + g.p[i] * sigmoid(w0 + w1 * x), 0);
