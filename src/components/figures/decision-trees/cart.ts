/**
 * A small CART for the figures of the trees-and-ensembles notes (decision trees, bias–variance, bagging, boosting).
 * Greedy binary splits x_j ≤ t with t halfway between consecutive distinct values, chosen to minimize the weighted
 * squared error of the two children. For a 0/1 label that criterion is the Gini index (Gini = 2 p (1 − p), twice the
 * variance of the label), so the same code grows regression trees and two-class classification trees.
 */

export interface TreeOptions {
  /** Maximal depth; the root has depth 0. */
  maxDepth?: number;
  /** Minimal number of training points in a leaf. */
  minLeaf?: number;
  /** Number of features tried at each split (random forests); all features by default. */
  mtry?: number;
  /** Uniform random numbers in [0, 1), needed when mtry is smaller than the number of features. */
  rand?: () => number;
}

export interface TreeNode {
  /** Number of training points in the node. */
  n: number;
  /** Mean of the targets: the prediction for regression, the share of class 1 for a 0/1 label. */
  value: number;
  /** Sum of squared deviations of the targets from their mean. */
  sse: number;
  depth: number;
  feature?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
}

const mean = (v: number[]) => v.reduce((s, a) => s + a, 0) / v.length;

/** Grows a tree on the rows `idx` of X (all rows by default). */
export function growTree(X: number[][], y: number[], opts: TreeOptions = {}, idx?: number[]): TreeNode {
  const { maxDepth = Infinity, minLeaf = 1, rand } = opts;
  const d = X[0].length;
  const mtry = Math.min(opts.mtry ?? d, d);
  const rows = idx ?? X.map((_, i) => i);
  const build = (rs: number[], depth: number): TreeNode => {
    const ys = rs.map((i) => y[i]);
    const value = mean(ys);
    const sse = ys.reduce((s, a) => s + (a - value) ** 2, 0);
    const node: TreeNode = { n: rs.length, value, sse, depth };
    if (depth >= maxDepth || rs.length < 2 * minLeaf || sse <= 1e-12) return node;
    let features = Array.from({ length: d }, (_, j) => j);
    if (mtry < d) {
      if (!rand) throw new Error('cart: mtry < d needs a random source');
      for (let k = 0; k < mtry; k++) {
        const r = k + Math.floor(rand() * (d - k));
        [features[k], features[r]] = [features[r], features[k]];
      }
      features = features.slice(0, mtry);
    }
    let best = { cost: sse - 1e-12, feature: -1, threshold: 0 };
    const total = ys.reduce((s, a) => s + a, 0);
    const total2 = ys.reduce((s, a) => s + a * a, 0);
    for (const j of features) {
      const order = [...rs].sort((a, b) => X[a][j] - X[b][j]);
      let sl = 0, sl2 = 0;
      for (let k = 0; k < order.length - 1; k++) {
        const yi = y[order[k]];
        sl += yi; sl2 += yi * yi;
        const nl = k + 1, nr = order.length - nl;
        if (nl < minLeaf || nr < minLeaf) continue;
        const a = X[order[k]][j], b = X[order[k + 1]][j];
        if (b <= a) continue;
        const sr = total - sl, sr2 = total2 - sl2;
        const cost = sl2 - (sl * sl) / nl + (sr2 - (sr * sr) / nr);
        if (cost < best.cost) best = { cost, feature: j, threshold: (a + b) / 2 };
      }
    }
    if (best.feature < 0) return node;
    const L = rs.filter((i) => X[i][best.feature] <= best.threshold);
    const R = rs.filter((i) => X[i][best.feature] > best.threshold);
    node.feature = best.feature;
    node.threshold = best.threshold;
    node.left = build(L, depth + 1);
    node.right = build(R, depth + 1);
    return node;
  };
  return build(rows, 0);
}

export function predict(node: TreeNode, x: number[]): number {
  let v = node;
  while (v.left && v.right) v = x[v.feature!] <= v.threshold! ? v.left : v.right;
  return v.value;
}

export function leaves(node: TreeNode): TreeNode[] {
  return node.left && node.right ? [...leaves(node.left), ...leaves(node.right)] : [node];
}

/** A tree on one feature as a step function: [from, to, value] on [x0, x1]. */
export function steps1D(node: TreeNode, x0: number, x1: number): [number, number, number][] {
  if (!(node.left && node.right)) return [[x0, x1, node.value]];
  const t = node.threshold!;
  return [...steps1D(node.left, x0, Math.min(t, x1)), ...steps1D(node.right, Math.max(t, x0), x1)].filter(([a, b]) => b > a);
}

/** Draws n bootstrap indices out of 0..n−1. */
export const bootstrap = (n: number, rand: () => number) => Array.from({ length: n }, () => Math.floor(rand() * n));
