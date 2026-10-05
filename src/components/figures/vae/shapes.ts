/**
 * Shape helpers for the VAE figures: smooth closed blobs and hand-drawn-looking strokes.
 * All coordinates are in viewBox units.
 */
import type { Point } from '../geometry';

const f = (v: number) => Number(v.toFixed(2));

/** Smooth path through the points (uniform Catmull–Rom converted to cubic Béziers). */
export function smooth(points: readonly Point[], closed = false): string {
  const n = points.length;
  const at = (i: number): Point =>
    closed ? points[(i + n) % n] : points[Math.max(0, Math.min(n - 1, i))];
  const segments = closed ? n : n - 1;
  let d = `M ${f(points[0][0])} ${f(points[0][1])}`;
  for (let i = 0; i < segments; i += 1) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1: Point = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Point = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return closed ? `${d} Z` : d;
}

/**
 * Irregular closed blob: radius r * (1 + sum of amp * cos(k * t + phase)), sampled at n angles.
 * `sx`/`sy` stretch the blob horizontally/vertically.
 */
export function blob(
  cx: number,
  cy: number,
  r: number,
  harmonics: readonly [number, number, number][],
  n = 28,
  sx = 1,
  sy = 1,
): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < n; i += 1) {
    const t = (2 * Math.PI * i) / n;
    const rr = r * (1 + harmonics.reduce((s, [k, a, ph]) => s + a * Math.cos(k * t + ph), 0));
    pts.push([cx + sx * rr * Math.cos(t), cy + sy * rr * Math.sin(t)]);
  }
  return pts;
}

/** Point of a quadratic Bézier at parameter t. */
export function quadAt(p0: Point, c: Point, p1: Point, t: number): Point {
  const u = 1 - t;
  return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
}

/** Closed form KL( N(mu, sigma^2) || N(0, 1) ) for one latent dimension. */
export const klStd = (mu: number, sigma: number) => 0.5 * (mu * mu + sigma * sigma - 1 - Math.log(sigma * sigma));

/**
 * Filled arrowhead path (same proportions as the shared f-arrow marker) with its tip at
 * (tx, ty), pointing away from (fx, fy). Used for amber arrows, which have no shared marker.
 */
export const arrowHead = (tx: number, ty: number, fx: number, fy: number): string => {
  const l = Math.hypot(tx - fx, ty - fy);
  const ux = (tx - fx) / l;
  const uy = (ty - fy) / l;
  const [len, half, notch] = [8.5, 3.8, 6.2];
  const pt = (a: number, b: number) => `${(tx - a * ux - b * uy).toFixed(1)} ${(ty - a * uy + b * ux).toFixed(1)}`;
  return `M ${pt(0, 0)} L ${pt(len, half)} L ${pt(notch, 0)} L ${pt(len, -half)} Z`;
};
