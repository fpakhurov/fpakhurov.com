/**
 * The 4 × 3 gridworld of the note: cells (column, row) from (1, 1) at the bottom left, a wall at (2, 2), the goal (4, 3)
 * with reward +1 on entering, the pit (4, 2) with reward −1 on entering, −0.04 for every other step. An action moves in
 * its direction with probability 0.8 and to either side with probability 0.1; bumping into the wall or the edge stays put.
 * Goal and pit are absorbing with reward 0. The same model as the Code section of the note.
 */
export const CELLS: [number, number][] = [];
for (const y of [1, 2, 3]) for (const x of [1, 2, 3, 4]) if (!(x === 2 && y === 2)) CELLS.push([x, y]);
export const GOAL: [number, number] = [4, 3], PIT: [number, number] = [4, 2];
export const ACTS = ['N', 'E', 'S', 'W'] as const;
const DIR: Record<string, [number, number]> = { N: [0, 1], E: [1, 0], S: [0, -1], W: [-1, 0] };
const SIDE: Record<string, string> = { N: 'EW', S: 'EW', E: 'NS', W: 'NS' };
export const ix = (c: [number, number]) => CELLS.findIndex((d) => d[0] === c[0] && d[1] === c[1]);
const same = (a: [number, number], b: [number, number]) => a[0] === b[0] && a[1] === b[1];
export const isTerminal = (c: [number, number]) => same(c, GOAL) || same(c, PIT);
export function move(c: [number, number], a: string): [number, number] {
  const n: [number, number] = [c[0] + DIR[a][0], c[1] + DIR[a][1]];
  return ix(n) >= 0 ? n : c;
}
/** Outcomes of action a in cell c: [next cell, probability, reward]. */
export function outcomes(c: [number, number], a: string): [[number, number], number, number][] {
  if (isTerminal(c)) return [[c, 1, 0]];
  return ([[a, 0.8], [SIDE[a][0], 0.1], [SIDE[a][1], 0.1]] as [string, number][]).map(([b, p]) => {
    const n = move(c, b);
    return [n, p, same(n, GOAL) ? 1 : same(n, PIT) ? -1 : -0.04];
  });
}
export function q(V: number[], c: [number, number], a: string, gamma: number) {
  return outcomes(c, a).reduce((s, [n, p, r]) => s + p * (r + gamma * V[ix(n)]), 0);
}
/** Value iteration from V = 0; returns every sweep, V_0 included. */
export function valueIteration(gamma: number, sweeps: number): number[][] {
  let V = CELLS.map(() => 0);
  const hist = [V];
  for (let k = 0; k < sweeps; k++) {
    V = CELLS.map((c) => Math.max(...ACTS.map((a) => q(V, c, a, gamma))));
    hist.push(V);
  }
  return hist;
}
