"""Original synthetic regression fixture, authored for this course with Codex assistance.

No external data, benchmark statistics or downloaded model is used.
Run with NumPy, SciPy and scikit-learn; no network access is required.
The JSON records model-selection scores, not an unbiased deployment estimate.
"""
import argparse
import json
from pathlib import Path
import platform
import warnings

import numpy as np
import scipy
import sklearn
from sklearn.exceptions import ConvergenceWarning
from sklearn.linear_model import LinearRegression, Ridge, Lasso, lasso_path
from sklearn.model_selection import KFold, cross_val_score
from sklearn.neighbors import KNeighborsRegressor
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler, PolynomialFeatures

NAMES = ["sensor_a", "sensor_b", "control", "ambient", "aux_1", "aux_2", "aux_3", "aux_4"]


def make_data():
    # Independent dimensionless simulated inputs, with one deliberately redundant pair.
    rng = np.random.default_rng(20261113)
    base = rng.normal(size=(240, 8))
    X = base.copy()
    X[:, 1] = base[:, 0] + 0.08 * base[:, 1]
    y = 20 + X @ np.array([4., 4., -3., 2., 0., 0., 0., 0.])
    y += 4 * rng.normal(size=len(X))
    return X, y


def train(X, y, method, eta, cut=False):
    # A shared NumPy permutation for every optimizer makes the finite comparison explicit.
    out = []
    optimum = np.linalg.lstsq(X, y, rcond=None)[0]
    minimum = np.mean((X @ optimum - y) ** 2) / 2
    for seed in range(5):
        rng = np.random.default_rng(400 + seed)
        w = np.zeros(X.shape[1]); velocity = w.copy(); m = w.copy(); v = w.copy()
        step = 0
        for epoch in range(40):
            rate = eta / 10 if cut and epoch >= 20 else eta
            indices = rng.permutation(len(y))
            for start in range(0, len(y), 24):
                idx = indices[start:start + 24]
                g = X[idx].T @ (X[idx] @ w - y[idx]) / len(idx)
                step += 1
                if method == "sgd":
                    w -= rate * g
                elif method == "momentum":
                    velocity = 0.9 * velocity + g
                    w -= rate * velocity
                elif method == "adam":
                    m = 0.9 * m + 0.1 * g
                    v = 0.999 * v + 0.001 * g * g
                    w -= rate * (m / (1 - 0.9 ** step)) / (np.sqrt(v / (1 - 0.999 ** step)) + 1e-8)
                else:
                    raise ValueError(method)
        out.append(float(np.mean((X @ w - y) ** 2) / 2 - minimum))
    return {"mean": float(np.mean(out)), "seed_results": out}


