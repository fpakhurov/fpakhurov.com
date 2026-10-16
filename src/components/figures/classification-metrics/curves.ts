/**
 * The ROC and precision–recall figure of the classification metrics note. Two classifiers score the same kind of
 * test set, 150 positives and 2,850 negatives (5% positive), with seeded simulated scores: negatives N(0, 1) for
 * both; positives N(1.5, 1) for classifier A and N(1.5, 2²) for classifier B. A ranks better on average (higher
 * ROC AUC), B puts more positives at the very top (higher average precision). Quoted numbers are asserted.
 */
import { mulberry32, normal } from '../random';
import { Phi } from '../normal';

export const nPos = 150, nNeg = 2850;
export type Scored = { s: number; y: 0 | 1 };

function sample(seed: number, mu: number, sd: number): Scored[] {
  const z = normal(mulberry32(seed));
  const pos = Array.from({ length: nPos }, () => ({ s: mu + sd * z(), y: 1 as const }));
  const neg = Array.from({ length: nNeg }, () => ({ s: z(), y: 0 as const }));
  return [...pos, ...neg];
}

/** ROC corners, PR points at each positive, AUC by counting pairs, average precision. Scores are continuous, so ties have probability 0. */
export function curves(data: Scored[]) {
  const sorted = [...data].sort((a, b) => b.s - a.s);
  const roc: [number, number][] = [[0, 0]];
  const pr: [number, number][] = [];
  let tp = 0, fp = 0, ap = 0, pairs = 0;
  for (const d of sorted) {
    if (d.y === 1) { tp += 1; ap += tp / (tp + fp); pr.push([tp / nPos, tp / (tp + fp)]); }
    else { fp += 1; pairs += tp; } // every positive already passed outranks this negative
    roc.push([fp / nNeg, tp / nPos]);
  }
  // keep only the corners of the ROC staircase
  const corners = roc.filter((p, i) => i === 0 || i === roc.length - 1 || !((roc[i - 1][0] === p[0] && roc[i + 1][0] === p[0]) || (roc[i - 1][1] === p[1] && roc[i + 1][1] === p[1])));
  return { roc: corners, pr, auc: pairs / (nPos * nNeg), ap: ap / nPos };
}

export const A = curves(sample(34, 1.5, 1));
export const B = curves(sample(60, 1.5, 2));
/** Population values: AUC = Φ(μ / √(1 + σ²)) for positives N(μ, σ²) against negatives N(0, 1). */
export const aucExactA = Phi(1.5 / Math.SQRT2), aucExactB = Phi(1.5 / Math.sqrt(5));

/** The trapezoid area under the ROC staircase must equal the pair count (the theorem of the note). */
const area = (pts: [number, number][]) => pts.slice(1).reduce((s, p, i) => s + (p[0] - pts[i][0]) * (p[1] + pts[i][1]) / 2, 0);
if (Math.abs(area(A.roc) - A.auc) > 1e-12 || Math.abs(area(B.roc) - B.auc) > 1e-12) throw new Error('curves.ts: ROC area differs from the pair count');
export const quoted = { aucA: A.auc.toFixed(3), apA: A.ap.toFixed(3), aucB: B.auc.toFixed(3), apB: B.ap.toFixed(3), exactA: aucExactA.toFixed(3), exactB: aucExactB.toFixed(3) };
if (Object.values(quoted).join(' ') !== '0.857 0.338 0.748 0.431 0.856 0.749') throw new Error(`curves.ts: quoted values drifted: ${JSON.stringify(quoted)}`);
/** Recall (TPR) at the last ROC corner with FPR ≤ f. */
export const tprAt = (roc: [number, number][], f: number) => roc.filter((p) => p[0] <= f).pop()![1];
export const at1 = { A: Math.round(tprAt(A.roc, 0.01) * 100), B: Math.round(tprAt(B.roc, 0.01) * 100) };
if (at1.A !== 21 || at1.B !== 35) throw new Error(`curves.ts: TPR at FPR 1% drifted: ${JSON.stringify(at1)}`);
