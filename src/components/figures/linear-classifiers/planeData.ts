/** Independently specified finite geometry fixture, composed with Codex assistance.
 * No random generator, external observations or source figure coordinates are inputs.
 */
export type Pt = { id: string; x: [number, number]; y: 1 | -1; score: number; margin: number };
export const w: [number, number] = [2, -1];
export const b = -1;
export const norm = Math.hypot(...w);
const score = (x: [number, number]) => w[0] * x[0] + w[1] * x[1] + b;
const inputs: [string, [number, number], 1 | -1][] = [
  ['A', [-1, 1], -1], ['B', [0, 2], -1], ['C', [1, 0], 1],
  ['D', [2, 1], 1], ['E', [3, 1], 1], ['F', [2, 4], 1], ['G', [1, -2], -1],
];
export const points: Pt[] = inputs.map(([id, x, y]) => ({ id, x, y, score: score(x), margin: y * score(x) }));
export const wrong = points.filter((p) => p.margin < 0);
export const example = points[4];
export const exampleDist = example.score / norm;
export const foot: [number, number] = [example.x[0] - example.score * w[0] / 5, example.x[1] - example.score * w[1] / 5];
if (points.map((p) => p.margin).join(',') !== '4,3,1,2,4,-1,-3') throw new Error('planeData: unexpected margins');
if (wrong.map((p) => p.id).join('') !== 'FG') throw new Error('planeData: unexpected errors');
if (Math.abs(score(foot)) > 1e-12 || Math.abs(Math.hypot(example.x[0] - foot[0], example.x[1] - foot[1]) - exampleDist) > 1e-12) throw new Error('planeData: invalid projection');
