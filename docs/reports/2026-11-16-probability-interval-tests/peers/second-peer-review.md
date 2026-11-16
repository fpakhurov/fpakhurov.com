# Complete independent scoped peer review: confidence intervals and hypothesis tests

Date: 2026-11-16. Reviewer: Codex gan_author, independent of the author sequence_peer and the coordinator root. Result: **PASS for this frozen two-topic package**, with all four review findings closed. Publication, whole-repository gates, browser review, live verification and all-course clearance are separate.

Candidate: `/Users/fedorpakhurov/code/_work/fp-probability-interval-tests-drafts`.
Final manifest: `interval-tests-release-files.json`, SHA256 `0b8726ecad7c5e27571dcec68c0b620e19196d612cfef6419d0492d7e724ea3b`.
Exact reviewed bytes are in `reviewed-files.json`: 24 release paths, 23 matching review-record pins, eight historical replacements and no deleted paths. Candidate/release teaching files were not changed by this peer.

## Complete reading and technical review

Read both complete EN/RU bodies for `confidence-intervals-and-bootstrap` and `hypothesis-tests`, all four new figure implementations, the arithmetic script, the scoped checker, three shared rendering helpers, every author/source/input record, the independent input plan and the identity projections. The supplied original data and output distributions were independently recomputed; no legacy teaching body, example, code, result or figure implementation was supplied to this review. Historical Git reads were restricted programmatically to hashes and the explicit metadata/headings/import/ID projection.

For intervals, checked the fixed-parameter/random-set coverage definition and its alpha domain; repeated-sampling interpretation; exact Gaussian pivot versus CLT approximation; the n>=2 Student pivot, residual independence and n-1 convention; Wilson score inversion and its quadratic; exact binomial coverage below nominal level; the support-preserving effect of clipping Wald bounds; conditional empirical bootstrap, its finite 256-outcome distribution and inverse-CDF percentile convention; Monte Carlo replication versus population information; the all-zero support failure; dependence-aware resampling; and paired fixed-model differences. The text does not promote its small discrete paired normal approximation or percentile bootstrap interval to an exact population guarantee.

For tests, checked level and composite-null supremum, size/power/type-II error, discrete tail p-values including ties, the monotone coupling for p<=0.5, pooled null SE versus unpooled effect CI, prespecified sidedness, practical effect size and equivalence limits, fixed-look versus repeated-look rejection, exact binary first-passage counting, Bonferroni's marginal-validity assumptions, Holm's proof including zero true nulls, and the sharp-null uniform-assignment randomization calculation. The note distinguishes random assignment from permutation invariance and does not infer exchangeability from equal means. The next-topic Markov-chain handoff is plain text; the cross-link within this candidate pair preserves locale and anchor.

The bilingual assumptions, formulas, examples, saved outputs, figure descriptions and limitations agree. All 23 pre-existing heading anchors, both topic IDs, section/order17/18, tags and prerequisite metadata are preserved per locale. Descriptions and teaching material are new. Inline Python remains supplementary and requires no external package/data/model.

## Independent calculations and actual SVG checks

`oracle.py` imports no candidate code. It passes **509 assertions**, maximum absolute numerical disagreement `5.329070518200751e-15`. Methods include a 60-digit Gaussian power series/inversion; Decimal quadratic roots for Wilson; a triple-angle solution of the Student-t4 quantile cubic; multinomial occupancy counts instead of ordered bootstrap tuples; integer Pascal polynomial coefficients; a first-crossing decomposition instead of the candidate surviving-state DP; and fixed-size assignment bitmasks. This checks all saved interval endpoints, 17 interval probability rows, 19 coverage rows, the entire bootstrap mass function and quantiles, paired moments, 13 null/alternative masses, 21 power rows, all A/B values, every repeated-look boundary and exact surviving-path count, multiplicity thresholds and all 20 randomization assignments. Tail and randomization p-values are separately checked for super-uniformity.

Fresh serial Node `--max-old-space-size=192` replay on the frozen candidate passes exact saved results/stdout, 94 author arithmetic assertions, strict paired MDX/KaTeX (75/71 ordered math spans and 13/14 display blocks per locale), 11/12 headings, matching code/imports and valid local anchors. All four figures and their shared wrapper pass Astro and TypeScript TSX syntax. Actual Astro rendering produces four figures/six SVG panels per locale and passes 1,108 data/coordinate assertions. `fresh-check.json` preserves the exact result.

