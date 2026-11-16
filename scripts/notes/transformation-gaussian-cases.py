"""Original deterministic cases. Standard library only; no sampling or training."""
import argparse
import json
import math
from fractions import Fraction
from pathlib import Path


def cdf(y):
    if y <= 0:
        return 0.0
    if y <= 4:
        return math.sqrt(y) / 3
    if y < 16:
        return (math.sqrt(y) + 2) / 6
    return 1.0


def quantile(u):
    if not 0 <= u <= 1:
        raise ValueError("Quantile input must lie in [0, 1]")
    return 9 * u * u if u <= 2 / 3 else (6 * u - 2) ** 2


def phi(z):
    return math.exp(-z * z / 2) / math.sqrt(2 * math.pi)


def q(dx, dy):
    return (5 * dx * dx - 6 * dx * dy + 5 * dy * dy) / 16


def normal(x, mean, variance):
    return phi((x - mean) / math.sqrt(variance)) / math.sqrt(variance)


def relative_radius(x, d):
    if x <= 0:
        return 0.0
    r = x * math.sqrt(d)
    log_value = (0.5 * math.log(d) + (1 - d / 2) * math.log(2)
                 - math.lgamma(d / 2) + (d - 1) * math.log(r) - r * r / 2)
    return math.exp(log_value)


def simpson(f, a, b, n=4000):
    step = (b - a) / n
    values = [f(a + i * step) for i in range(n + 1)]
    return step / 3 * (values[0] + values[-1]
                       + 4 * sum(values[1:-1:2]) + 2 * sum(values[2:-1:2]))


