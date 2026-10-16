/**
 * The running example of the learning-to-rank note: one query, six documents in the order the model ranks them,
 * graded labels 0–4, gain 2^y − 1 and discount 1 / log2(1 + position).
 */

/** Labels of the six documents, listed in the order of the current scores. */
export const labels = [0, 3, 1, 0, 2, 0];
/** Current scores, decreasing, so the list above is the model's ranking. */
export const scores = [2.5, 2.0, 1.5, 1.0, 0.5, 0.0];

const gain = (y: number) => 2 ** y - 1;
const disc = (pos: number) => 1 / Math.log2(1 + pos);

/** DCG of labels listed in ranked order, truncated at k. */
export const dcg = (ranked: number[], k = ranked.length) =>
  ranked.slice(0, k).reduce((s, y, j) => s + gain(y) * disc(j + 1), 0);

/** NDCG of a list of labels under given scores (higher score first; ties keep the list order). */
export function ndcg(lab: number[], s: number[], k = lab.length): number {
  const order = lab.map((_, i) => i).sort((a, b) => s[b] - s[a] || a - b);
  const ideal = dcg([...lab].sort((a, b) => b - a), k);
  return dcg(order.map((i) => lab[i]), k) / ideal;
}

/** Total RankNet loss of the query: sum over pairs with y_i > y_j of log(1 + exp(−(s_i − s_j))). */
export function ranknetLoss(lab: number[], s: number[]): number {
  let c = 0;
  lab.forEach((yi, i) => lab.forEach((yj, j) => { if (yi > yj) c += Math.log1p(Math.exp(-(s[i] - s[j]))); }));
  return c;
}

/**
 * Per-document forces: RankNet λ_i (sum of sigmoid(s_j − s_i) over pairs it should win, minus over pairs it
 * should lose) and LambdaRank λ_i (each pair weighted by |ΔNDCG| of swapping the two documents). Positive = push up.
 */
export function lambdas(lab: number[], s: number[]) {
  const n = lab.length;
  const order = lab.map((_, i) => i).sort((a, b) => s[b] - s[a] || a - b);
  const pos = new Array(n).fill(0);
  order.forEach((i, p) => { pos[i] = p + 1; });
  const ideal = dcg([...lab].sort((a, b) => b - a));
  const rank = new Array(n).fill(0), lam = new Array(n).fill(0);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    if (lab[i] <= lab[j]) continue;
    const rho = 1 / (1 + Math.exp(s[i] - s[j]));
    const dn = Math.abs((gain(lab[i]) - gain(lab[j])) * (disc(pos[i]) - disc(pos[j]))) / ideal;
    rank[i] += rho; rank[j] -= rho; lam[i] += rho * dn; lam[j] -= rho * dn;
  }
  return { rank, lam };
}
