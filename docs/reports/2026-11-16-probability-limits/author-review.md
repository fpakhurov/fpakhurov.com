# Complete scoped author review: limit theorems

2026-11-16. Scope is the full EN/RU law-of-large-numbers and central-limit-theorem replacements and their listed assets. This is an author-reviewed candidate for two independent complete scoped peers; it is not publication approval or clearance of the rest of Probability Theory.

## Source and input separation

Read AGENTS.md, docs/content/source-policy.md and docs/course-writing.md before authoring. Curriculum identity came only from the whitelisted extraction in curriculum-identity.json. All 11 LLN and 12 CLT anchors and both prerequisite identities are preserved; no curriculum map or baseline is regenerated. The pre-source input plan is plan.md. Input-separation.md records the bounded historical extraction and first-party helper reuse.

The exact author-hosted Durrett version of January 11, 2019 is the primary mathematical reference. Its copyright page says all rights reserved. The package uses mathematical facts and explicitly located theorem statements/proof mechanisms, with newly composed explanation and calculations; it includes no source expression or asset. Source-evidence.json records exact snapshot hashes, scope read, notices and the auxiliary consulted HTML pages. Raw sources are excluded from publication. Standard Cauchy stability is cited and derived as a mathematical property, not imported as a worked exercise narrative.

## Mathematical and teaching review

The LLN note starts from finite-sample concentration and distinguishes fixed-time probability convergence from whole-sequence almost-sure convergence. The finite-variance weak-law proof explicitly uses covariance cancellation. The bounded iid strong-law proof uses a fixed bounded interval, a summable Hoeffding bound, first Borel-Cantelli without event independence, and a countable tolerance intersection. The general integrable theorem is stated separately with its full proof locator. Independent events of probability 1/(n+2) provide a different construction, not a purported failure of sample averages. Telescoping window probabilities include both endpoints N and 4N.

The new finite law has values -1, 2, 4 and probabilities 1/2, 1/3, 1/6, mean 5/6 and variance 137/36. Exact integer convolution is independently checked by multinomial enumeration at six sizes. Deviation boundaries use rational arithmetic. Bounds above one are labeled uninformative, and the finite-size comparison does not assert uniform domination of Chebyshev by Hoeffding.

Monte Carlo uses the original integrand 1+u² and exact polynomial integration. The paired integrand is 3/2-u+u². Its variance is 1/180 versus 4/45 for an unpaired observation. At equal integrand-evaluation budget, the variance ratio is eight; the text distinguishes this from sixteen at equal sample/pair count. Both figures present theoretical probabilities/errors rather than claimed empirical paths.

The CLT note states iid finite positive variance, centers and scales correctly, and defines its arrow through CDFs. The characteristic-function expansion is justified with a second-moment dominated remainder, not a hidden third-moment assumption. The continuity theorem is explicitly identified as the step from functions to distributions. The interval 8..22 for a sum of sixteen terms uses exact mass, uncorrected normal and half-integer-corrected normal values, with no universal correction guarantee.

Known-sigma intervals use repeated-sampling coverage. Exact sum endpoints and coverage are computed separately from interval width; the note distinguishes estimated variance and exact normal-theory Student intervals. Berry-Esseen uses the explicitly attributed valid loose constant three, finite absolute third moment 641/72, both sides of every discrete CDF jump and absolute rather than relative error. No universal sample-size threshold is claimed. The original alternating ±3 construction separates marginal-distribution equality from common-space probability convergence; the deterministic-limit exception is explained.

All four complete bodies, captions, legends, code and saved results were reviewed for assumptions, numbers, causality and bilingual parity. Two root pre-freeze observations were incorporated: LLN's repeated random variable is explicitly integrable; the CLT repeated-variable covariance counterexample explicitly assumes finite positive variance. The second peer requested an explicit common mean in the weak-law variance argument, a larger left margin for the Monte Carlo figure tick labels and the correct Theorem 3.4.2 source label; all three were incorporated. The first-party rendering helper code was read unchanged.

## Executed bounded checks

The stdlib script reconstructs exact polynomial-convolution masses, checks mass/means/variances, independently enumerates multinomial counts, verifies event products and polynomial integrals, computes full CDF discrepancies and exact interval coverage, and checks the alternating example. Saved stdout is results.json. No random sampling, external dataset, training or model download is involved.

The scoped checker runs from an installed FP checkout using Node with a 192 MiB heap. It replays the Python output byte for byte; compiles both complete MDX bodies in each locale with strict math; checks identity fields, exact ordered formula/heading parity, current published local-link targets and every displayed numerical table value; compiles all Astro components; renders each actual figure in EN/RU and checks every curve/marker coordinate, the discrete CDF boundary probabilities and alternating table. Verification.json records the fresh counts: 91/108 math spans per locale, 6 displays each, 11/12 anchors, four figures with six SVGs per locale and 6,928 coordinate checks. This is not a browser rendering claim.

Command, run from the installed FP repository:

`node --max-old-space-size=192 /absolute/draft/scripts/notes/check-probability-limits.mjs /absolute/draft --render-dir=/absolute/external-render-directory`

The old MonteCarloPi component has no other source references beyond the replaced note pair; it is explicitly deleted by the manifest and replaced with MonteCarloPrecision. No old figure implementation was read or reused. All other preserved figure IDs remain as before; no external data or image dependency is introduced.

## Remaining release gates

Two full independent scoped reviews, integration provenance/content checks, the normal full build and CI/browser gate, and exact live publication verification remain. The new links to the preceding reviewed concentration note depend on its FP publication completing first. BIASED may use these materials only after their own FP revision is published and pinned. No Actions runs or publication were initiated by the author; no tracked release file was modified. A temporarily misplaced untracked scoped checker was immediately moved into this outside draft and disclosed to the coordinator.
