# Independent scoped peer review: transformations and multivariate Gaussian

Date: 2026-11-16. Reviewer: Codex `pretraining_author`, independent of author `gan_author` and coordinator `/root`.

**Result: PASS for the frozen two-topic package. No remaining scoped finding.** This is one independent complete peer review, not a whole-course rights certification, browser visual approval, deployment, or authorization to skip the coordinator's integrated checks.

Candidate: `/Users/fedorpakhurov/code/_work/fp-probability-transform-gaussian-drafts`.

Final frozen manifest: `transform-gaussian-release-files.json`, SHA-256 `41faf1149ff834ee76b8ea2854c143464572ccfcde6bb0a48a68435ddc41030b`. All 22 release-file hashes and all 21 review-record pins match. Initial technical review used manifest `ab88f8123fbbb641b1787e4ecab4867a7aba136467499c36ce8c3baa1c59a0c2`; the only subsequent changes are the author report and review record's provenance clarification, plus their manifest pins. Teaching, computation, figures, fixtures and scientific source evidence remain byte-identical, so the complete technical findings continue to apply. No candidate or release-repository file was changed by this reviewer. Reviewer scripts, rendered components and evidence are outside the package.

## Complete content and source review

Read both complete EN/RU bodies for `functions-of-random-variables` and `multivariate-gaussian`, including assumptions, derivations, examples, figures, code/output pairs, limitations, handoffs and bibliographies. Read the complete five Astro figures, three shared first-party helpers, author calculation/checker scripts, source/rights record, curriculum identity record and all frozen reports. The two generated coordinate JSON assets were independently checked across all numeric series.

Reviewed the probability course design, current source policy and authoring guide. Historical metadata, imports, anchors and figure IDs were checked against Git `d6789afe98906dea5be511f6134d2b77fa5d3ee2`; no historic body was used as writing input. Four bilingual identity frontmatters match. All 11 transformation anchors and 12 Gaussian anchors remain present in each locale. The three first-party helpers match exact Git blobs at `b06b1f66040c4c4426955a1be0906c5baddc26cb`.

Primary support was checked by reading the selected source passages, not just links or titles. The exact seven private HTML hashes, extracted-text hashes and read ranges are in `reviewed-files.json`:

- Siegrist, Transformations: event preimages and discrete sums, smooth inverse-Jacobian assumptions, inverse sampling and continuous probability integral transform.
- Siegrist, Distribution and Quantile Functions: generalized inverse definition and ordering equivalence, including CDF discontinuities.
- Siegrist, Multivariate Normal: conditional bivariate law, affine construction, positive-definite density, covariance transformations, block independence, degenerate definition and MGF. The candidate's general conditional block formula is justified by its own residual/cross-covariance argument and this Gaussian independence result.
- Siegrist, Normal: second/fourth moments, integration-by-parts recurrence and MGF.
- Siegrist, Chi-Square and Related Distributions: independent squared-normal sum, moments, chi density and radial mode.
- Rezende and Mohamed, arXiv `1505.05770v6`, Section 3.1 equations (5)–(7): invertible density transformation, composition and additive log-Jacobian correction. The candidate uses a separately stipulated scalar cubic rather than any paper architecture or experiment.
- Random Services author/rights statement: the actual link is CC BY 2.0. The flow paper identifies an arXiv perpetual non-exclusive license. Both are correctly scoped as scientific references; the latter is not treated as permission to reuse teaching expression or assets.

The reviewed package imports no third-party figures, worked-example data, code, model, dataset, font or notebook. Its input distributions, covariance matrix, finite numeric examples and SVG implementations are separately composed. References are not represented as blanket clearance. Private source snapshots are excluded from all release paths. This review supports the recorded bounded uses, not exclusivity or the rights status of unrelated course files.

The final provenance disclosure correctly narrows the author's original zero-exposure wording: the initial metadata extraction displayed former description fields and one unused language-import line captured from fenced code, as well as the intended identity fields, headings and component imports/IDs. The author reports no exposure to narrative, worked numerical inputs/results, remaining code or figure implementations; those limited extracted fields were excluded from released metadata, and new descriptions and stipulated examples were composed separately. I read the corrected author report and record. This disclosure is not represented as a technically isolated zero-exposure authoring process. All 20 unaffected release files remain identical to the technical-review snapshot; the final 21 record pins and 22 manifest pins match. See `final-freeze-closure.json` for the bounded provenance-only closure.

