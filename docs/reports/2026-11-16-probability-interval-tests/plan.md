# Intervals and tests: pre-source author plan

Date: 2026-11-16. Author: Fedor Pakhurov with AI assistance (sequence_peer). Draft only; independent peers and coordinator publication remain required.

## Inputs and boundary

Read current FP AGENTS.md, source-policy.md, course-writing.md, probability course design, and RU translation guide before authoring. Strict script extraction from c89a796c778661dbc3dfec1891c0ef2c881830b8 admits only title/course/section/order/status/tags/prerequisites, headings outside fenced blocks and import paths. It excludes descriptions, narratives, mathematical examples, code bodies/comments/results and figure implementations. The extracted identity is curriculum-identity.json. No legacy teaching text is to be read or provided as a rewriting input. Probability design is a curriculum brief, not reuse permission for any named source.

Two full EN/RU replacements preserve order17/18, existing prerequisite graph and every existing heading anchor. New figures will use new implementations; old component paths will be explicit replacements or deletions with exact old hashes, never retained as unreviewed bundled assets. Source/helper reuse is confined to approved shared rendering infrastructure and exact reviewed upstream notes if needed. Current local FP68 reviewed-complete notes may be used for a factual bridge only with pinned commit and record, explicitly not yet live; BIASED derivation waits for live publication.

## Original cases fixed before reading primary references

1. Normal known-sigma mean: hypothetical mean2.8, n25, sigma1.5; derive95% interval via pivot. Student t contrast: hypothetical independent normal measurements [6,7,9,10,13], n5; evaluate exact t4 critical value using deterministic stdlib integration/inversion, not a copied table. State normal-model conditions and distinguish confidence from posterior probability.
2. Wilson inversion: k2 successes among n16,95%; compare Wald and Wilson bounds. Compute exact Binomial(16,.1) coverage by summing all17 outcomes, not Monte Carlo. Original coverage figure shows interval construction across outcome counts with probability weights.
3. Bootstrap: new tiny values [1,2,4,8], all4^4=256 ordered resamples, exact mean distribution, standard error and2.5/97.5% inverse-CDF quantiles. Compare empirical-divisor-n variance with usual n-1 sample variance. A separate failure case Bernoulli p=.08,n12 gives all-zero observed sample with probability(.92)^12; empirical bootstrap then has zero variability and misses unobserved events.
4. Paired comparison:12 fictional shared test cases, loss difference d=lossA-lossB takes +1 three times,-1 once,0 eight times. Derive mean, variance and SE of paired mean; resample rows/pairs. No source benchmark, predictions or accuracy measurements.
5. Exact test: Binomial n12,p0=.5, one-sided alternative p>.5, rejection k>=10; compute size, tail p-values at k9/10 and power atp=.75. This illustrates discreteness and separates alpha from observed p-value.
6. A/B example: independent randomized Bernoulli arms nA=nB=80, successes24 and38. Compute pooled-null z and two-sided normal tail, plus unpooled effect interval; explicitly approximate and preselected fixed horizon. No real traffic, intervention or deployment claim.
7. Peeking: under Bernoulli .5, inspect cumulative counts at10,20,30,40,50,60. At each look choose smallest k with exact one-sided binomial tail<=.05. Exact integer dynamic programming counts paths that ever cross; compare per-look sizes and terminal-only size with accumulated false-positive probability. No random seed or reused simulation path.
8. Multiplicity:8 independent level.05 tests produce1-.95^8 familywise error; Bonferroni alpha/8 and arbitrary-dependence union-bound proof. Five invented p-values [.003,.014,.021,.18,.4] illustrate Holm's ordered stop rule (only first rejected) and optionally BH under its stated dependence assumptions if primary reading supports scope.
9. Randomization test: six fixed fictional outcomes[0,1,2,4,7,9], assign exactly3 to B uniformly. Observed B[4,7,9],A[0,1,2]. Enumerate all20 assignments, compare absolute mean-difference statistic; no jitter, no source dataset. Explain sharp null, exchangeability and two-sided p=.1 despite separated samples.

## Planned original figures

Four compact responsive formula-generated Astro figures: finite-binomial coverage; exact bootstrap mass; exact rejection/power tails; repeated-look false-positive accumulation. Additional table/plot only if needed for teaching. No old figure implementation will be inspected. Every SVG has title/desc, localized labels, shared theme tokens, explicit swatch+label grouping and generous axis gutters. Figure code receives Astro compile plus TSX syntax checks, actual component render/coordinate assertions and later CI visual review; no local browser/full build.

## Primary reference discovery plan

Read exact primary sources for Neyman confidence coverage, Student pivot if accessible, Wilson score inversion, Efron bootstrap, Neyman-Pearson testing/power, optional-stopping/repeated-significance, Holm/Bonferroni and permutation randomization. A modern primary textbook/author's exposition may verify calculations and theorem conditions. Reference-only use: no source prose/code/figures/examples/results adapted. Record exact snapshots, checked sections, notices or unknown reuse terms. Public access is not reuse clearance. Select only claims actually verified.

## Verification and publication limits

Tiny deterministic stdlib arithmetic with saved JSON/stdout, exact rational enumeration where possible, normal tails and t integration with checked convergence. Bilingual math/code/heading/figure parity, strict KaTeX/MDX/actual Astro render and TSX parse in serial Node192. Per-file review with exact pins and source locators; frozen explicit manifest for two independent full peers. Root owns rights/global build/CI/browser/live checks, integration and publication. No local build, server, browser, package install, model/download/training, push or Actions invocation.
