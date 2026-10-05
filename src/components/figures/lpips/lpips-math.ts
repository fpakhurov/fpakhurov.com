/**
 * Computed toy data for the LPIPS figures.
 */

const f2 = (v: number) => v.toFixed(2);

/** Filled arrowhead with its tip at (x2, y2), pointing away from (x1, y1). */
export function arrowHead(x1: number, y1: number, x2: number, y2: number, size = 7): string {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const ux = (x2 - x1) / len;
  const uy = (y2 - y1) / len;
  const bx = x2 - ux * size;
  const by = y2 - uy * size;
  const nx = -uy * size * 0.45;
  const ny = ux * size * 0.45;
  return `M ${f2(x2)} ${f2(y2)} L ${f2(bx + nx)} ${f2(by + ny)} L ${f2(x2 - ux * size * 0.72)} ${f2(y2 - uy * size * 0.72)} L ${f2(bx - nx)} ${f2(by - ny)} Z`;
}

// ---------------------------------------------------------------------------
// Shift vs blur: an 8 × 8 image of vertical stripes (period 4), a copy shifted
// right by one pixel (wrapping around) and a copy blurred with the kernel [1 2 1] / 4.

export const N = 8;
const stripe = (j: number) => (j % 4 < 2 ? 0 : 1);
const wrap = (j: number) => (j + N) % N;

export const original: number[][] = Array.from({ length: N }, () => Array.from({ length: N }, (_, j) => stripe(j)));
export const shifted: number[][] = original.map((row) => row.map((_, j) => row[wrap(j - 1)]));
export const blurred: number[][] = original.map((row) =>
  row.map((_, j) => (row[wrap(j - 1)] + 2 * row[j] + row[wrap(j + 1)]) / 4),
);

export const sqErr = (a: number[][], b: number[][]) => a.map((row, i) => row.map((v, j) => (v - b[i][j]) ** 2));
export const mse = (a: number[][], b: number[][]) => {
  const e = sqErr(a, b).flat();
  return e.reduce((s, v) => s + v, 0) / e.length;
};

export const errShift = sqErr(original, shifted);
export const errBlur = sqErr(original, blurred);
export const mseShift = mse(original, shifted); // 0.5
export const mseBlur = mse(original, blurred); // 0.0625

// ---------------------------------------------------------------------------
// One LPIPS layer with C = 2 channels on a 3 × 3 grid, so every feature vector is an arrow.
// Angles in degrees, magnitudes arbitrary: normalisation removes the magnitudes.
// All angles stay in [0°, 90°]: real LPIPS features are post-ReLU, so both channels are non-negative.

const angX = [
  [20, 35, 50],
  [10, 30, 60],
  [0, 25, 0],
];
const magX = [
  [1.0, 2.0, 0.6],
  [1.5, 0.8, 2.2],
  [0.9, 1.7, 1.2],
];
const turn = [
  [5, -10, 0],
  [15, 40, 5],
  [0, -5, 90],
];
const magY = [
  [1.6, 0.7, 1.0],
  [0.9, 1.9, 0.5],
  [2.0, 1.1, 0.8],
];

export const weights: [number, number] = [1.0, 0.6];

type V2 = [number, number];
const polar = (deg: number, r: number): V2 => [r * Math.cos((deg * Math.PI) / 180), r * Math.sin((deg * Math.PI) / 180)];

export interface Cell {
  fx: V2; // φ_l(x)_{hw}
  fy: V2; // φ_l(x')_{hw}
  nx: V2; // unit-normalised
  ny: V2;
  wd: V2; // w ⊙ (nx − ny)
  sq: number; // ‖w ⊙ (nx − ny)‖²
}

export const cells: Cell[][] = angX.map((row, h) =>
  row.map((a, w) => {
    const fx = polar(a, magX[h][w]);
    const fy = polar(a + turn[h][w], magY[h][w]);
    const nx = polar(a, 1);
    const ny = polar(a + turn[h][w], 1);
    const wd: V2 = [weights[0] * (nx[0] - ny[0]), weights[1] * (nx[1] - ny[1])];
    return { fx, fy, nx, ny, wd, sq: wd[0] ** 2 + wd[1] ** 2 };
  }),
);

export const dLayer = cells.flat().reduce((s, c) => s + c.sq, 0) / 9;
export const maxSq = Math.max(...cells.flat().map((c) => c.sq));
