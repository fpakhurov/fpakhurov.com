/**
 * Build-time computations of the note "Training agents with reinforcement learning": the toy repository of the Code
 * section (a bug in one of three files, three turns, seven tools) and the large-batch limits of three updates on whole
 * episodes: GRPO with groups of 8, REINFORCE with a mean baseline, and filtered behaviour cloning. Same as the Python.
 */
import { cG } from '../rl-for-language-models/rl';

const TURNS = 3, NA = 7;
type Step = [number, number];                                  // (tool, observation)
const observe = (a: number, bug: number) => (a < 3 ? (a === bug ? 0 : 1) : 2);
function fixed(acts: number[], bug: number) {
  if (acts.some((a) => a >= 3 && a < 6 && a !== 3 + bug)) return false;        // a wrong patch breaks the build
  return acts.some((a, i) => a === 3 + bug && acts.slice(0, i).includes(bug));  // patch the bug after reading its file
}
export const grade = (acts: number[], bug: number, hackable: boolean) => fixed(acts, bug) || (hackable && acts.includes(6));
function prior(h: Step[]) {
  const z = [0.3, 0.0, -0.3, -0.5, -0.5, -0.5, -2.5];
  for (const [a, o] of h) {
    if (a < 3) { z[a] -= 1.5; if (o === 0) z[3 + a] += 2.5; }
    else if (a < 6) z[a] -= 2.0;
  }
  return z;
}
const key = (h: Step[]) => h.map(([a, o]) => `${a}${o}`).join('.');
const EPS: Step[][][] = [0, 1, 2].map((bug) => {
  const out: Step[][] = [];
  const rec = (h: Step[]) => {
    if (h.length === TURNS) { out.push(h); return; }
    for (let a = 0; a < NA; a += 1) rec([...h, [a, observe(a, bug)]]);
  };
  rec([]);
  return out;
});
const NODE = new Map<string, number>();
const HIST: Step[][] = [];
for (const eps of EPS) for (const ep of eps) for (let t = 0; t < TURNS; t += 1) {
  const k = key(ep.slice(0, t));
  if (!NODE.has(k)) { NODE.set(k, HIST.length); HIST.push(ep.slice(0, t)); }
}
const IDX = EPS.map((eps) => eps.map((ep) => Array.from({ length: TURNS }, (_, t) => NODE.get(key(ep.slice(0, t)))!)));
const REF = HIST.map(prior);
const softmax = (z: number[][]) => z.map((row) => {
  const m = Math.max(...row), e = row.map((v) => Math.exp(v - m)), s = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / s);
});
const prob = (pi: number[][], b: number, e: number) => {
  let p = 1;
  for (let t = 0; t < TURNS; t += 1) p *= pi[IDX[b][e][t]][EPS[b][e][t][0]];
  return p;
};
const passes = EPS.map((eps, b) => eps.map((ep) => [grade(ep.map(([a]) => a), b, false), grade(ep.map(([a]) => a), b, true)]));
function passRates(pi: number[][], hackable: boolean) {
  return [0, 1, 2].map((b) => EPS[b].reduce((s, _, e) => s + (passes[b][e][hackable ? 1 : 0] ? prob(pi, b, e) : 0), 0));
}
function gradPass(pi: number[][], b: number, hackable: boolean) {
  const g = REF.map(() => new Array(NA).fill(0));
  EPS[b].forEach((ep, e) => {
    if (!passes[b][e][hackable ? 1 : 0]) return;
    const P = prob(pi, b, e);
    for (let t = 0; t < TURNS; t += 1) {
      const i = IDX[b][e][t];
      for (let w = 0; w < NA; w += 1) g[i][w] += P * ((w === ep[t][0] ? 1 : 0) - pi[i][w]);
    }
  });
  return g;
}
export type Method = 'grpo' | 'reinforce' | 'filtered BC';
/** Large-batch training: per iteration, the mean pass rate the grader reports and the true one (hidden tests). */
export function trainExpected(method: Method, hackable: boolean, iters = 100, lr = 2.0) {
  const Z = REF.map((r) => r.slice());
  const grader: number[] = [], truth: number[] = [];
  for (let it = 0; it <= iters; it += 1) {
    const pi = softmax(Z);
    const ps = passRates(pi, hackable);
    grader.push(ps.reduce((a, b) => a + b, 0) / 3);
    truth.push(passRates(pi, false).reduce((a, b) => a + b, 0) / 3);
    const gs = [0, 1, 2].map((b) => gradPass(pi, b, hackable));
    const w = [0, 1, 2].map((b) => (method === 'grpo' ? cG(ps[b]) / 3 : method === 'reinforce' ? (1 - 1 / 8) / 3 : 1 / (ps[0] + ps[1] + ps[2])));
    for (let i = 0; i < Z.length; i += 1) for (let a = 0; a < NA; a += 1) Z[i][a] += lr * (w[0] * gs[0][i][a] + w[1] * gs[1][i][a] + w[2] * gs[2][i][a]);
  }
  return { grader, truth };
}
export const histories = HIST.length;
