/**
 * The computed examples of the SVD note: a synthetic 64 × 64 grayscale image, its singular value decomposition by
 * one-sided Jacobi rotations, its rank-k approximations, and a small PNG encoder to show them as pictures.
 * The image is defined by a formula, so the Code section of the note rebuilds exactly the same matrix in NumPy.
 */
import { deflateSync } from 'node:zlib';

export type Matrix = number[][];

/**
 * The test image on an n × n grid with x = column/(n − 1) and y = row/(n − 1), both in [0, 1]:
 * a constant, a smooth bump sin(πx) sin(πy), a disc of radius 0.2 around (0.35, 0.6), an axis-aligned rectangle
 * and a thin diagonal stripe |x − y| < 0.05.
 */
export function testImage(n = 64): Matrix {
  return Array.from({ length: n }, (_, i) => {
    const y = i / (n - 1);
    return Array.from({ length: n }, (_, j) => {
      const x = j / (n - 1);
      let f = 0.2 + 0.5 * Math.sin(Math.PI * x) * Math.sin(Math.PI * y);
      if ((x - 0.35) ** 2 + (y - 0.6) ** 2 < 0.2 ** 2) f += 0.6;
      if (x >= 0.6 && x <= 0.9 && y >= 0.15 && y <= 0.4) f += 0.4;
      if (Math.abs(x - y) < 0.05) f += 0.3;
      return f;
    });
  });
}

/**
 * Singular value decomposition A = U diag(s) Vᵀ of an m × n matrix with m ≥ n, by one-sided Jacobi rotations
 * (Hestenes): rotate pairs of columns of A until all are orthogonal; their lengths are then the singular values.
 * Accurate also for the small singular values, unlike the eigenvalues of AᵀA. Returns s in decreasing order.
 */
export function svd(A: Matrix) {
  const m = A.length, n = A[0].length;
  const W = A.map((r) => [...r]);
  const V: Matrix = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < 60; sweep += 1) {
    let rotated = false;
    for (let p = 0; p < n - 1; p += 1) {
      for (let q = p + 1; q < n; q += 1) {
        let a = 0, b = 0, g = 0;
        for (let i = 0; i < m; i += 1) { a += W[i][p] * W[i][p]; b += W[i][q] * W[i][q]; g += W[i][p] * W[i][q]; }
        if (Math.abs(g) <= 1e-15 * Math.sqrt(a * b) || g === 0) continue;
        rotated = true;
        const zeta = (b - a) / (2 * g);
        const t = Math.sign(zeta || 1) / (Math.abs(zeta) + Math.sqrt(1 + zeta * zeta));
        const c = 1 / Math.sqrt(1 + t * t), s = c * t;
        for (let i = 0; i < m; i += 1) { const wp = W[i][p], wq = W[i][q]; W[i][p] = c * wp - s * wq; W[i][q] = s * wp + c * wq; }
        for (let i = 0; i < n; i += 1) { const vp = V[i][p], vq = V[i][q]; V[i][p] = c * vp - s * vq; V[i][q] = s * vp + c * vq; }
      }
    }
    if (!rotated) break;
  }
  const norms = Array.from({ length: n }, (_, j) => Math.sqrt(W.reduce((acc, r) => acc + r[j] * r[j], 0)));
  const order = norms.map((_, j) => j).sort((i, j) => norms[j] - norms[i]);
  const s = order.map((j) => norms[j]);
  const U = order.map((j) => W.map((r) => (norms[j] > 0 ? r[j] / norms[j] : 0))); // U[k] is the k-th left singular vector
  const Vt = order.map((j) => V.map((r) => r[j]));                                 // Vt[k] is the k-th right singular vector
  return { s, U, Vt };
}

/** The rank-k approximation A_k = Σ_{i ≤ k} s_i u_i v_iᵀ. */
export function lowRank(d: ReturnType<typeof svd>, k: number): Matrix {
  const m = d.U[0].length, n = d.Vt[0].length;
  return Array.from({ length: m }, (_, i) => Array.from({ length: n }, (_, j) => {
    let v = 0;
    for (let r = 0; r < k; r += 1) v += d.s[r] * d.U[r][i] * d.Vt[r][j];
    return v;
  }));
}

export const frobenius = (A: Matrix) => Math.sqrt(A.reduce((acc, r) => acc + r.reduce((b, v) => b + v * v, 0), 0));

/** The relative Frobenius error of the rank-k approximation from the singular values: √(Σ_{i>k} s_i²) / √(Σ s_i²). */
export function relativeErrors(s: number[]) {
  const total = s.reduce((a, v) => a + v * v, 0);
  let tail = total;
  return s.map((_, k) => { const e = Math.sqrt(Math.max(tail, 0) / total); tail -= s[k] ** 2; return e; }).concat([0]);
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf: Buffer) => {
  let c = 0xffffffff;
  for (const byte of buf) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type: string, data: Buffer) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};

/** An 8-bit grayscale PNG of a matrix as a data URI; values are mapped linearly from [lo, hi] to [0, 255] and clipped. */
export function pngDataUri(A: Matrix, lo: number, hi: number) {
  const h = A.length, w = A[0].length;
  const raw = Buffer.alloc(h * (w + 1));
  A.forEach((row, i) => {
    raw[i * (w + 1)] = 0; // filter type 0 (none) for every scanline
    row.forEach((v, j) => { raw[i * (w + 1) + 1 + j] = Math.round(255 * Math.min(1, Math.max(0, (v - lo) / (hi - lo)))); });
  });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 0; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0; // bit depth 8, grayscale, deflate, no filter, no interlace
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
  return `data:image/png;base64,${png.toString('base64')}`;
}

/** Everything the two figures of the note need, computed once. */
export function imageExample() {
  const A = testImage(64);
  const d = svd(A);
  const err = relativeErrors(d.s);
  const max = Math.max(...A.flat());
  return { A, d, err, max, norm: frobenius(A) };
}
