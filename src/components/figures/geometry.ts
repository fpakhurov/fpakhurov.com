/**
 * Small helpers for mathematically generated SVG figures.
 * All coordinates are in the SVG's viewBox units.
 */

export type Point = readonly [number, number];

const fmt = (value: number) => Number(value.toFixed(2));

/** Polyline path through the given points. */
export function polyline(points: readonly Point[]): string {
  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${fmt(x)} ${fmt(y)}`).join(' ');
}

/** Linear map from data space to screen space for a plot area. */
export function scale(domain: readonly [number, number], range: readonly [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  return (value: number) => r0 + ((value - d0) / (d1 - d0)) * (r1 - r0);
}

/**
 * Sample y = f(x) on [x0, x1] and return a screen-space path.
 * `sx` and `sy` map data coordinates to screen coordinates (see `scale`).
 * Non-finite samples break the path instead of drawing a spike.
 */
export function plot(
  f: (x: number) => number,
  x0: number,
  x1: number,
  sx: (x: number) => number,
  sy: (y: number) => number,
  samples = 160,
): string {
  const parts: string[] = [];
  let pen = false;
  for (let i = 0; i <= samples; i += 1) {
    const x = x0 + ((x1 - x0) * i) / samples;
    const y = f(x);
    if (!Number.isFinite(y)) {
      pen = false;
      continue;
    }
    parts.push(`${pen ? 'L' : 'M'} ${fmt(sx(x))} ${fmt(sy(y))}`);
    pen = true;
  }
  return parts.join(' ');
}

/** Closed area between y = f(x) and the baseline y = 0, for shaded densities. */
export function area(
  f: (x: number) => number,
  x0: number,
  x1: number,
  sx: (x: number) => number,
  sy: (y: number) => number,
  samples = 160,
): string {
  return `${plot(f, x0, x1, sx, sy, samples)} L ${fmt(sx(x1))} ${fmt(sy(0))} L ${fmt(sx(x0))} ${fmt(sy(0))} Z`;
}

/**
 * Curved annotation arrow from (x1, y1) to (x2, y2).
 * `bend` is the perpendicular offset of the control point; the sign flips the side.
 */
export function curve(x1: number, y1: number, x2: number, y2: number, bend = 30): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / length) * bend;
  const cy = my + (dx / length) * bend;
  return `M ${fmt(x1)} ${fmt(y1)} Q ${fmt(cx)} ${fmt(cy)} ${fmt(x2)} ${fmt(y2)}`;
}

export const gaussian = (x: number, mu = 0, sigma = 1) =>
  Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));

export const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

/** Deterministic pseudo-random numbers (mulberry32) for reproducible scatter plots. */
export function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal samples from a seeded uniform source (Box–Muller). */
export function normals(count: number, seed = 1): number[] {
  const random = seeded(seed);
  const values: number[] = [];
  while (values.length < count) {
    const u = Math.max(random(), 1e-12);
    const v = random();
    const r = Math.sqrt(-2 * Math.log(u));
    values.push(r * Math.cos(2 * Math.PI * v), r * Math.sin(2 * Math.PI * v));
  }
  return values.slice(0, count);
}
