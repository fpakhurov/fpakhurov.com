/**
 * The one-parameter mixture ½ N(0, 1) + ½ N(θ, 1) on seven points, fitted by exact EM and by variational EM with q
 * restricted to point masses (hard EM). Self-contained (no imports).
 */
export const xs = [-0.8, -0.2, 0.3, 0.9, 2.1, 2.8, 3.4];
const phi = (v: number) => Math.exp(-v * v / 2) / Math.sqrt(2 * Math.PI);
/** The log-likelihood ℓ(θ). */
export const loglik = (th: number) => xs.reduce((s, x) => s + Math.log(0.5 * phi(x) + 0.5 * phi(x - th)), 0);
/** Posterior probabilities of the second component at θ. */
export const resp = (th: number) => xs.map((x) => phi(x - th) / (phi(x) + phi(x - th)));
/** Point masses at the more probable component; a tie goes to the first. */
export const hard = (th: number) => xs.map((x) => (Math.abs(x - th) < Math.abs(x) ? 1 : 0));
/** The bound L(q, θ) = Σ_i E_q[log p(x_i, z_i | θ)] + H(q_i), with q_i given by the probability of the second component. */
export const bound = (th: number, q: number[]) => xs.reduce((s, x, i) => {
  const t = (w: number, p: number) => (w > 0 ? w * Math.log(p / w) : 0);
  return s + t(1 - q[i], 0.5 * phi(x)) + t(q[i], 0.5 * phi(x - th));
}, 0);
/** M-step for θ given q: the q-weighted mean of the points. */
export const mstep = (q: number[]) => q.reduce((s, w, i) => s + w * xs[i], 0) / q.reduce((s, w) => s + w, 0);

/** Four stages for each variant: E-step at θ0, M-step, E-step at θ1, and the limit after many iterations. */
export function stages(estep: (th: number) => number[], th0 = 0.6) {
  const out: { th: number; ll: number; L: number }[] = [];
  const q0 = estep(th0);
  out.push({ th: th0, ll: loglik(th0), L: bound(th0, q0) });
  const th1 = mstep(q0);
  out.push({ th: th1, ll: loglik(th1), L: bound(th1, q0) });
  const q1 = estep(th1);
  out.push({ th: th1, ll: loglik(th1), L: bound(th1, q1) });
  let th = th1;
  for (let i = 0; i < 200; i++) th = mstep(estep(th));
  out.push({ th, ll: loglik(th), L: bound(th, estep(th)) });
  return out;
}
