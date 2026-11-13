# ML regression examples: bounded renewal and whole-note review

Reviewed 2026-11-13 in `codex/licensed-example-renewal`, based on `a46e3a9`. Scope: `ml/least-squares`, `ml/regularization`, `ml/stochastic-and-adaptive-optimizers`, both languages, six imported figures and their current complete local rendering dependencies. This is three reviewed topics, not approval of the remaining ML course or other foundations courses.

## Removed and replaced

All three `load_diabetes` calls, the corresponding narrative results, CV table, optimizer measurements, lasso entry order and hardcoded patient-data sufficient statistics were removed. `regularization/diabetes.ts` is deleted. No patient rows, feature names, fitted statistics or old experiment scores are inputs to the replacement.

The new fixture was independently specified for this course with Codex assistance: 240 rows, eight independent normal draws per row, a deliberately redundant second sensor `x2=x1+0.08*z2`, four known nonzero generating coefficients `[4,4,-3,2]`, four irrelevant auxiliaries, intercept 20, independent Gaussian target noise SD 4, NumPy seed 20261113. These are mathematical, dimensionless signals; the notes explicitly do not present them as measurements of people or equipment. Its purposes are additive model comparison, collinearity, feature expansion and optimization noise. It was not fitted to preserve previous benchmark results.

`scripts/notes/synthetic-regression.py` generates the fixture, evaluates every reported affected result and writes the new plot statistics in `regularization/synthetic-regression.json`. Separate JSON saves all CV candidate scores, all five optimizer-seed outcomes, theoretical and measured batch-gradient error, spectral factors, and a coordinate-descent versus scikit-learn check. The mean CV scores used to choose hyperparameters are labelled selection scores; there is no deployment/generalization claim from the same folds.

The former `NoiseBall` plot and its PRNG helper were replaced in full by an exact, independently specified recurrence for mean and variance in `Q(w)=w²/2`, initial `w=2`. It is explicitly an expectation calculation rather than a sampled run. Its three step schedules are 0.12, 0.025 and `0.12/(1+k/30)`, for 240 updates. `noiseBall.ts` is deleted.

The former 3D projection scene was replaced in full by a new four-observation residual-accounting chart. Source comparison found that MML Example 3.11 and the former scene shared the elementary basis `(1,1,1),(0,1,2)`, although their targets differed. This was not proof of copied expression; the presentation was nevertheless rebuilt to remove that uncertain historical dependency. The new chart uses the already explicit four-point normal-equation calculation and checks `RSS(other)=3=2.7+0.3`. It makes clear that orthogonality concerns observation vectors, not the angles drawn on an x-y chart.

All six reviewed figures now import a narrow newly composed `regressionGeometry.ts` with only affine scaling and SVG path construction. They do not depend on the shared historical PRNG implementation in `geometry.ts` or `random.ts`. Shared `Figure.astro` and `lang.ts` are unchanged presentation/locale wrappers and were read in full.

## Retained content and source comparison

The complete EN/RU note bodies, equations, code and six figure sources were read, not just the replaced loaders. General derivations and independently checkable small mathematical inputs remain; they are not represented as new scientific discoveries or as newly authored in this pass.

| Material | Evidence inspected | Decision |
| --- | --- | --- |
| Normal equations, Gaussian likelihood, projection, uncertainty | Bishop PRML (2006), §§3.1.1–3.1.4; MML current author PDF, §§3.8 and 9.2/9.4; direct expansion, orthogonality and covariance calculation | Scientific references. No book figure, page image, prose block or supplied dataset imported. The potentially source-like three-point graphic is replaced as above. |
| Four-point fit, leverage, simulated sampling/collinearity, Vandermonde conditioning and ten-point robust fit | Full local code re-executed; explicit arrays/parameters; HSE lecture 2 source at commit `2f83a89d0ce6a630c882f63dc68a597ba6d9caf2` compared | HSE uses a different seven-row outlier/prediction table and MSE/MAE values. That table, its values and its layout are absent here. Existing local robust-fit illustration computes its own specified inputs; no source plot/image dependency. |
| Ridge, lasso, constraint geometry, coordinate updates | HSE lecture 4 source at the same commit; Bishop §3.1.4; Friedman et al. 2007 equations 1–4; Zou/Hastie grouping argument; scikit-learn 1.9.1 objective definition | Formula/reference use. `NormBalls` defines and solves its explicit quadratic `M=[[1,.5],[.5,1]], w_hat=(.8,2.2)`; the reported solutions/normal-cone condition are recalculated. General circle/diamond constraint shapes are mathematical objects; no source graphic or code is distributed. |
| Optimizer definitions, bias correction and scope | HSE lecture 3 source; Kingma/Ba Algorithm 1 and §3; Duchi et al.; Hinton lecture 6e; Sutskever et al. §2; Bubeck Theorems 3.15/3.18/6.2; Reddi et al.; Wilson et al. | Reference use; custom NumPy loops evaluate the specified synthetic fixture. No third-party optimizer implementation or notebook is copied. Former PyTorch parity measurement removed; current checks are central finite differences and the first corrected Adam step. |
| Deterministic two-bowl plot | Local `OptimizerPaths` recurrence read and rerun; Goh “Optimal parameters” compared | Its eigenvalues 4.5/.045, rotation30°, initialization and measured paths are explicit local calculations. Goh's scientific heavy-ball rate is cited; the article's colorization/Rosenbrock examples and interactive assets are not reused. |
| Existing bibliography | Retained accurate scientific credits; source relationship kept rather than removed to suggest independence | References are not adaptation grants. ESL PDF endpoints failed retrieval in this pass; its full historical expression was not exhaustively compared. No specific ESL dataset/figure/table is distributed in this scope. Claims were checked through direct derivations, current primary papers, PRML/MML and fresh execution; no broad statement about the rights in ESL or every cited publication is made. |