def evaluate():
    warnings.filterwarnings("error", category=ConvergenceWarning)
    X, y = make_data()
    Xs = StandardScaler().fit_transform(X); yc = y - y.mean()
    cv = KFold(5, shuffle=True, random_state=17)
    score = lambda model: float(cross_val_score(model, X, y, cv=cv, scoring="r2").mean())
    fitted = LinearRegression().fit(X, y)
    gram = Xs.T @ Xs; cross = Xs.T @ yc
    eig = np.linalg.eigvalsh(gram)[::-1]
    result = {
        "environment": {"python": platform.python_version(), "numpy": np.__version__, "scipy": scipy.__version__, "sklearn": sklearn.__version__},
        "fixture": {"seed": 20261113, "n": len(y), "features": NAMES, "coefficients": [4, 4, -3, 2, 0, 0, 0, 0], "intercept": 20, "noise_sd": 4, "sensor_b": "sensor_a + 0.08 * independent standard normal", "external_inputs": []},
        "least_squares": {"train_r2": float(fitted.score(X, y)), "cv_r2": score(LinearRegression()), "knn_cv_r2": {str(k): score(make_pipeline(StandardScaler(), KNeighborsRegressor(k))) for k in (3, 9, 27, 54)}},
        "regularization": {"correlation": float(np.corrcoef(Xs.T)[0, 1]), "eigenvalues": eig.tolist(), "shrinkage": {str(lam): {"factors": (eig / (eig + lam)).tolist(), "df": float((eig / (eig + lam)).sum())} for lam in (1, 10, 100, 1000)}, "lambda_max": float(2 * abs(cross).max()), "first_feature": NAMES[abs(cross).argmax()], "ols_weights": np.linalg.lstsq(Xs, yc, rcond=None)[0].tolist(), "cv": []},
    }
    with warnings.catch_warnings():
        warnings.filterwarnings("ignore", category=FutureWarning)
        alphas, coefs, _ = lasso_path(Xs, yc, n_alphas=2000, eps=1e-5, max_iter=200000, tol=1e-9)
    order = []
    for column in coefs.T:
        order += [NAMES[j] for j in np.flatnonzero(abs(column) > 1e-9) if NAMES[j] not in order]
    result["regularization"]["entry_order"] = order
    for degree in (1, 2, 3):
        pipeline = lambda model: make_pipeline(PolynomialFeatures(degree, include_bias=False), StandardScaler(), model)
        scores = lambda model: score(pipeline(model))
        r = {str(a): scores(Ridge(alpha=a)) for a in (0.1, 1, 10, 100, 1000)}
        l = {str(a): scores(Lasso(alpha=a, max_iter=200000, tol=1e-6)) for a in (0.03, 0.1, 0.3, 1, 3)}
        result["regularization"]["cv"].append({"degree": degree, "features": PolynomialFeatures(degree, include_bias=False).fit(X).n_output_features_, "ols": scores(LinearRegression()), "ridge_scores": r, "lasso_scores": l, "ridge_best": max(r, key=r.get), "lasso_best": max(l, key=l.get)})
    best_ridge = float(result["regularization"]["cv"][0]["ridge_best"])
    best_alpha = float(result["regularization"]["cv"][0]["lasso_best"])
    result["regularization"]["selected_lasso_weights"] = Lasso(alpha=best_alpha, tol=1e-12, max_iter=200000).fit(Xs, yc).coef_.tolist()
    per_example = Xs * (-yc[:, None]); full = per_example.mean(0)
    rng = np.random.default_rng(20261114)
    noise = {}
    for batch in (1, 8, 64):
        indices = rng.integers(0, len(y), size=(6000, batch))
        errors = per_example[indices].mean(1) - full
        noise[str(batch)] = {"measured_rmse": float(np.sqrt(np.mean(np.sum(errors * errors, axis=1)))), "theory_rmse": float(np.sqrt(np.sum(np.var(per_example, axis=0)) / batch))}
    minimum = np.mean((Xs @ np.linalg.lstsq(Xs, yc, rcond=None)[0] - yc) ** 2) / 2
    result["optimizers"] = {"min_loss": float(minimum), "condition": float(eig[0] / eig[-1]), "batch_noise": noise, "runs": {}}
    for method, eta in (("sgd", 0.03), ("sgd", 0.15), ("momentum", 0.015), ("adam", 0.003), ("adam", 0.1)):
        result["optimizers"]["runs"][f"{method} {eta}"] = {"constant": train(Xs, yc, method, eta), "cut": train(Xs, yc, method, eta, True)}
    # KKT conditions compare the independently implemented coordinate descent with sklearn.
    lam = 2 * len(y) * best_alpha
    weights = np.zeros(X.shape[1])
    for _ in range(20000):
        previous = weights.copy()
        for j in range(len(weights)):
            partial = cross[j] - gram[j] @ weights + gram[j, j] * weights[j]
            weights[j] = np.sign(partial) * max(abs(partial) - lam / 2, 0) / gram[j, j]
        if np.max(abs(weights - previous)) < 1e-12:
            break
    expected = np.array(result["regularization"]["selected_lasso_weights"])
    assert np.max(abs(weights - expected)) < 1e-7, (weights, expected, np.max(abs(weights - expected)))
    assert all(np.isfinite(list(row["ridge_scores"].values()) + list(row["lasso_scores"].values()) + [row["ols"]]).all() for row in result["regularization"]["cv"])
    result["checks"] = {"lasso_coordinate_max_difference": float(np.max(abs(weights - expected))), "all_scores_finite": True, "external_downloads": False}
    plot = {"names": NAMES, "n": len(y), "G": gram.tolist(), "c": cross.tolist(), "ridgeCV": best_ridge, "lassoAlphaCV": best_alpha}
    return result, plot


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path)
    parser.add_argument("--plot-output", type=Path)
    args = parser.parse_args()
    result, plot = evaluate()
    encoded = json.dumps(result, indent=2, ensure_ascii=False) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(encoded)
    else:
        print(encoded, end="")
    if args.plot_output:
        args.plot_output.write_text(json.dumps(plot, indent=2) + "\n")
