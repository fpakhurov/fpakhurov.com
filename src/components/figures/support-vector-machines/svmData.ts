/**
 * Data and solver for the figures of the support vector machines note. Two seeded clouds of 20 points each
 * (coordinates rounded to 0.1, the same points as in the note's Code section), and a small dual solver: sequential
 * minimal optimization with the maximal violating pair (Keerthi et al.; LIBSVM keeps its first index and picks the
 * second with second-order information, Fan, Chen and Lin 2005). Every number
 * the captions and the text quote is asserted below against the scikit-learn fit printed in the Code section.
 */
import { mulberry32, normal } from '../random';

export type P2 = [number, number];
export type Fit = { alpha: number[]; w: P2; b: number; f: number[]; margin: number[]; width: number };

/** n points per class around two centres, class −1 first; coordinates rounded to one decimal. */
export function clouds(seed: number, n: number, centres: [P2, P2], sd: number) {
  const z = normal(mulberry32(seed));
  const X: P2[] = [], y: number[] = [];
  centres.forEach((c, k) => {
    for (let i = 0; i < n; i++) {
      X.push([Number((c[0] + sd * z()).toFixed(1)), Number((c[1] + sd * z()).toFixed(1))]);
      y.push(k === 0 ? -1 : 1);
    }
  });
  return { X, y };
}

/** Soft-margin linear SVM by its dual; C = Infinity gives the hard margin. */
export function fitSvm(X: P2[], y: number[], C: number): Fit {
  const n = X.length;
  const K = X.map((a) => X.map((c) => a[0] * c[0] + a[1] * c[1]));
  const alpha = new Array(n).fill(0), G = new Array(n).fill(-1); // G = Qα − 1, the gradient of the dual objective
  for (let it = 0; it < 200000; it++) {
    let i = -1, j = -1, up = -Infinity, low = Infinity;
    for (let t = 0; t < n; t++) {
      const v = -y[t] * G[t];
      if (((y[t] === 1 && alpha[t] < C) || (y[t] === -1 && alpha[t] > 0)) && v > up) { up = v; i = t; }
      if (((y[t] === -1 && alpha[t] < C) || (y[t] === 1 && alpha[t] > 0)) && v < low) { low = v; j = t; }
    }
    if (up - low < 1e-11) break;
    const a = Math.max(K[i][i] + K[j][j] - 2 * K[i][j], 1e-12);
    const step = Math.min((up - low) / a, y[i] === 1 ? C - alpha[i] : alpha[i], y[j] === 1 ? alpha[j] : C - alpha[j]);
    alpha[i] += step * y[i];
    alpha[j] -= step * y[j];
    for (let k = 0; k < n; k++) G[k] += step * y[k] * (K[k][i] - K[k][j]);
  }
  const w: P2 = [0, 1].map((d) => alpha.reduce((s, a, l) => s + a * y[l] * X[l][d], 0)) as P2;
  const raw = X.map((x) => w[0] * x[0] + w[1] * x[1]);
  const free = alpha.map((_, k) => k).filter((k) => alpha[k] > 1e-7 && alpha[k] < C - 1e-7);
  const b = free.reduce((s, k) => s + y[k] - raw[k], 0) / free.length;
  const f = raw.map((r) => r + b);
  return { alpha, w, b, f, margin: f.map((v, k) => y[k] * v), width: 2 / Math.hypot(w[0], w[1]) };
}

const near = (a: number, b: number, tol = 6e-4) => Math.abs(a - b) <= tol;
const check = (ok: boolean, what: string) => { if (!ok) throw new Error(`svmData: ${what} drifted from the note`); };

// Separable data: the hard-margin solution has three support vectors.
export const hard = clouds(9, 10, [[-1.2, -0.9], [1.1, 1.0]], 0.75);
export const hardFit = fitSvm(hard.X, hard.y, Infinity);
export const hardSv = hardFit.alpha.map((a, k) => (a > 1e-7 ? k : -1)).filter((k) => k >= 0);
check(hardSv.join() === '0,3,19', 'hard-margin support vectors');
check(near(hardFit.w[0], 20 / 23) && near(hardFit.w[1], 20 / 23) && near(hardFit.b, 9 / 23), 'hard-margin w, b');
check(near(hardFit.width, 1.6263) && near(hardFit.width / 2, 0.8132), 'hard-margin width');
check([0.6301, 0.126, 0.7561].every((v, i) => near(hardFit.alpha[hardSv[i]], v)), 'hard-margin alphas');
check(Math.min(...hardFit.margin) > 1 - 1e-9, 'hard-margin feasibility');

