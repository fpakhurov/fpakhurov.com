/** Seeded 2-D data and the anomaly scores of the anomaly-detection figures: Gaussian, kNN distance, LOF, isolation forest. */
import { mulberry32, normal } from '../random';

export type P = [number, number];

/**
 * A dense cluster (120 points, sd 0.25 around (0, 0)), a sparse cluster (100 points, sd 1 around (4, 2.5)) and
 * eight planted anomalies: two local ones next to the dense cluster and six far from everything. Labels: 1 = anomaly.
 */
export function planted(seed: number) {
  const z = normal(mulberry32(seed));
  const pts: P[] = [], lab: number[] = [];
  for (let i = 0; i < 120; i++) { pts.push([0.25 * z(), 0.25 * z()]); lab.push(0); }
  for (let i = 0; i < 100; i++) { pts.push([4 + z(), 2.5 + z()]); lab.push(0); }
  const out: P[] = [[1.1, 0.2], [-0.8, -0.8], [-3, 3], [2, -2.5], [7.8, 0], [-2.8, -2], [6.5, 6.4], [1.2, 5]];
  out.forEach((p) => { pts.push(p); lab.push(1); });
  return { pts, lab };
}

const dist = (a: P, b: P) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Squared Mahalanobis distance to a single Gaussian fitted by maximum likelihood (higher = more anomalous). */
export function gaussScore(pts: P[]) {
  const n = pts.length, m = [0, 1].map((j) => pts.reduce((s, p) => s + p[j], 0) / n);
  let a = 0, b = 0, c = 0;
  pts.forEach((p) => { const dx = p[0] - m[0], dy = p[1] - m[1]; a += dx * dx / n; b += dx * dy / n; c += dy * dy / n; });
  const det = a * c - b * b;
  return pts.map((p) => { const dx = p[0] - m[0], dy = p[1] - m[1]; return (c * dx * dx - 2 * b * dx * dy + a * dy * dy) / det; });
}

/** Sorted neighbour lists (excluding the point itself) for every point. */
function neighbours(pts: P[], k: number) {
  return pts.map((p, i) => pts.map((q, j) => ({ j, d: dist(p, q) })).filter((e) => e.j !== i).sort((u, v) => u.d - v.d).slice(0, k));
}

/** Distance to the k-th nearest neighbour. */
export function knnScore(pts: P[], k: number) {
  return neighbours(pts, k).map((nb) => nb[k - 1].d);
}

/** Local outlier factor with k neighbours (Breunig et al., 2000). */
export function lofScore(pts: P[], k: number) {
  const nb = neighbours(pts, k);
  const kdist = nb.map((l) => l[k - 1].d);
  const lrd = nb.map((l) => 1 / (l.reduce((s, e) => s + Math.max(kdist[e.j], e.d), 0) / k));
  return nb.map((l, i) => l.reduce((s, e) => s + lrd[e.j], 0) / k / lrd[i]);
}

/** c(n) = 2H(n − 1) − 2(n − 1)/n with the exact harmonic number: the normalizer of the isolation-forest score. */
export function cExact(n: number) {
  if (n <= 1) return 0;
  let H = 0;
  for (let i = 1; i < n; i++) H += 1 / i;
  return 2 * H - (2 * (n - 1)) / n;
}

interface Node { size: number; q?: number; p?: number; l?: Node; r?: Node }

/** One isolation tree on the given points: random attribute, random split between its min and max, height limit. */
function iTree(pts: P[], idx: number[], e: number, limit: number, u: () => number): Node {
  if (e >= limit || idx.length <= 1) return { size: idx.length };
  const q = u() < 0.5 ? 0 : 1;
  const vals = idx.map((i) => pts[i][q]), lo = Math.min(...vals), hi = Math.max(...vals);
  if (hi === lo) return { size: idx.length };
  const p = lo + u() * (hi - lo);
  return { size: idx.length, q, p, l: iTree(pts, idx.filter((i) => pts[i][q] < p), e + 1, limit, u), r: iTree(pts, idx.filter((i) => pts[i][q] >= p), e + 1, limit, u) };
}

function pathLength(x: P, t: Node, e = 0): number {
  if (t.q === undefined) return e + cExact(t.size);
  return pathLength(x, x[t.q] < t.p! ? t.l! : t.r!, e + 1);
}

/** Isolation forest: `trees` trees on subsamples of size psi (without replacement); returns E h(x) and s(x, psi). */
export function iForest(pts: P[], trees: number, psi: number, seed: number, at: P[] = pts) {
  const u = mulberry32(seed), limit = Math.ceil(Math.log2(psi));
  const forest = Array.from({ length: trees }, () => {
    const idx = pts.map((_, i) => i);
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(u() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    return iTree(pts, idx.slice(0, psi), 0, limit, u);
  });
  const Eh = at.map((x) => forest.reduce((s, t) => s + pathLength(x, t), 0) / trees);
  return { Eh, s: Eh.map((h) => Math.pow(2, -h / cExact(psi))) };
}

/** The cuts a fully grown isolation tree on `pts` makes along the path of point `target`, with the box each cut splits. */
export function isolationPath(pts: P[], target: number, seed: number, box: [number, number, number, number]) {
  const u = mulberry32(seed);
  let idx = pts.map((_, i) => i), b = [...box] as [number, number, number, number];
  const cuts: { q: number; p: number; box: [number, number, number, number]; left: number }[] = [];
  while (idx.length > 1) {
    const q = u() < 0.5 ? 0 : 1;
    const vals = idx.map((i) => pts[i][q]), lo = Math.min(...vals), hi = Math.max(...vals);
    if (hi === lo) break;
    const p = lo + u() * (hi - lo);
    const goLeft = pts[target][q] < p;
    idx = idx.filter((i) => (pts[i][q] < p) === goLeft);
    cuts.push({ q, p, box: [...b] as [number, number, number, number], left: idx.length });
    if (q === 0) { if (goLeft) b[1] = p; else b[0] = p; } else { if (goLeft) b[3] = p; else b[2] = p; }
  }
  return cuts;
}

/** Average precision of a score against binary labels (higher score = predicted anomaly). */
export function averagePrecision(score: number[], lab: number[]) {
  const order = score.map((s, i) => i).sort((a, b) => score[b] - score[a]);
  let tp = 0, ap = 0;
  const pos = lab.reduce((s, v) => s + v, 0);
  order.forEach((i, r) => { if (lab[i]) { tp++; ap += tp / (r + 1); } });
  return ap / pos;
}