A separate `svg-check.py` then passes **1,750 assertions** on those actual rendered SVGs: every explicit numeric x/y coordinate and rectangle edge lies within its viewBox; line widths encode the independently checked binomial masses; blue/amber coverage and percentile-bar colors match their stated meanings; rejection bars and repeated-look series have the correct semantics; title IDs/descriptions are present and unique; and the dashed bootstrap mean line agrees with its corrected description. The peer initially assumed generic color class names in this extra checker; inspecting the actual dedicated `tail`/`ever` classes and their CSS resolved that checker assumption without candidate changes.

These are source, arithmetic, syntax and actual component-render checks. They do not measure browser font widths, mobile layout, keyboard navigation or deployment. No full build, browser, devserver, install, push or Actions run was performed.

## Primary sources, rights and provenance

All eight selected primary passages were independently read from the exact private snapshots, not inferred from abstracts:

- Neyman1937, II(a), pp.347–349: random confidence limits, equation20, fixed-observation interpretation.
- Student1908, introduction pp.1–2 and I–III pp.3–4,6–8: variance/standardized-mean law; historical divisor n is explicitly distinguished from the modern n-1 convention. Scan pages were read as images.
- Wilson1927, pp.209–211: quadratic inversion, center/half-width and boundary issue. Scan pages were read as images.
- Efron1979, section2 pp.2–4: empirical resampling, conditional distribution, exact enumeration and Monte Carlo. The reference is not presented as proving universal percentile-interval coverage.
- Neyman/Pearson1933, II pp.296–297: critical regions, type-I error and power.
- Johari/Pekelis/Walsh1512.04922v3, sections3–4 pp.11–13, equations1–3: fixed-horizon and stopping-time validity.
- Holm1979, pp.65–67, section2 and Theorem1: familywise definition, step-down construction and proof. Scan pages were read as images.
- Hemerik/Goeman1912.02633v2, section2 pp.3–5 and section3.2 pp.8–9: group invariance versus conditional uniform experimental assignment, Theorems1/3.

`closure.py` verifies all eight PDF and eight text-extract hashes, all per-file mappings, exact unchanged helper Git blobs/SHA values and the pinned first-party checker ancestry. The unchanged pre-source plan is SHA256 `ce50dd3f661e265fe21ba6f8b254e3274f1f8fa9abc212cb6a1875d5deaf4e88`. Whole old-file hashes plus identity-only projections agree with revision `c89a796c778661dbc3dfec1891c0ef2c881830b8`. This local infrastructure revision is not falsely represented as a published BIASED teaching source.

The checked JSTOR wrappers/footers contain restrictions or retained notices. No paper-specific commercial reuse license is inferred. The two official arXiv version pages independently resolve their license links to the [non-exclusive distribution notice](https://arxiv.org/licenses/nonexclusive-distrib/1.0/license.html), a grant to arXiv rather than a general downstream asset license: [Johari v3](https://arxiv.org/abs/1512.04922v3), [Hemerik v2](https://arxiv.org/abs/1912.02633v2). All eight entries use `reference`, with exact locators and no imported source prose, examples, tables, code, data, plots or results. Raw PDFs, text extracts and scan previews are excluded from the release manifest. Original hypothetical inputs, source-visible neighboring examples and existing first-party plumbing are distinguished in the input-separation record. This is evidence of the scoped workflow, not an exclusive-authorship guarantee or legal certification.

## Findings closed against final bytes

1. Holm's division by m0 lacked the zero-true-null case. Both locales now explicitly state FWER=0 when m0=0, then assume m0>=1.
2. Rounded pooled SE was printed with exact equality and reused as the numerical denominator. Both locales now mark it approximate and retain the symbolic exact estimated SE in Z.
3. Bootstrap accessible description implied percentile endpoints/mean were axis marks. Both locales now describe blue bars for [1.5,6.5] and the dashed mean line at3.75, matching the actual encoding.
4. The adapted scoped checker initially mapped only to new original material. Its final per-file record lists both original assertions and the pinned existing first-party validation infrastructure, with a precise mixed-origin explanation.

The author additionally made default Python replay read-only; `--write` is now required to regenerate the saved result. The final replay and after-check manifest closure confirm every frozen candidate byte remains unchanged. No outstanding scoped finding remains.