The HSE repository has no established material license at the recorded revision. It is used only to check and retain conceptual/source history; public visibility is not treated as permission to copy. PRML/MML and paper references likewise do not grant permission to reproduce their expression. Comparisons establish the bounded decisions above, not an exhaustive legal similarity search over every publication.

## Technical corrections discovered during the review

- Bubeck's worst-case lower bound now has the `2(k−1)` exponent, squared initial distance factor and Hilbert-space/black-box scope; the previous wording incorrectly used an unsquared generic initial-error rate.
- Negative training R² is excluded only for unconstrained least squares with an intercept, not for arbitrary fitted models.
- Batch covariance distinguishes IID sampling from the finite-population factor at fixed weights and from dependent shuffled training batches.
- Adam's second moment is not labelled a Hessian estimate; neither the table nor the prose promises a general κ-rate. The sign-sized first step explicitly neglects epsilon.
- Momentum's sustained-direction effective step is not a universal stationary-noise formula. Ridge is unique for positive penalty; variance reduction is a trade-off, and early stopping is a spectral filter rather than exactly one ridge penalty in all directions.

## Reproducibility and limits

Environment used without installing or changing it: Python3.14.7, NumPy2.5.4, SciPy1.18.1, scikit-learn1.9.1, single-thread BLAS. These libraries' versioned BSD3 license texts were read; the site distributes example calls and calculated values, not their source trees or wheels. Library licenses are not substituted for dataset rights.

Commands (from repository root):

```sh
OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 python scripts/notes/synthetic-regression.py --output docs/reports/2026-11-13-licensed-example-renewal/ml-synthetic-results.json --plot-output src/components/figures/regularization/synthetic-regression.json
OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 python scripts/notes/check-ml-regression-renewal.py
node scripts/notes/check-ml-regression-figures.cjs
```

All three complete inline examples were run, with identical code in EN/RU and no convergence warnings. Saved stdout is checked rather than automatically accepted on rerun. All six figure computations pass their numeric checks. New fixture results include OLS validationR² 0.811677, 164-feature cubic OLS −7.090204/ridge0.652327/lasso0.802893, minimum optimizer loss8.455596, condition568.903188, and independently implemented lasso coefficient difference below1e−7. These are finite controlled experiments, not real-world benchmark comparisons.

The record covers the current files listed in the accompanying machine-readable review. No remote model/data download, source paper image, external notebook, or copied patient-derived statistic is distributed. This is an editorial/material-use review of a bounded asset closure, not a guarantee of exclusive copyright in AI-assisted work. Visual/browser review, full build, release checks, publication and subsequent BIASED source pinning remain the parent's release tasks. No Git commit or deployment was performed by this agent.

Independent `course_licenses` cross-check completed after the last mathematical corrections: new generator and plot JSON reproduced exactly; all three full inline examples match saved stdout; all six figure numeric checks pass. The reviewer separately recomputed the exact noise endpoints and four-point RSS decomposition, checked new EN/RU assumptions/numbers and primary Bubeck theorem scope, and reported no remaining blocker within that bounded check. This is not a second exhaustive source audit.

Local structural checks: all six Astro components compile, 1,358 math spans render with KaTeX without errors, and `git diff --check` passes. The full rights command stopped at an unrelated stale `slo-cross-reference-maintenance` record for `devops/incidents-and-security.mdx`; the parent was informed, and this agent did not change that unrelated record. Final global gate/build and browser evidence belong to the release step.
