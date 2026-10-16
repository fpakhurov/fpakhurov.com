/** Seeded data and the clustering algorithms the clustering figures run at build time. */
import { mulberry32, normal } from '../random';

export type P = [number, number];

/** Gaussian blobs: `n[k]` points around `centers[k]` with standard deviation `sd[k]`; returns points and true labels. */
export function blobs(seed: number, centers: P[], sd: number[], n: number[]) {
  const z = normal(mulberry32(seed));
  const pts: P[] = [], lab: number[] = [];
  centers.forEach((c, k) => {
    for (let i = 0; i < n[k]; i++) { pts.push([c[0] + sd[k] * z(), c[1] + sd[k] * z()]); lab.push(k); }
  });
  return { pts, lab };
}

/** Two interleaving half circles, as scikit-learn's make_moons, with Gaussian noise of standard deviation `noise`. */
export function moons(seed: number, n: number, noise: number) {
  const u = mulberry32(seed), z = normal(u);
  const pts: P[] = [], lab: number[] = [];
  for (let i = 0; i < n; i++) {
    const k = i % 2, t = Math.PI * u();
    const p: P = k === 0 ? [Math.cos(t), Math.sin(t)] : [1 - Math.cos(t), 0.5 - Math.sin(t)];
    pts.push([p[0] + noise * z(), p[1] + noise * z()]); lab.push(k);
  }
  return { pts, lab };
}

const d2 = (a: P, b: P) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;

/** Lloyd's algorithm from given centroids. Each record holds the centroids, the assignment to them and the objective J. */
export function lloyd(pts: P[], init: P[], maxIter = 50) {
  const hist: { mu: P[]; c: number[]; J: number }[] = [];
  let mu = init.map((m) => [...m] as P);
  for (let t = 0; t < maxIter; t++) {
    const c = pts.map((p) => { let b = 0; mu.forEach((m, k) => { if (d2(p, m) < d2(p, mu[b])) b = k; }); return b; });
    const J = pts.reduce((s, p, i) => s + d2(p, mu[c[i]]), 0);
    hist.push({ mu, c, J });
    const next = mu.map((m, k) => {
      const mine = pts.filter((_, i) => c[i] === k);
      return mine.length ? ([mine.reduce((s, p) => s + p[0], 0) / mine.length, mine.reduce((s, p) => s + p[1], 0) / mine.length] as P) : m;
    });
    if (next.every((m, k) => d2(m, mu[k]) === 0)) break;
    mu = next;
  }
  return hist;
}

/** DBSCAN with radius `eps` and `minPts` (the point itself included). Labels: cluster index, or −1 for noise. */
export function dbscan(pts: P[], eps: number, minPts: number) {
  const n = pts.length, e2 = eps * eps;
  const nb = pts.map((p) => pts.map((q, j) => (d2(p, q) <= e2 ? j : -1)).filter((j) => j >= 0));
  const core = nb.map((s) => s.length >= minPts);
  const lab = new Array<number>(n).fill(-1);
  let k = 0;
  for (let i = 0; i < n; i++) {
    if (!core[i] || lab[i] !== -1) continue;
    const stack = [i]; lab[i] = k;
    while (stack.length) {
      const j = stack.pop()!;
      if (!core[j]) continue;
      for (const m of nb[j]) if (lab[m] === -1) { lab[m] = k; stack.push(m); }
    }
    k++;
  }
  return { lab, core, clusters: k };
}

/** Adjusted Rand index of two labelings (noise label −1 counts as one more group). */
export function ari(a: number[], b: number[]) {
  const key = (v: number) => String(v);
  const tab = new Map<string, number>(), ra = new Map<string, number>(), rb = new Map<string, number>();
  a.forEach((x, i) => {
    const t = `${x}|${b[i]}`;
    tab.set(t, (tab.get(t) ?? 0) + 1);
    ra.set(key(x), (ra.get(key(x)) ?? 0) + 1);
    rb.set(key(b[i]), (rb.get(key(b[i])) ?? 0) + 1);
  });
  const c2 = (m: number) => (m * (m - 1)) / 2;
  const sum = (m: Map<string, number>) => [...m.values()].reduce((s, v) => s + c2(v), 0);
  const index = sum(tab), sa = sum(ra), sb = sum(rb), total = c2(a.length);
  const expected = (sa * sb) / total, max = (sa + sb) / 2;
  return (index - expected) / (max - expected);
}

/** The cell of centroid k inside the rectangle [x0, x1] × [y0, y1]: the rectangle clipped by every bisector half-plane. */
export function voronoiCell(mu: P[], k: number, x0: number, x1: number, y0: number, y1: number): P[] {
  let poly: P[] = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  mu.forEach((m, j) => {
    if (j === k) return;
    // keep points with |x − μ_k|² ≤ |x − μ_j|², i.e. a·x ≤ b with a = 2(μ_j − μ_k), b = |μ_j|² − |μ_k|²
    const a: P = [2 * (m[0] - mu[k][0]), 2 * (m[1] - mu[k][1])];
    const b = m[0] ** 2 + m[1] ** 2 - mu[k][0] ** 2 - mu[k][1] ** 2;
    const f = (p: P) => a[0] * p[0] + a[1] * p[1] - b;
    const out: P[] = [];
    poly.forEach((p, i) => {
      const q = poly[(i + 1) % poly.length], fp = f(p), fq = f(q);
      if (fp <= 0) out.push(p);
      if ((fp <= 0) !== (fq <= 0)) { const t = fp / (fp - fq); out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]); }
    });
    poly = out;
  });
  return poly;
}
