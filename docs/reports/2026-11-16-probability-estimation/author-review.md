# Full author review: estimators and maximum likelihood

Reviewer: Codex sequence_peer, 2026-11-16. Complete author review of the two EN/RU replacements, four figures, original computations, runnable displayed code, linked factual citations and provenance. This is a frozen author candidate for two independent complete peer reviews, not publication approval or whole-course legal clearance.

## Teaching and technical scope

The original estimator comparison is exact binomial enumeration of A=K/n and B=(K+2)/(n+5). Mean, bias, variance and MSE are derived and compared at two true probabilities and three sample sizes. The curve displays the risk dependence on the unknown truth, rather than claiming universal shrinkage improvement. The sample-variance identity proves n-1 under iid finite variance; consistency is proved via MSE and contrasted with an unbiased one-observation estimator. Standard-error and dependence limitations are explicit.

The MLE replacement derives the Bernoulli optimum including open/closed boundary behavior, Gaussian/Laplace objective reductions, mean/median optima, fitted variance and degenerate zero-residual failure. Fisher score/curvature identities and the unbiased Cramer-Rao bound state the interchanges, support and moment conditions and include their standard mathematical derivations. A separately preselected shifted-exponential endpoint case demonstrates boundary optimization and failure of the regular score identity, with an exact sampling law.

Each localized body was read through and compared. Display and inline formulas, code, table numeric values, heading order and figures match. The first scoped gate passes 62/80 math spans and 14/16 display blocks per locale, with all 12/11 historical heading anchors. The Python code shown in each note executes literally and matches its displayed stdout. The full stdlib calculator executes 505 exact and floating assertions and exactly reproduces saved results and fixture files.

The four new Astro figures have four retained historical figure anchors and eight SVG panels per locale. Actual Astro rendering checks every sampling stem/marker, all eight curve series per locale, maximum markers and 3,744 coordinates across the two localized renders. Each SVG has a unique title/description linkage; local CSS uses theme tokens and stacks the two panels at narrow widths. There is no fixed-height caption clipping. These checks do not establish visual browser layout; narrow/light/dark browser evidence remains a release gate.

## Sources and independence

The pre-source plan, strict identity extraction and subsequent literal figure-ID extraction are fully described in input-separation.md. None of the old teaching prose, data, code, results or component implementations were output as author inputs. Every observation, parameter and computational fixture comes from the independent plan. No external corpus, dataset, model, image or library code is introduced. Authorship is assisted project composition, not a claim that an individual human personally wrote every line.

Exact primary factual references are Fan 2016 Lectures 12-15 at Stanford. Download hashes, attribution source and exact locators are in source-evidence.json. No asset reuse license was located in the checked documents/index; all four PDFs are reference-only and excluded from release. Their prose, distinctive input data and illustrations are not redistributed. The incomplete general MLE regularity theorem and heuristic inference of bias/moment convergence from distributional convergence in Lecture14 are not adopted. The generic normal-variance calculation is checked with Q>0 explicitly; all-identical observations are treated separately.

## Author corrections and unresolved publication work

The binomial support domain initially shared a display using qquad. Both full readers requested the same narrow-display correction; it is now a separate aligned line and the scoped gate was rerun. The second peer also requested splitting the MSE expansion, centered-sum identity, covariance-sum identity and normal negative log-likelihood across aligned lines; the same four changes were applied in both locales. No mathematical case, formula meaning or output changed. A proposed held-link concern was checked: Bayesian inference is published, absent from current withdrawal list, but still material-review-pending in the all-course inventory. The ordinary next-topic link is retained; it does not make that topic an approved upstream source.

Root and gan_author independently review the final manifest after author freeze. Integration must verify exact hashes, preserve the baseline and graph, remove only the four obsolete figure files, refresh inventory and run normal rights/content/build gates. CI browser review and live publication remain pending. BIASED transfer must wait for the reviewed, published FP revision. No local full build, browser, package installation or Actions run was used for authoring.

Final peer figure correction: the SamplingDistribution top gridline initially crossed the probability-label baseline. Plot top and truth line were moved from40/50 to65 while the label remains at47; the probability-axis mapping now uses145px height. Both locales share this geometry. The coordinate checker was updated and rerun. Mathematical inputs, masses, risk curves and all prose are unchanged.