## Mathematical and computation review

Manually traced the full logic: preimages, branch-dependent CDF/density, endpoint/atom distinction, absolute derivatives, log-normal transformation, generalized inverse proof and continuous-PIT condition; cubic flow bijection/composition and clipping failure; Gaussian construction versus full-dimensional density, determinant and inverse, covariance geometry, affine and singular laws, conditional density denominator, Schur complement residual, degenerate-MGF independence, and the difference between point density and radial mass. The Gaussian shell bound is explicitly for isotropic or whitened coordinates. Both locales have the same formulas and numerical inputs.

The independent `oracle.py` imports no author code. It passed **17,035 assertions in 48 categories**, including:

- Exact Fraction aggregation of discrete masses and affine/Schur arithmetic; a separate Gauss–Jordan inverse.
- 321 CDF values from geometric support intersection; 306 quantile results from independent 160-step bisection; original flow values checked at 64-digit Decimal precision and by differentiation of an independently inverted transformed CDF.
- 362 ellipse points via eigen-coordinate whitening, and all 361 conditional-plot values via eigenbasis joint density divided by the observed-coordinate marginal.
- All 1,503 radial-density samples using integer factorials and the even-dimensional gamma formula, without the author's `lgamma` implementation; explicit finite-window tail and Chebyshev/radius checks.
- Four inline Python snippets executed directly from final note bodies, with exact adjacent saved stdout.
- Both locales' actual rendered SVG polylines reverse-mapped into mathematical coordinates and checked against independent laws, plus example markers, finite bounds, SVG counts and accessible ID references.

The largest difference was `2.126e-11` in the deliberate finite-difference flow derivative check (tolerance `2e-10`). The maximum direct radial-density discrepancy was `2.727e-13`; all other direct formula checks stayed below `1e-13`. Exact counts and per-category errors are in `oracle.json`.

## Fresh rendering and closure checks

Reran the frozen scoped checker from the installed FP repository with `node --max-old-space-size=192`, read-only, rendering only the five components into this peer directory. It passed strict MDX/GFM/KaTeX and actual heading processing with zero reported messages: transformations 108 math spans / 19 displays / 11 anchors per locale; Gaussian 110 / 25 / 12. Fresh result equals the frozen report exactly. Replayed the author fixture script separately: 2,030 assertions, exact JSON fixture closure, exact saved stdout.

Actual Astro output contains six SVGs per locale and all ten plotted series. Reviewed source-level responsive stacking, consistent plot scales, title/description references, line styles, explanatory captions and the finite radial display window. The covariance plot has equal coordinate scales. The conditional plot identifies the variance parameter and the normalized conditional distribution. These are actual component/coordinate checks and static source inspection; no browser screenshot, visual light/dark/mobile pass, or full page build is claimed.

## Findings closed

1. The initial Gaussian density paragraph labeled the forward determinant as the inverse map's volume factor. Both final locales now explicitly identify the forward factor; the displayed density formula was already correct.
2. The initial Gaussian opening implied all later numbers belonged to the two-coordinate example. Both final locales now restrict this to the main numerical example, leaving the discrete, singular and high-dimensional cases correctly scoped.

Read back both fixes and all subsequent author wording/display corrections before checking final hashes. No additional mathematical, source-use, bilingual, curricular-identity or figure-coordinate finding remains.

## Reproduction and boundaries

From this peer directory: `python3 oracle.py` and `python3 verify-closure.py`.

From the installed FP repository:

```text
node --max-old-space-size=192 /Users/fedorpakhurov/code/_work/fp-probability-transform-gaussian-drafts/scripts/notes/check-transform-gaussian-renewal.mjs /Users/fedorpakhurov/code/_work/fp-probability-transform-gaussian-drafts --render-dir=/Users/fedorpakhurov/code/_work/renewal-verification/probability-transform-gaussian-peer/render
```

Evidence: `oracle.json`, `reviewed-files.json`, `scoped-check-stdout.txt`, `author-script-replay.txt` and `render/transform-gaussian-{en,ru}.html`. No installation, model download, training, browser, full build, CI, push or deployment was run. Coordinator second peer, integrated publication gates and live verification remain separate. BIASED derivation must wait for the reviewed FP revision to be published and verified live.
