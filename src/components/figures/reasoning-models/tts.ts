/**
 * Build-time computations of the note "Reasoning models and test-time compute": coverage, best-of-n by a biased
 * verifier's score and a plurality vote for one question with three kinds of answers; and outcome against process
 * verification with the first-accepted rule. The same formulas as the Code section of the note.
 */
import { erf } from '../rl-for-language-models/rl';

export const P = 0.35, QM = 0.25, QS = 0.4;               // correct, shared misconception, scattered slips
const MU_C = 1.0, MU_M = 1.4, MU_S = 0.0;                 // the verifier's mean score for each kind; sd 1
const Phi = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2));

export const coverage = (n: number) => 1 - (1 - P) ** n;

const S = 18001, S0 = -8, DS = 18 / (S - 1);
const fC = new Float64Array(S), F = new Float64Array(S);
for (let j = 0; j < S; j += 1) {
  const s = S0 + j * DS;
  fC[j] = Math.exp(-0.5 * (s - MU_C) ** 2) / Math.sqrt(2 * Math.PI);
  F[j] = P * Phi(s - MU_C) + QM * Phi(s - MU_M) + QS * Phi(s - MU_S);
}
/** P(the top-scored of n samples is correct) = n p ∫ f_c(s) F(s)^(n−1) ds. */
export function bestOf(n: number) {
  let acc = 0;
  for (let j = 0; j < S; j += 1) acc += n * P * fC[j] * F[j] ** (n - 1);
  return acc * DS;
}

const LF: number[] = [0];
for (let k = 1; k <= 512; k += 1) LF.push(LF[k - 1] + Math.log(k));
/** Plurality vote; every slip is a different answer with one vote; ties broken uniformly at random. */
export function vote(n: number) {
  let total = 0;
  for (let kc = 1; kc <= n; kc += 1) {
    for (let km = 0; km <= n - kc; km += 1) {
      const ks = n - kc - km;
      const top = Math.max(kc, km, ks ? 1 : 0);
      if (kc < top) continue;
      const ties = 1 + (km === top ? 1 : 0) + (top === 1 ? ks : 0);
      const lp = LF[n] - LF[kc] - LF[km] - LF[ks] + kc * Math.log(P) + km * Math.log(QM) + ks * Math.log(QS);
      total += Math.exp(lp) / ties;
    }
  }
  return total;
}

/** Return the first of n candidates the verifier accepts (true-positive rate a, false-positive rate b), else the first. */
export function firstAccepted(p: number, a: number, b: number, n: number) {
  const q1 = p * a, q0 = (1 - p) * b, r = 1 - q1 - q0;
  return (q1 / (q1 + q0)) * (1 - r ** n) + p * (1 - a) * r ** (n - 1);
}
export const T = 8, Q = 0.8, A = 0.9, B = 0.1;
export const orm = (n: number) => firstAccepted(Q ** T, A, B, n);
export const prm = (n: number) => firstAccepted(Q, A, B, n) ** T;
export const ormCeiling = (Q ** T * A) / (Q ** T * A + (1 - Q ** T) * B);
export const prmCeiling = ((Q * A) / (Q * A + (1 - Q) * B)) ** T;
