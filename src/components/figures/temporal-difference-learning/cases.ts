/** Original finite fixtures specified for this note with Codex assistance.
 * No external observations, notebook outputs or random benchmark are used. */
export function targetMoments(outcomes: readonly (readonly [number, number])[]) {
  const mean = outcomes.reduce((sum, [p, x]) => sum + p * x, 0);
  return { mean, variance: outcomes.reduce((sum, [p, x]) => sum + p * (x - mean) ** 2, 0) };
}
export const prediction = [
  targetMoments([[3 / 8, -1], [3 / 8, 11 / 5], [1 / 8, -1 / 5], [1 / 8, 7 / 5]]),
  targetMoments([[3 / 4, 3 / 5], [1 / 4, 3 / 5]]),
  targetMoments([[3 / 4, 7], [1 / 4, -29 / 5]]),
];

export function transition(s: number, a: number): [number, number] {
  return a === 0 ? [Math.min(2, s + 1), -1 / 5] : [Math.max(0, s - 1), [-6, 2, 5 / 2][s]];
}
export function policyValues(skeleton: readonly number[], epsilon: number) {
  const rows = Array.from({ length: 3 }, (_, s) => Array.from({ length: 4 }, (_, j) => +(s === j)));
  for (let s = 0; s < 3; s += 1) {
    for (let a = 0; a < 2; a += 1) {
      const p = epsilon / 2 + (a === skeleton[s] ? 1 - epsilon : 0);
      const [next, reward] = transition(s, a);
      rows[s][next] -= (4 / 5) * p;
      rows[s][3] += p * reward;
    }
  }
  for (let col = 0; col < 3; col += 1) {
    let pivot = col;
    for (let i = col + 1; i < 3; i += 1) if (Math.abs(rows[i][col]) > Math.abs(rows[pivot][col])) pivot = i;
    [rows[col], rows[pivot]] = [rows[pivot], rows[col]];
    const divisor = rows[col][col];
    rows[col] = rows[col].map(x => x / divisor);
    for (let i = 0; i < 3; i += 1) if (i !== col) {
      const multiplier = rows[i][col];
      rows[i] = rows[i].map((x, j) => x - multiplier * rows[col][j]);
    }
  }
  return rows.map(row => row[3]);
}
export const control = [
  { epsilon: 0, skeleton: [0, 1, 1], values: policyValues([0, 1, 1], 0) },
  { epsilon: 1 / 5, skeleton: [0, 1, 1], values: policyValues([0, 1, 1], 1 / 5) },
  { epsilon: 1 / 5, skeleton: [0, 0, 1], values: policyValues([0, 0, 1], 1 / 5) },
];
