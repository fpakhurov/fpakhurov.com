/** The standard normal density and distribution function for figures. */

/** erf by Abramowitz and Stegun 7.1.26; absolute error below 1.5e-7. */
export const erf = (x: number) => {
  const s = Math.sign(x), a = Math.abs(x), t = 1 / (1 + 0.3275911 * a);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a);
  return s * y;
};

/** Standard normal CDF. */
export const Phi = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2));

/** Standard normal density. */
export const phi = (x: number) => Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
