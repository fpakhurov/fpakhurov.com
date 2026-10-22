/**
 * The relevance vector machine of the note's Code section, fitted to 100 noisy points of sinc(x) = sin(x)/x on [−10, 10]
 * (numpy default_rng(0), noise standard deviation 0.1), with a bias and one Gaussian kernel of width 2 per point.
 * Type-II maximum likelihood ran 378 iterations and kept 6 of the 101 features; the numbers below are its output
 * (targets rounded to four decimals). The figures recompute the predictive mean and band from them.
 */

export const xs = Array.from({ length: 100 }, (_, i) => -10 + (20 * i) / 99);
export const ts = [-0.0418, -0.0504, 0.0463, 0.0138, -0.0285, 0.083, 0.1981, 0.1814, 0.0325, -0.0108, 0.062, 0.1323, -0.1056, 0.0984, -0.0164, 0.0177, 0.0144, 0.0108, 0.0538, 0.0846, -0.0662, 0.0495, -0.1862, -0.1145, -0.0854, -0.187, -0.2849, -0.3091, -0.2605, -0.1811, -0.2827, -0.1711, -0.1244, -0.0031, 0.0247, 0.1075, 0.0822, 0.2159, 0.3926, 0.5511, 0.3638, 0.7275, 0.7936, 0.8145, 0.833, 0.8364, 1.0645, 1.1541, 1.1649, 1.1298, 1.034, 0.8639, 0.9576, 0.9844, 0.739, 0.8461, 0.7794, 0.7286, 0.4577, 0.4236, 0.3582, 0.1972, 0.4028, 0.098, 0.1048, -0.0226, 0.1012, 0.0235, -0.0868, -0.4021, -0.198, -0.1464, -0.1165, -0.2723, -0.0142, -0.3077, -0.2159, -0.0262, -0.0822, 0.1469, -0.0008, -0.0507, 0.0047, -0.0403, -0.0368, 0.1713, 0.1784, 0.2564, 0.0527, 0.2932, 0.087, 0.2604, 0.0434, -0.0059, 0.0718, 0.1282, 0.0194, -0.0763, -0.1713, -0.1946];
/** Indices of the kept features: 0 is the bias, k ≥ 1 the kernel centred on xs[k − 1]. */
export const keep = [21, 35, 47, 76, 91, 100];
export const mu = [0.1699622941430123, -0.729319215303299, 1.3670916196334346, -0.3394234224431893, 0.5813791224026089, -0.4943478758189309];
export const S = [
  [0.0008729698590496053, -0.000818270776940317, 0.00041949972679879995, -7.905248203127418e-05, 0.0001130672674138719, -9.979264523116442e-05],
  [-0.0008182707769403169, 0.0016714690312250142, -0.0010334694307771953, 0.0002038910680455465, -0.00029253433406819157, 0.00025839768465124314],
  [0.00041949972679879995, -0.0010334694307771953, 0.0011308224591573168, -0.0002468399005259249, 0.0003565275111642513, -0.00031546583944910166],
  [-7.905248203127418e-05, 0.00020389106804554648, -0.0002468399005259249, 0.001121427294532224, -0.001774728322739649, 0.0016075118327849073],
  [0.00011306726741387179, -0.00029253433406819124, 0.000356527511164251, -0.001774728322739648, 0.0052667525710857485, -0.005418990742932035],
  [-9.979264523116438e-05, 0.000258397684651243, -0.0003154658394491015, 0.0016075118327849068, -0.005418990742932035, 0.006540902942125163],
];
export const beta = 122.94234389167764;

export const width = 2;
export const kernel = (a: number, b: number) => Math.exp(-((a - b) ** 2) / (2 * width ** 2));
export const sinc = (x: number) => (x === 0 ? 1 : Math.sin(x) / x);

/** The kept features at x. */
export const features = (x: number) => keep.map((k) => (k === 0 ? 1 : kernel(x, xs[k - 1])));

/** Predictive mean μᵀφ(x) and standard deviation √(1/β + φ(x)ᵀ S φ(x)). */
export function predict(x: number) {
  const f = features(x);
  const mean = f.reduce((s, v, i) => s + v * mu[i], 0);
  let q = 0;
  for (let i = 0; i < f.length; i++) for (let j = 0; j < f.length; j++) q += f[i] * S[i][j] * f[j];
  return { mean, sd: Math.sqrt(1 / beta + q) };
}

/** The marginal likelihood as a function of one precision, relative to its value at α = ∞, in u = α/s and r = q²/s. */
export const ell = (u: number, r: number) => 0.5 * (Math.log(u / (1 + u)) + r / (1 + u));
