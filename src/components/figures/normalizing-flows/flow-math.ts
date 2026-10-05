/**
 * Shared maths for the normalizing-flows figures.
 * Convention used throughout the note: f maps latent z to data x, x = f(z).
 */
import { gaussian } from '../geometry';

/** 1-D example flow: a monotone map that pulls mass away from the origin. */
export const flow1d = (z: number) => z + 0.8 * Math.tanh(2 * z);
export const flow1dPrime = (z: number) => 1 + 1.6 / Math.cosh(2 * z) ** 2;

/** Inverse of flow1d by bisection (flow1d is strictly increasing). */
export function flow1dInverse(x: number): number {
  let lo = -20;
  let hi = 20;
  for (let i = 0; i < 80; i += 1) {
    const mid = (lo + hi) / 2;
    if (flow1d(mid) < x) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Base density p_z = N(0, 1) and the pushed-forward density p_x. */
export const pz = (z: number) => gaussian(z, 0, 1);
export const px = (x: number) => {
  const z = flow1dInverse(x);
  return pz(z) / Math.abs(flow1dPrime(z));
};

/** Standard normal CDF via an erf approximation (Abramowitz–Stegun 7.1.26, error < 1.5e-7). */
export function normalCdf(z: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const erf = 1 - poly * Math.exp(-(z * z) / 2);
  return z >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
}

/**
 * 2-D example flow, built from two triangular (coupling-like) steps so that it is
 * invertible by construction:
 *   step 1: (a, b) -> (a, b * exp(0.35 a) + 0.2 a)      det = exp(0.35 a)
 *   step 2: (a, b) -> (a + 0.35 sin(1.2 b), b)           det = 1
 * so det J_f(z) = exp(0.35 z1).
 */
export function flow2d([z1, z2]: readonly [number, number]): [number, number] {
  const b = z2 * Math.exp(0.35 * z1) + 0.2 * z1;
  return [z1 + 0.35 * Math.sin(1.2 * b), b];
}
export const flow2dDet = (z1: number) => Math.exp(0.35 * z1);

/** Shoelace area of a closed polygon. */
export function polygonArea(points: readonly (readonly [number, number])[]): number {
  let sum = 0;
  for (let i = 0; i < points.length; i += 1) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    sum += x1 * y2 - x2 * y1;
  }
  return Math.abs(sum) / 2;
}

/** Bracket paths for a 2x2 matrix drawn at centre (cx, cy). */
export function matrixBrackets(cx: number, cy: number, halfWidth: number, halfHeight: number) {
  const l = cx - halfWidth;
  const r = cx + halfWidth;
  const t = cy - halfHeight;
  const b = cy + halfHeight;
  return {
    left: `M ${l + 6} ${t} H ${l} V ${b} H ${l + 6}`,
    right: `M ${r - 6} ${t} H ${r} V ${b} H ${r - 6}`,
  };
}