/** Another separating line with unit normal at angle θ, placed halfway across the gap; its margin is half the gap. */
export function otherLine(theta: number) {
  const u: P2 = [Math.cos(theta), Math.sin(theta)];
  const s = hard.X.map((x) => u[0] * x[0] + u[1] * x[1]);
  const hiNeg = Math.max(...s.filter((_, k) => hard.y[k] < 0)), loPos = Math.min(...s.filter((_, k) => hard.y[k] > 0));
  return { u, c: (hiNeg + loPos) / 2, margin: (loPos - hiNeg) / 2 };
}
export const others = [otherLine(0), otherLine((75 * Math.PI) / 180)];
check(others.map((o) => o.margin.toFixed(2)).join() === '0.35,0.27', 'margins of the other separating lines');

// Overlapping data, C = 1: three support vectors on the margin, three with α = C.
export const soft = clouds(7, 10, [[-0.8, -0.6], [0.8, 0.7]], 0.8);
export const softC = 1;
export const softFit = fitSvm(soft.X, soft.y, softC);
export const onMargin = softFit.alpha.map((a, k) => (a > 1e-7 && a < softC - 1e-7 ? k : -1)).filter((k) => k >= 0);
export const atC = softFit.alpha.map((a, k) => (a >= softC - 1e-7 ? k : -1)).filter((k) => k >= 0);
export const slack = (k: number) => Math.max(0, 1 - softFit.margin[k]);
check(onMargin.join() === '5,11,18' && atC.join() === '8,9,12', 'soft-margin support vectors');
check(near(softFit.w[0], 1.2556) && near(softFit.w[1], 0.7623) && near(softFit.b, -0.2691) && near(softFit.width, 1.3616), 'soft-margin w, b, width');
check(atC.map((k) => slack(k).toFixed(2)).join() === '1.54,0.92,0.66', 'slacks');
check([0.6416, 0.68, 0.9616].every((v, i) => near(softFit.alpha[onMargin[i]], v)), 'soft-margin alphas');
check(softFit.margin.filter((m) => m < 0).length === 1, 'number of training errors');

/** The part of the box [X0, X1] × [Y0, Y1] where lo ≤ ⟨n, x⟩ ≤ hi (Sutherland–Hodgman clipping of the box). */
export function band(n: P2, lo: number, hi: number, X: P2, Y: P2): P2[] {
  let poly: P2[] = [[X[0], Y[0]], [X[1], Y[0]], [X[1], Y[1]], [X[0], Y[1]]];
  const cut = (keep: (p: P2) => number) => {
    const out: P2[] = [];
    poly.forEach((p, i) => {
      const q = poly[(i + 1) % poly.length], a = keep(p), c = keep(q);
      if (a >= 0) out.push(p);
      if (a * c < 0) { const t = a / (a - c); out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]); }
    });
    poly = out;
  };
  cut((p) => n[0] * p[0] + n[1] * p[1] - lo);
  cut((p) => hi - (n[0] * p[0] + n[1] * p[1]));
  return poly;
}

/** The segment of the line ⟨n, x⟩ = c inside the box. */
export function chord(n: P2, c: number, X: P2, Y: P2): [P2, P2] {
  const pts: P2[] = [];
  for (const x of X) if (Math.abs(n[1]) > 1e-12) { const y = (c - n[0] * x) / n[1]; if (y >= Y[0] - 1e-9 && y <= Y[1] + 1e-9) pts.push([x, y]); }
  for (const y of Y) if (Math.abs(n[0]) > 1e-12) { const x = (c - n[1] * y) / n[0]; if (x >= X[0] - 1e-9 && x <= X[1] + 1e-9) pts.push([x, y]); }
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return [pts[0], pts[pts.length - 1]];
}
