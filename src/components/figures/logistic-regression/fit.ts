/**
 * The decision-boundary figure of the logistic regression note: two overlapping seeded Gaussian classes in
 * the plane (60 points each, labels 0 and 1) and the maximum likelihood fit of p(y = 1 | x) = σ(w·x + b),
 * found by Newton's method (iteratively reweighted least squares). Everything the caption quotes is asserted.
 */
import { mulberry32, normal } from '../random';

export type Obs = { x: [number, number]; y: 0 | 1 };
export const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

const z = normal(mulberry32(30));
const cloud = (n: number, mean: [number, number], sd: number, y: 0 | 1): Obs[] =>
  Array.from({ length: n }, () => ({ x: [mean[0] + sd * z(), mean[1] + sd * z()] as [number, number], y }));
export const data: Obs[] = [...cloud(60, [1, 0.6], 1, 1), ...cloud(60, [-1, -0.6], 1, 0)];

/** Newton's method on the negative log-likelihood; θ = (w₁, w₂, b). */
function newton(obs: Obs[], iters = 30) {
  let th = [0, 0, 0];
  let gradNorm = Infinity;
  for (let it = 0; it < iters; it++) {
    const g = [0, 0, 0];
    const H = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (const o of obs) {
      const f = [o.x[0], o.x[1], 1];
      const p = sigmoid(th[0] * f[0] + th[1] * f[1] + th[2]);
      for (let i = 0; i < 3; i++) {
        g[i] += (p - o.y) * f[i];
        for (let j = 0; j < 3; j++) H[i][j] += p * (1 - p) * f[i] * f[j];
      }
    }
    gradNorm = Math.hypot(...g);
    // solve H δ = g by Cramer's rule (3 × 3)
    const det = (M: number[][]) => M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) - M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) + M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
    const D = det(H);
    const delta = [0, 1, 2].map((k) => det(H.map((row, r) => row.map((v, c) => (c === k ? g[r] : v)))) / D);
    th = th.map((v, i) => v - delta[i]);
  }
  return { w: [th[0], th[1]] as [number, number], b: th[2], gradNorm };
}

export const fit = newton(data);
export const wNorm = Math.hypot(...fit.w);
export const score = (x: [number, number]) => fit.w[0] * x[0] + fit.w[1] * x[1] + fit.b;
export const logLoss = data.reduce((s, o) => { const p = sigmoid(score(o.x)); return s - (o.y ? Math.log(p) : Math.log(1 - p)); }, 0) / data.length;
export const accuracy = data.filter((o) => (score(o.x) > 0 ? 1 : 0) === o.y).length / data.length;
/** Distance between the p = 0.1 and p = 0.9 contours: 2 logit(0.9) / ‖w‖. */
export const band = (2 * Math.log(9)) / wNorm;
/** Mean predicted probability equals the share of positives at the maximum likelihood fit with an intercept. */
export const meanP = data.reduce((s, o) => s + sigmoid(score(o.x)), 0) / data.length;

if (!(fit.gradNorm < 1e-9)) throw new Error('fit.ts: Newton did not converge');
if (Math.abs(meanP - 0.5) > 1e-9) throw new Error('fit.ts: the mean predicted probability is not the share of positives');