def build():
    checks = 0
    def near(a, b, tolerance=1e-10):
        nonlocal checks
        assert abs(a - b) <= tolerance, (a, b)
        checks += 1
    masses = {-3: Fraction(1, 8), -1: Fraction(3, 8),
              1: Fraction(1, 4), 3: Fraction(1, 4)}
    squared = {y: sum(p for x, p in masses.items() if x*x == y) for y in (1, 9)}
    near(float(squared[1]), 5 / 8)
    near(float(squared[9]), 3 / 8)
    # An independent preimage length verifies the piecewise CDF.
    for i in range(321):
        y = -0.5 + i * 18 / 320
        half = math.sqrt(max(y, 0))
        direct = max(0, min(4, half) - max(-2, -half)) / 6
        near(cdf(y), direct)
    for i in range(1001):
        u = i / 1000
        near(cdf(quantile(u)), u)
    for y in (0.1, 0.5, 1, 3, 5, 9, 15):
        derivative = (cdf(y + 1e-5) - cdf(y - 1e-5)) / 2e-5
        expected = 1 / ((6 if y < 4 else 12) * math.sqrt(y))
        near(derivative, expected, 1e-8)
    near(cdf(9) - cdf(4), 1/6)
    near(normal(math.log(2), math.log(2), 0.25) / 2, phi(0))
    # Integration in input coordinates avoids the integrable singularity at y=0.
    near(simpson(lambda x: 1/6, -2, 4), 1)
    near(simpson(lambda z: phi(z), -9, 9), 1)
    for z in (-2, 0, 1):
        near(phi(z) / (1+z*z) * (1+z*z), phi(z))
    A = [[math.sqrt(5), 0], [3/math.sqrt(5), 4/math.sqrt(5)]]
    covariance = [[sum(A[i][k]*A[j][k] for k in range(2)) for j in range(2)] for i in range(2)]
    for i in range(2):
        for j in range(2):
            near(covariance[i][j], [[5, 3], [3, 5]][i][j])
    for dx in range(-5, 6):
        for dy in range(-5, 6):
            completed = dx*dx/5 + 5/16*(dy - 3*dx/5)**2
            near(q(dx, dy), completed)
    determinant = covariance[0][0]*covariance[1][1]-covariance[0][1]*covariance[1][0]
    near(determinant, 16)
    inverse = [[covariance[1][1]/determinant, -covariance[0][1]/determinant],
               [-covariance[1][0]/determinant, covariance[0][0]/determinant]]
    for i in range(2):
        for j in range(2):
            near(sum(covariance[i][k]*inverse[k][j] for k in range(2)), int(i==j))
    for eigenvalue, vector in [(8, [1, 1]), (2, [1, -1])]:
        for i in range(2):
            near(sum(covariance[i][j]*vector[j] for j in range(2)), eigenvalue*vector[i])
    mean = [-1, 2]
    coefficients = [2, -1]
    affine_mean = sum(a*b for a,b in zip(mean, coefficients))+3
    affine_variance = sum(coefficients[i]*covariance[i][j]*coefficients[j] for i in range(2) for j in range(2))
    conditional_mean = mean[1]+covariance[1][0]/covariance[0][0]*(3-mean[0])
    conditional_variance = covariance[1][1]-covariance[1][0]*covariance[0][1]/covariance[0][0]
    near(affine_mean, -1)
    near(affine_variance, 13)
    near(conditional_mean, 4.4)
    near(conditional_variance, 3.2)
    # Direct joint/marginal ratios check the conditional density, not just its parameters.
    for y in [-6+i/10 for i in range(181)]:
        joint = math.exp(-q(4, y-2)/2)/(2*math.pi*math.sqrt(determinant))
        near(joint/normal(3, -1, 5), normal(y, conditional_mean, conditional_variance))
    weights = [(-2, 0.25), (0, 0.5), (2, 0.25)]
    near(sum(h*p for h,p in weights), 0)
    near(sum(h*h*h*p for h,p in weights), 0)
    near(sum(p for h,p in weights if h*h==0), 0.5)
    near(simpson(lambda z: z*z*phi(z), -10, 10), 1)
    near(simpson(lambda z: z**4*phi(z), -10, 10), 3)
    ellipses = []
    for radius in (1, 2):
        points = []
        for i in range(181):
            angle = i * 2 * math.pi / 180
            dx = radius * (2 * math.cos(angle) + math.sin(angle))
            dy = radius * (2 * math.cos(angle) - math.sin(angle))
            near(q(dx, dy), radius*radius)
            points.append([dx-1, dy+2])
        ellipses.append({'radius': radius, 'points': points, 'probability': -math.expm1(-radius*radius/2)})
    for dim in (2, 16, 128):
        near(simpson(lambda x: relative_radius(x, dim), 0, 8), 1, 2e-10)
    near(simpson(lambda x: normal(x, 4.4, 3.2), -20, 30), 1)
    near(simpson(lambda x: x*normal(x, 4.4, 3.2), -20, 30), 4.4)
    near(simpson(lambda x: (x-4.4)**2*normal(x, 4.4, 3.2), -20, 30), 3.2)
    root = Path(__file__).resolve().parents[2]
    transform = {
        'discrete': [{'y': y, 'mass': str(p)} for y, p in squared.items()],
        'cdf': [[i/20, cdf(i/20)] for i in range(321)],
        'square': [[-2+i/30, (-2+i/30)**2] for i in range(181)],
        'quantiles': [[u, quantile(u)] for u in (1/6, 1/3, 1/2, 2/3, 5/6)],
        'quantileCurve': [[i/300, quantile(i/300)] for i in range(301)],
        'flow': [{'z': z, 'y': z+z**3/3, 'derivative': 1+z*z,
                  'density': phi(z)/(1+z*z),
                  'logDensity': -z*z/2-math.log(2*math.pi)/2-math.log1p(z*z)} for z in (-2, 0, 1)],
        'clippedAtom': 1/3, 'lognormalMedian': 2, 'lognormalDensityAtMedian': phi(0)
    }
    gaussian = {
        'mean': mean, 'covariance': covariance, 'determinant': determinant,
        'inverse': inverse, 'cholesky': A,
        'eigenvalues': [8, 2], 'ellipses': ellipses,
        'mahalanobis': [{'delta': d, 'squared': q(*d)} for d in [(1, 1), (1, -1), (2, 2)]],
        'peakDensity': 1/(2*math.pi*math.sqrt(determinant)), 'affineMean': affine_mean, 'affineVariance': affine_variance,
        'conditionalMean': conditional_mean, 'conditionalVariance': conditional_variance,
        'conditionalCurves': [[-6+i/20, normal(-6+i/20, 2, 5), normal(-6+i/20, 4.4, 3.2)] for i in range(361)],
        'shellCurves': [{'dimension': d, 'points': [[i/250, relative_radius(i/250, d)] for i in range(501)],
                         'relativeMode': math.sqrt((d-1)/d)} for d in (2, 16, 128)],
        'shellBound': {'dimension': 512, 'epsilon': 0.25, 'failureBound': 1/16,
                       'radii': [math.sqrt(384), math.sqrt(512), math.sqrt(640)]}
    }
    return root, transform, gaussian, checks


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true', help='Write original fixtures in this draft only')
    args = parser.parse_args()
    root, transform, gaussian, checks = build()
    for slug, cases in [('functions-of-random-variables', transform), ('multivariate-gaussian', gaussian)]:
        path = root/'src/components/figures'/slug/'cases.json'
        text = json.dumps(cases, ensure_ascii=False, indent=2) + '\n'
        if args.write:
            path.write_text(text)
        else:
            assert path.read_text() == text, 'Saved fixture differs: ' + str(path)
    print(f"square probabilities: {cdf(1):.6f} {cdf(9)-cdf(4):.6f}")
    print("quantiles:", " ".join(f"{y:.6f}" for _, y in transform['quantiles']))
    flow = transform['flow'][-1]
    print(f"flow at z=1: density={flow['density']:.6f} log_density={flow['logDensity']:.6f}")
    print(f"Gaussian determinant={gaussian['determinant']:.6f} affine_mean={gaussian['affineMean']:.6f} affine_variance={gaussian['affineVariance']:.6f}")
    print(f"conditional mean={gaussian['conditionalMean']:.6f} variance={gaussian['conditionalVariance']:.6f}")
    print("ellipse probabilities:", " ".join(f"{row['probability']:.6f}" for row in gaussian['ellipses']))
    print("shell radii:", " ".join(f"{v:.6f}" for v in gaussian['shellBound']['radii']),
          f"; failure_bound={gaussian['shellBound']['failureBound']:.6f}")
    print('deterministic assertions:', checks)


if __name__ == '__main__':
    main()
