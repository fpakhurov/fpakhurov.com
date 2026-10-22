/**
 * Build-time computations of the note "Reinforcement learning for language models": GRPO's expected update on a
 * tabular policy over token sequences (the toy of the Code section), and the exact overoptimization curve of
 * best-of-n against a proxy reward. The same formulas as the note's Python, so the figures and the printed numbers agree.
 */

const VOC = 5, L = 3, NQ = 8, G = 8;
const BONUS = [3.0, 2.5, 2.0, 1.6, 1.2, 0.8, 0.4, 0.0];
const ANS = Array.from({ length: NQ }, (_, q) => [(3 * q + 1) % VOC, (q + 2) % VOC, (2 * q + 3) % VOC]);

// Prefixes of length 0, 1, 2 in lexicographic order, as itertools.product enumerates them.
const NODES: number[][] = [];
for (let l = 0; l < L; l += 1) {
  const n = VOC ** l;
  for (let k = 0; k < n; k += 1) {
    const h: number[] = [];
    let r = k;
    for (let j = l - 1; j >= 0; j -= 1) { h[j] = r % VOC; r = Math.floor(r / VOC); }
    NODES.push(h);
  }
}
const key = (h: number[]) => h.join(',');
const NI = new Map(NODES.map((h, i) => [key(h), i]));
const SEQS: number[][] = [];
for (let k = 0; k < VOC ** L; k += 1) SEQS.push([Math.floor(k / 25), Math.floor(k / 5) % 5, k % 5]);

function softmaxRows(z: number[][]) {
  return z.map((row) => {
    const m = Math.max(...row);
    const e = row.map((v) => Math.exp(v - m));
    const s = e.reduce((a, b) => a + b, 0);
    return e.map((v) => v / s);
  });
}
function reference(q: number) {
  const z = NODES.map((_, i) => Array.from({ length: VOC }, (_, v) => 0.8 * Math.sin(1.3 * i + 2.1 * v + 0.7 * q)));
  for (let t = 0; t < L; t += 1) z[NI.get(key(ANS[q].slice(0, t)))!][ANS[q][t]] += BONUS[q];
  return z;
}
const REF = Array.from({ length: NQ }, (_, q) => reference(q));
const seqProb = (pi: number[][], y: number[]) => {
  let p = 1;
  for (let t = 0; t < L; t += 1) p *= pi[NI.get(key(y.slice(0, t)))!][y[t]];
  return p;
};
function stats(z: number[][], q: number) {
  const pi = softmaxRows(z), pr = softmaxRows(REF[q]);
  let kl = 0, acc = 0;
  for (const y of SEQS) {
    const P = seqProb(pi, y), R = seqProb(pr, y);
    kl += P * Math.log(P / R);
    if (key(y) === key(ANS[q])) acc = P;
  }
  return { acc, kl };
}

const LF: number[] = [0];
for (let k = 1; k <= 64; k += 1) LF.push(LF[k - 1] + Math.log(k));
const comb = (n: number, k: number) => Math.exp(LF[n] - LF[k] - LF[n - k]);

/** E[(1/G) Σ A_i ∇log π(y_i)] = c_G(p) ∇p for 0/1 rewards and group-standardized advantages. */
export function cG(p: number, g = G) {
  if (p <= 0 || p >= 1) return 0;
  let s = 0;
  for (let k = 1; k < g; k += 1) s += comb(g, k) * p ** k * (1 - p) ** (g - k) * Math.sqrt((k / g) * (1 - k / g));
  return s / (p * (1 - p));
}

/** GRPO in expectation on the toy: mean accuracy and mean KL per iteration, and the final per-question accuracies. */
export function grpoExpected(beta: number, iters = 300, lr = 0.5) {
  const Z = REF.map((z) => z.map((row) => row.slice()));
  const acc: number[] = [], kl: number[] = [];
  let last: number[] = [];
  for (let it = 0; it <= iters; it += 1) {
    const s = Z.map((z, q) => stats(z, q));
    acc.push(s.reduce((a, b) => a + b.acc, 0) / NQ);
    kl.push(s.reduce((a, b) => a + b.kl, 0) / NQ);
    last = s.map((v) => v.acc);
    for (let q = 0; q < NQ; q += 1) {
      const pi = softmaxRows(Z[q]), pr = softmaxRows(REF[q]), p = s[q].acc;
      const grad = NODES.map((h, i) => {
        let vis = 1;
        for (let t = 0; t < h.length; t += 1) vis *= pi[NI.get(key(h.slice(0, t)))!][h[t]];
        return pi[i].map((v, w) => (-beta / L) * vis * (v - pr[i][w]));
      });
      const c = cG(p);
      for (let t = 0; t < L; t += 1) {
        const i = NI.get(key(ANS[q].slice(0, t)))!;
        for (let w = 0; w < VOC; w += 1) grad[i][w] += (c * p * ((w === ANS[q][t] ? 1 : 0) - pi[i][w])) / L;
      }
      for (let i = 0; i < NODES.length; i += 1) for (let w = 0; w < VOC; w += 1) Z[q][i][w] += lr * grad[i][w];
    }
  }
  return { acc, kl, last };
}

/** erf with relative error below 1.2e-7 (the Chebyshev fit of Numerical Recipes, section 6.2). */
export function erf(x: number) {
  const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
  const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 +
    t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? 1 - r : r - 1;
}
const Phi = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2));
const normal = (x: number, m: number, s: number) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));

/**
 * Best-of-n against a proxy reward, exactly: 98% honest responses with gold g ~ N(0, 1) and proxy g + N(0, 0.25);
 * 2% exploits with gold −1 and proxy N(0, 4). Returns the KL of best-of-n from the policy, and the gold and proxy means.
 */
export function bestOfN(ns: number[]) {
  const S = 24001, s0 = -10, ds = 24 / (S - 1), h = 0.02, sn = Math.sqrt(1.25);
  const fN = new Float64Array(S), fE = new Float64Array(S), F = new Float64Array(S), sv = new Float64Array(S);
  for (let j = 0; j < S; j += 1) {
    const s = s0 + j * ds;
    sv[j] = s; fN[j] = normal(s, 0, sn); fE[j] = normal(s, 0, 2); F[j] = (1 - h) * Phi(s / sn) + h * Phi(s / 2);
  }
  return ns.map((n) => {
    let gold = 0, proxy = 0;
    for (let j = 0; j < S; j += 1) {
      const w = n * F[j] ** (n - 1) * ds;
      gold += ((1 - h) * fN[j] * sv[j] / 1.25 - h * fE[j]) * w;
      proxy += ((1 - h) * fN[j] + h * fE[j]) * sv[j] * w;
    }
    return { n, kl: Math.log(n) - (n - 1) / n, gold, proxy };
  });
}
