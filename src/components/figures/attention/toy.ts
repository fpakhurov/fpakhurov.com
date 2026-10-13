/**
 * The toy example of the self-attention note: three tokens "dogs chase cats",
 * d = 4, d_k = d_v = 2. Every figure recomputes its numbers from these matrices,
 * so figures, captions and text agree.
 */

export type Matrix = number[][];

export const tokens = ['dogs', 'chase', 'cats'];

export const X: Matrix = [
  [1, 0, 1, 0],
  [0, 1, 0, 1],
  [1, 0, 0, 1],
];
export const WQ: Matrix = [[1, 0], [0, 1], [1, 0], [0, 0]];
export const WK: Matrix = [[0, 1], [1, 0], [0, 0], [1, 1]];
export const WV: Matrix = [[1, 0], [0, 2], [1, 1], [0, 1]];
export const dk = 2;

export const matmul = (A: Matrix, B: Matrix): Matrix =>
  A.map((row) => B[0].map((_, c) => row.reduce((acc, a, k) => acc + a * B[k][c], 0)));
export const transpose = (A: Matrix): Matrix => A[0].map((_, c) => A.map((row) => row[c]));

/** Row-wise softmax; entries where `masked(i, j)` is true get weight exactly 0. */
export function softmaxRows(S: Matrix, masked?: (i: number, j: number) => boolean): Matrix {
  return S.map((row, i) => {
    const allowed = row.map((_, j) => !(masked && masked(i, j)));
    const m = Math.max(...row.filter((_, j) => allowed[j]));
    const e = row.map((v, j) => (allowed[j] ? Math.exp(v - m) : 0));
    const z = e.reduce((a, b) => a + b, 0);
    return e.map((v) => v / z);
  });
}

export interface AttentionResult { Q: Matrix; K: Matrix; V: Matrix; S: Matrix; scaled: Matrix; A: Matrix; Y: Matrix }

/** Scaled dot-product self-attention of the rows of `input` with the toy projections. */
export function attention(
  input: Matrix,
  opts: { masked?: (i: number, j: number) => boolean; scale?: boolean } = {},
): AttentionResult {
  const Q = matmul(input, WQ);
  const K = matmul(input, WK);
  const V = matmul(input, WV);
  const S = matmul(Q, transpose(K));
  const c = opts.scale === false ? 1 : Math.sqrt(dk);
  const scaled = S.map((r) => r.map((v) => v / c));
  const A = softmaxRows(scaled, opts.masked);
  return { Q, K, V, S, scaled, A, Y: matmul(A, V) };
}

/** Attention without projections: softmax(X Xᵀ / √d) with d = 4. */
export function rawAttention(input: Matrix): Matrix {
  const G = matmul(input, transpose(input));
  const c = Math.sqrt(input[0].length);
  return softmaxRows(G.map((r) => r.map((v) => v / c)));
}

/** Two decimals without a leading zero for compact cells: 0.768 → .77; 1 → 1; 0 → 0. */
export const short = (v: number, digits = 2) => {
  if (Math.abs(v) < 5e-4) return '0';
  const s = v.toFixed(digits);
  if (Number(s) === Math.round(v) && Math.abs(v - Math.round(v)) < 5e-4) return String(Math.round(v));
  return s.replace(/^0\./, '.').replace(/^-0\./, '−.').replace(/^-/, '−');
};
/** Three decimals, as in the text. */
export const f3 = (v: number) => (Math.abs(v) < 5e-4 ? '0' : v.toFixed(3).replace(/^-/, '−'));
