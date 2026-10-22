/**
 * Bayesian PCA for the figures of the note: a seeded sample from a probabilistic PCA model with three latent
 * dimensions in ten observed ones, its maximum likelihood fit with nine columns, and EM for the MAP loadings
 * with one ARD precision per column, re-estimated as α_j = d / ‖w_j‖². Self-contained (no imports).
 */

type M = number[][];

/** Seeded standard normals: mulberry32 uniforms and the Box–Muller cosine branch. */
function normals(seed: number) {
  let s = seed >>> 0;
  const u = () => {
    s = (s + 0x6d2b79f5) | 0;
    let a = s;
    a = Math.imul(a ^ (a >>> 15), 1 | a);
    a = (a + Math.imul(a ^ (a >>> 7), 61 | a)) ^ a;
    return ((a ^ (a >>> 14)) >>> 0) / 4294967296;
  };
  return () => Math.sqrt(-2 * Math.log(1 - u())) * Math.cos(2 * Math.PI * u());
}

const zeros = (r: number, c: number): M => Array.from({ length: r }, () => new Array(c).fill(0));
const T = (A: M): M => A[0].map((_, j) => A.map((row) => row[j]));
const mul = (A: M, B: M): M => A.map((row) => B[0].map((_, j) => row.reduce((s, v, k) => s + v * B[k][j], 0)));

/** Inverse of a symmetric positive definite matrix by Gauss–Jordan elimination with partial pivoting. */
function inv(A: M): M {
  const n = A.length, a = A.map((r, i) => [...r, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(a[r][c]) > Math.abs(a[p][c])) p = r;
    [a[c], a[p]] = [a[p], a[c]];
    const d = a[c][c];
    for (let j = 0; j < 2 * n; j++) a[c][j] /= d;
    for (let r = 0; r < n; r++) if (r !== c) { const f = a[r][c]; if (f) for (let j = 0; j < 2 * n; j++) a[r][j] -= f * a[c][j]; }
  }
  return a.map((r) => r.slice(n));
}

/** Eigenvalues of a symmetric matrix by cyclic Jacobi rotations, in decreasing order. */
function eigvals(S: M): number[] {
  const n = S.length, a = S.map((r) => [...r]);
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += a[p][q] ** 2;
    if (off < 1e-22) break;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
      if (Math.abs(a[p][q]) < 1e-300) continue;
      const th = (a[q][q] - a[p][p]) / (2 * a[p][q]);
      const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < n; k++) { const x = a[k][p], y = a[k][q]; a[k][p] = c * x - s * y; a[k][q] = s * x + c * y; }
      for (let k = 0; k < n; k++) { const x = a[p][k], y = a[q][k]; a[p][k] = c * x - s * y; a[q][k] = s * x + c * y; }
    }
  }
  return a.map((r, i) => r[i]).sort((x, y) => y - x);
}

// The sample: N = 100 points, x = W z + ε with three latent dimensions (column scales 3, 2, 1) and unit noise.
export const d = 10, kTrue = 3, n = 100, q = d - 1;
const z = normals(11);
const Wtrue = Array.from({ length: d }, () => [3, 2, 1].map((sc) => sc * z()));
const X0 = Array.from({ length: n }, () => {
  const lat = [z(), z(), z()];
  return Wtrue.map((row) => row.reduce((s, w, k) => s + w * lat[k], 0) + z());
});
const mean = X0[0].map((_, j) => X0.reduce((s, r) => s + r[j], 0) / n);
/** The centred data matrix, n × d. */
export const X = X0.map((r) => r.map((v, j) => v - mean[j]));
const Sx = mul(T(X), X).map((r) => r.map((v) => v / n));

/** Eigenvalues of the sample covariance (1/n), decreasing. */
export const lam = eigvals(Sx);
/** Maximum likelihood PPCA with q columns: noise variance = mean of the discarded eigenvalues, column norms √(λ_j − σ²). */
export const ml = (() => {
  const s2 = lam.slice(q).reduce((s, v) => s + v, 0) / (d - q);
  return { s2, norms: lam.slice(0, q).map((l) => Math.sqrt(Math.max(l - s2, 0))) };
})();

/**
 * EM for Bayesian PCA. E-step: M = WᵀW + σ²I, E[z_i] = M⁻¹Wᵀx_i, Σ_i E[z_i z_iᵀ] = nσ²M⁻¹ + Σ_i E[z_i]E[z_i]ᵀ.
 * M-step: W = (Σ_i x_i E[z_i]ᵀ)(Σ_i E[z_i z_iᵀ] + σ²A)⁻¹ with A = diag(α), then σ², then α_j = d / ‖w_j‖².
 * A column whose α_j exceeds 1e8 is removed (its loading is set to zero). Records the column norms after every iteration.
 */
export function bpca(iters: number, seed = 5) {
  const g = normals(seed);
  let W: M = Array.from({ length: d }, () => Array.from({ length: q }, () => g()));
  let s2 = 1, alpha = new Array(q).fill(1), active = Array.from({ length: q }, (_, j) => j);
  const norms: number[][] = [];
  const colNorm = (j: number) => Math.sqrt(W.reduce((s, r) => s + r[j] ** 2, 0));
  norms.push(Array.from({ length: q }, (_, j) => colNorm(j)));
  for (let it = 0; it < iters; it++) {
    const Wa = W.map((r) => active.map((j) => r[j])), m = active.length;
    const Mi = inv(mul(T(Wa), Wa).map((r, i) => r.map((v, j) => v + (i === j ? s2 : 0))));
    const Ez = mul(mul(X, Wa), Mi);
    const Szz = mul(T(Ez), Ez).map((r, i) => r.map((v, j) => v + n * s2 * Mi[i][j]));
    const Wn = mul(mul(T(X), Ez), inv(Szz.map((r, i) => r.map((v, j) => v + (i === j ? s2 * alpha[active[i]] : 0)))));
    const WtW = mul(T(Wn), Wn), XW = mul(X, Wn);
    let tr = 0, cross = 0, sq = 0;
    for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) tr += Szz[i][j] * WtW[j][i];
    for (let r = 0; r < n; r++) for (let k = 0; k < m; k++) cross += Ez[r][k] * XW[r][k];
    for (const r of X) for (const v of r) sq += v * v;
    s2 = (sq - 2 * cross + tr) / (n * d);
    W = zeros(d, q);
    Wn.forEach((r, i) => r.forEach((v, k) => { W[i][active[k]] = v; }));
    for (const j of active) alpha[j] = d / Math.max(colNorm(j) ** 2, 1e-300);
    active = active.filter((j) => alpha[j] < 1e8);
    for (let j = 0; j < q; j++) if (!active.includes(j)) { alpha[j] = Infinity; W.forEach((r) => { r[j] = 0; }); }
    norms.push(Array.from({ length: q }, (_, j) => colNorm(j)));
  }
  return { W, s2, alpha, active, norms };
}
