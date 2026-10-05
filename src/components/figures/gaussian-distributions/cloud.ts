/**
 * Helpers for the 2-D Gaussian figures of the gaussian-distributions note.
 * Points and ellipses are computed in data space and mapped to a panel whose
 * data origin sits at (ox, oy) with `u` pixels per data unit (y grows upwards).
 */
import { normals } from '../geometry';

export type Vec = [number, number];
export type Mat = [[number, number], [number, number]];

const fmt = (value: number) => Number(value.toFixed(2));

/** Pairs of independent standard normal draws, Z ~ N(0, I). */
export function standardPairs(count: number, seed: number): Vec[] {
  const flat = normals(2 * count, seed);
  const pairs: Vec[] = [];
  for (let i = 0; i < count; i += 1) pairs.push([flat[2 * i], flat[2 * i + 1]]);
  return pairs;
}

/** Matrix–vector product A z. */
export const apply = (a: Mat, z: Vec): Vec => [a[0][0] * z[0] + a[0][1] * z[1], a[1][0] * z[0] + a[1][1] * z[1]];

/** A z + mu. */
export const affine = (a: Mat, mu: Vec, z: Vec): Vec => {
  const v = apply(a, z);
  return [v[0] + mu[0], v[1] + mu[1]];
};

/** Panel mapping from data space to screen space. */
export function panel(ox: number, oy: number, u: number) {
  return {
    x: (value: number) => fmt(ox + value * u),
    y: (value: number) => fmt(oy - value * u),
    len: (value: number) => fmt(value * u),
  };
}

/**
 * Closed path of the k-sigma ellipse {mu + k A (cos t, sin t)}: the set of points
 * at Mahalanobis distance k from mu when Sigma = A A^T.
 */
export function ellipsePath(a: Mat, mu: Vec, k: number, map: ReturnType<typeof panel>, samples = 120): string {
  const parts: string[] = [];
  for (let i = 0; i <= samples; i += 1) {
    const t = (2 * Math.PI * i) / samples;
    const p = affine(a, mu, [k * Math.cos(t), k * Math.sin(t)]);
    parts.push(`${i === 0 ? 'M' : 'L'} ${map.x(p[0])} ${map.y(p[1])}`);
  }
  return `${parts.join(' ')} Z`;
}

/** A curly brace from (x1, y1) to (x2, y2) bulging by `depth` to the left of the direction of travel. */
export function bracePath(x1: number, y1: number, x2: number, y2: number, depth = 10): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  // Normal pointing to the left of the travel direction (screen coordinates).
  const nx = uy;
  const ny = -ux;
  const at = (s: number, d: number) => `${fmt(x1 + ux * s + nx * d)} ${fmt(y1 + uy * s + ny * d)}`;
  const h = length / 2;
  const q = Math.min(depth, h / 2);
  return [
    `M ${at(0, 0)}`,
    `Q ${at(0, depth / 2)} ${at(q, depth / 2)}`,
    `L ${at(h - q, depth / 2)}`,
    `Q ${at(h, depth / 2)} ${at(h, depth)}`,
    `Q ${at(h, depth / 2)} ${at(h + q, depth / 2)}`,
    `L ${at(length - q, depth / 2)}`,
    `Q ${at(length, depth / 2)} ${at(length, 0)}`,
  ].join(' ');
}
