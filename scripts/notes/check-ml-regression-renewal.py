"""Replay all three reviewed ML examples and compare saved stdout.

Run from the repository root with NumPy, SciPy and scikit-learn installed.
No downloads, dataset loaders or package installations occur.
Use --write only after reviewing a deliberate experiment change.
"""
import argparse
import contextlib
import io
import json
from pathlib import Path
import re
import warnings

from sklearn.exceptions import ConvergenceWarning

SLUGS = ["least-squares", "regularization", "stochastic-and-adaptive-optimizers"]
ROOT = Path(__file__).resolve().parents[2]
SAVED = ROOT / "docs/reports/2026-11-13-licensed-example-renewal/ml-code-outputs.json"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    warnings.filterwarnings("error", category=ConvergenceWarning)
    report = {}
    for slug in SLUGS:
        en = (ROOT / f"src/content/notes/ml/{slug}.mdx").read_text()
        ru = (ROOT / f"src/content/notes-ru/ml/{slug}.mdx").read_text()
        code = re.findall(r"```python\n(.*?)\n```", en, re.S)
        assert code == re.findall(r"```python\n(.*?)\n```", ru, re.S), slug
        assert len(code) == 1, slug
        assert not re.search(r"load_diabetes|диабет|diabetes|39921", en + ru, re.I), slug
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            exec(compile(code[0], slug, "exec"), {})
        report[slug] = out.getvalue()
    if args.write:
        SAVED.write_text(json.dumps(report, indent=2) + "\n")
    else:
        assert report == json.loads(SAVED.read_text()), "Outputs differ; inspect before accepting new results"
    # Independent exact recurrence underlying the new NoiseBall figure.
    expected = []
    for rate in [lambda k: 0.12, lambda k: 0.025, lambda k: 0.12 / (1 + k / 30)]:
        mean, variance = 2., 0.
        for k in range(240):
            eta = rate(k)
            mean *= 1 - eta
            variance = (1 - eta) ** 2 * variance + eta ** 2
        expected.append((mean * mean + variance) / 2)
    assert abs(expected[0] - 0.12 / (2 * (2 - 0.12))) < 1e-12
    print(json.dumps({"inline_examples": "passed", "locales": 2, "notes": len(SLUGS), "noise_figure_end_losses": expected}, indent=2))


if __name__ == "__main__":
    main()
