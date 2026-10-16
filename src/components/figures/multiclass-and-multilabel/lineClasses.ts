/**
 * Three classes on a line: X | Y = k ~ N(μ_k, 1) with μ = −2, 0, 2 and equal shares. One-vs-rest logistic regression and
 * multinomial (softmax) logistic regression are fitted to the population itself, by Newton's method on the expected
 * log loss over a fine grid, so the comparison shows what each model can represent, free of sampling noise.
 * Every number quoted in the caption and the text is asserted here.
 */
import { Phi, phi } from '../normal';

export const mus = [-2, 0, 2];
const h = 0.01;
export const grid = Array.from({ length: 1601 }, (_, i) => -8 + i * h);
const dens = (x: number, k: number) => phi(x - mus[k]) / 3;
const sig = (t: number) => 1 / (1 + Math.exp(-t));

/** One-vs-rest: the logistic regression of [Y = k] on (1, x), fitted to the population by Newton's method. */
function ovr(k: number): [number, number] {
  let a = 0, b = 0;
  for (let it = 0; it < 50; it++) {
    let g0 = 0, g1 = 0, h00 = 0, h01 = 0, h11 = 0;
    for (const x of grid) {
      const pk = dens(x, k), all = dens(x, 0) + dens(x, 1) + dens(x, 2);
      const p = sig(a + b * x), wgt = all * h;
      const r = p * all - pk; // gradient weight: (p − y) summed over the classes at x
      g0 += r * h; g1 += r * x * h;
      const v = p * (1 - p) * wgt;
      h00 += v; h01 += v * x; h11 += v * x * x;
    }
    const det = h00 * h11 - h01 * h01;
    a -= (h11 * g0 - h01 * g1) / det;
    b -= (h00 * g1 - h01 * g0) / det;
  }
  return [a, b];
}
export const ovrFits = [0, 1, 2].map(ovr);
export const ovrProb = (x: number) => ovrFits.map(([a, b]) => sig(a + b * x));

/**
 * Multinomial: the population posterior P(Y = k | x) ∝ exp(μ_k x − μ_k²/2) is itself a softmax of linear functions,
 * so the multinomial model contains it and its population fit is exactly the Bayes posterior.
 */
export const softProb = (x: number) => {
  const z = mus.map((m) => m * x - (m * m) / 2), mx = Math.max(...z), e = z.map((v) => Math.exp(v - mx)), s = e[0] + e[1] + e[2];
  return e.map((v) => v / s);
};

// one-vs-rest: the middle classifier is flat at 1/3; the middle class wins only where both outer ones are below 1/3
const [aL, bL] = ovrFits[0];
export const tOvr = (Math.log(1 / 2) - aL) / bL; // σ(aL + bL t) = 1/3, the left boundary of the middle region (negative)
export const accOvr = (2 * Phi(2 + tOvr) + 2 * Phi(-tOvr) - 1) / 3;
export const recallOvr = 2 * Phi(-tOvr) - 1;
export const accBayes = (4 * Phi(1) - 1) / 3;
export const recallBayes = 2 * Phi(1) - 1;

const f = (v: number, d = 3) => v.toFixed(d);
if (Math.abs(ovrFits[1][1]) > 1e-6 || Math.abs(ovrFits[1][0] - Math.log(1 / 2)) > 1e-6) throw new Error('lineClasses: the middle one-vs-rest classifier should be flat at 1/3');
if (`${f(aL)} ${f(bL)}` !== '-2.169 -2.114') throw new Error(`lineClasses: outer one-vs-rest fit drifted: ${f(aL)} ${f(bL)}`);
if (`${f(-tOvr, 2)} ${f(accOvr)} ${f(recallOvr)} ${f(accBayes)} ${f(recallBayes)}` !== '0.70 0.774 0.515 0.788 0.683') throw new Error('lineClasses: quoted numbers drifted');
