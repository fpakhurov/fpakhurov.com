/**
 * A toy DragGAN on a 32 × 20 feature map. The "generator" draws one smooth blob whose position is the latent
 * s ∈ R² (initially 0): F_s(q) = φ(q − c₀ − s) with three channels (the blob and two position-coded copies of it),
 * so that every point near the blob has its own feature vector. Each iteration takes one plain gradient step on s
 * with the motion-supervision loss (L1, shifted patch, reference frozen or not) and then re-locates the handle by
 * nearest-neighbour search of its initial feature. Used by DragToy.astro; the numbers are asserted there.
 */

export const SIG = 3;
export const GRID = { w: 32, h: 20 };
export const C0: [number, number] = [9, 10];
export const P0: [number, number] = [11, 9];
export const GOAL: [number, number] = [21, 13];
export const LR = 0.1;
export const R1 = 3;
export const R2 = 5;

type V2 = [number, number];

/** The three feature channels at offset (ux, uy) from the blob centre. */
export const phi = (ux: number, uy: number): number[] => {
  const g = Math.exp(-(ux * ux + uy * uy) / (2 * SIG * SIG));
  return [g, (ux / SIG) * g, (uy / SIG) * g];
};

/** Jacobian of the channels with respect to the offset: rows are channels, columns are (x, y). */
const dphi = (ux: number, uy: number): number[][] => {
  const g = Math.exp(-(ux * ux + uy * uy) / (2 * SIG * SIG));
  const gx = (-ux / (SIG * SIG)) * g, gy = (-uy / (SIG * SIG)) * g;
  return [
    [gx, gy],
    [(g + ux * gx) / SIG, (ux * gy) / SIG],
    [(uy * gx) / SIG, (g + uy * gy) / SIG],
  ];
};

/** Pixels whose distance to p is less than r (DragGAN's Ω₁), in x-major order. */
export const disk = (p: V2, r: number): V2[] => {
  const out: V2[] = [];
  for (let x = 0; x < GRID.w; x++) for (let y = 0; y < GRID.h; y++) if ((x - p[0]) ** 2 + (y - p[1]) ** 2 < r * r) out.push([x, y]);
  return out;
};

/** Pixels with |x − pₓ| < r and |y − p_y| < r (DragGAN's square Ω₂), in x-major order. */
export const square = (p: V2, r: number): V2[] => {
  const out: V2[] = [];
  for (let x = 0; x < GRID.w; x++) for (let y = 0; y < GRID.h; y++) if (Math.abs(x - p[0]) < r && Math.abs(y - p[1]) < r) out.push([x, y]);
  return out;
};

const dist = (a: V2, b: V2) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Gradient of the motion-supervision loss with respect to s for handle p, latent s; with or without stop-gradient. */
export const msGrad = (p: V2, s: V2, stopGrad: boolean): { g: V2; loss: number; d: V2 } => {
  const len = dist(GOAL, p);
  const d: V2 = [(GOAL[0] - p[0]) / len, (GOAL[1] - p[1]) / len];
  let gx = 0, gy = 0, loss = 0;
  for (const q of disk(p, R1)) {
    const sh: V2 = [q[0] + d[0] - C0[0] - s[0], q[1] + d[1] - C0[1] - s[1]];
    const rf: V2 = [q[0] - C0[0] - s[0], q[1] - C0[1] - s[1]];
    const a = phi(sh[0], sh[1]), b = phi(rf[0], rf[1]);
    const Ja = dphi(sh[0], sh[1]), Jb = dphi(rf[0], rf[1]);
    for (let c = 0; c < 3; c++) {
      const sg = Math.sign(a[c] - b[c]);
      loss += Math.abs(a[c] - b[c]);
      // F_s(q + d) = φ(q + d − c₀ − s), so ∂/∂s = −∂φ/∂u; the reference term enters with the opposite sign.
      gx += -sg * Ja[c][0];
      gy += -sg * Ja[c][1];
      if (!stopGrad) {
        gx += sg * Jb[c][0];
        gy += sg * Jb[c][1];
      }
    }
  }
  return { g: [gx, gy], loss, d };
};

export interface Step { k: number; p: V2; s: V2 }

/**
 * Alternate one gradient step on s and nearest-neighbour tracking until the handle is within 1 pixel of the goal,
 * or for maxIters iterations (the run without stop-gradient never arrives).
 */
export const runDrag = (stopGrad: boolean, maxIters = 80): Step[] => {
  let s: V2 = [0, 0];
  let p: V2 = [P0[0], P0[1]];
  const f = phi(P0[0] - C0[0], P0[1] - C0[1]);
  const hist: Step[] = [{ k: 0, p, s }];
  for (let k = 1; k <= maxIters; k++) {
    if (dist(GOAL, p) <= 1) break;
    const { g } = msGrad(p, s, stopGrad);
    s = [s[0] - LR * g[0], s[1] - LR * g[1]];
    let best = Infinity, bestQ: V2 = p;
    for (const q of square(p, R2)) {
      const F = phi(q[0] - C0[0] - s[0], q[1] - C0[1] - s[1]);
      const dd = Math.abs(F[0] - f[0]) + Math.abs(F[1] - f[1]) + Math.abs(F[2] - f[2]);
      if (dd < best) { best = dd; bestQ = q; }
    }
    p = bestQ;
    hist.push({ k, p, s });
  }
  return hist;
};

export const distToGoal = (p: V2) => dist(GOAL, p);
