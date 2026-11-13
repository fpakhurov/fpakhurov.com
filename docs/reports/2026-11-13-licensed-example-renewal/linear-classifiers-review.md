# Linear classifiers: complete scoped renewal

Reviewed 2026-11-13 by Codex `takedown_routing`; bounded independent numerical and bilingual review by `course_licenses`. Scope is the current complete EN/RU linear-classifiers note, both imported figure components and their local dependency closure, the new independent Python verifier, saved results and rendering checks. It does not clear other ML topics or authorize copying from the bibliography.

## Replacement boundary

The prior note explicitly cited ESL Table 12.1 and displayed a loss/minimizer/probability-recovery table with a single conditional-probability example. Direct access to the full primary ESL PDF failed in the preceding audit. Rather than claim this arrangement independent without comparison, the entire note body has been newly composed and that presentation removed. Earlier conceptual attribution remains in the bibliography. Topic identity, frontmatter, prerequisite graph and section anchors are unchanged.

The new central problem asks whether a linear score can recover a specified nonmonotonic conditional distribution: three equally probable feature values have positive-label probabilities 1/8, 7/8, 1/8. The pointwise solution, symmetry-constrained linear optimum, exact risk and representation limit are derived and executed here. This is not a renamed version of the old table. In particular, ordinary probability calibration of the pooled constant predictor is distinguished from recovery of feature-conditional probabilities.

Other new independently specified fixtures are an exact-fraction least-squares fit before/after a high-leverage positive example, seven fixed labeled geometry points, a perceptron visit trace and exhaustive binary-label enumeration on a parabola. No external rows, model weights, benchmark measurements, paper code or diagrams are inputs. New text, code and fixtures were composed for Fedor Pakhurov's project with Codex assistance; this is not an assertion of guaranteed exclusive copyright in AI-assisted material.

Both figures were reauthored. The prior generic overlaid-loss-curve presentation is replaced by a per-observation loss table tied to the seven new geometry points. This also avoids reproducing the distinctive presentations in Bartlett et al. Figure 1 or HSE's threshold-approx.eps. The old random Gaussian clouds and PRNG import are gone; all coordinates are explicit in planeData.ts. The narrow regressionGeometry.ts helper contains only affine SVG scaling/polyline arithmetic and is already separately reviewed; it introduces no source-specific random code.

## Source comparisons and decisions

| Source | Exact checked material | Current use and boundary |
| --- | --- | --- |
| Bartlett, Jordan, McAuliffe, JASA 2006 | Full paper PDF retrieved; section 2 Theorem 2, conditional risks in section 2.4, Figure 1 inspected | Factual calibration criterion and elementary conditional-risk identities. No paper plot/table/code, distribution fixture, theorem wording or experiment adapted. New text explains restrictions and derives its own finite distribution. |
| Freund, Schapire, 14 December 1998 preprint of the 1999 paper | Sections 2/3.1, Theorem 1 via primary paper text; metadata checked against publisher | Perceptron update and Block–Novikoff inequality. New implementation and input trace; no voted-perceptron algorithm, digit data or experimental outputs reused. The standard short inequality is scientific attribution, not a claim of a newly discovered bound. |
| Cover 1965 author-hosted PDF | Function-counting Theorem1, definition of general position, affine/feature augmentation and probability section | Exact counting formula with d+1 affine parameters. The finite parabola enumeration is newly specified and exhaustive; no source diagrams or empirical trials used. |
| Höffgen, Simon, Van Horn 1995 | Publisher abstract and metadata | Narrow statement of computational hardness in the source learning setting. No stronger universal assertion about every finite dataset, no copied reduction. |
| Rosenblatt 1958 | Primary publication/title historical attribution retained; classical rule checked in Freund–Schapire | Historical credit only; no paper prose, machine image or experimental data. |
| ESL, second edition, 2009 | Earlier citation and table dependency recorded in foundations report; full primary PDF remained unavailable | Earlier factual credit retained. Former table/arrangement removed, current whole body and examples newly authored. No full historical expression comparison or reuse permission claimed. |
| E. A. Sokolov, HSE lectures 4/5 | Exact TeX files at 2f83a89d0ce6a630c882f63dc68a597ba6d9caf2; lecture 4 linear-classification/margin/upper-bound sections and threshold-approx image reference; lecture 5 conditional-risk/logistic sections | Conceptual attribution retained, no default adaptation license established. No source advertising-click/1000-repeated-example exercise, bank-marketing data, plotted asset or code used. Source inequalities and tie conventions were not carried over uncritically. |

PDF/TeX reference copies were kept outside the repository in `/tmp/classifier-source-review`; they are not distributed. The evidence JSON records bytes/hashes of files actually retrieved, and separately identifies sources read through the web tool. A bibliography entry or source download was not treated as a reuse license.

## Technical corrections included

- Score-zero prediction is explicitly +1. The conservative count `[margin<=0]` upper-bounds classification error under that rule; equality is not falsely asserted at ties.
- Functional margin is scale-dependent and not itself a probability; distance divides by nonzero weight norm.
- Base-two logistic scaling leaves an unregularized minimum unchanged, but changes the tradeoff with a fixed unscaled regularizer.
- Convexity rules out nonglobal local minima; existence and numerical convergence are separate conditions.
- Conditional optima are stated for interior probabilities; hinge ties and endpoint half-lines, plus infinite logistic endpoint scores, are explicit.
- The pooled constant 3/8 probability is calibrated when grouped by its prediction, while failing to recover conditional probabilities at each feature value.
- Fixed cyclic perceptron updates are incremental subgradient training; random selection gives the stochastic interpretation. The chosen nonzero subgradient at zero is explicit.
- The perceptron proof uses the augmented feature space including bias. It bounds updates, not epochs or generalization error.
- Cover's assumptions and affine parameter count are explicit. Exhaustive finite enumeration replaces the previous random-label LP experiment.
- Strong convexity/coercivity applies to a penalty on all parameters. An unpenalized bias requires separate conditions; the usual hard-margin geometry is distinguished and assumes both classes and strict separability.

## Execution evidence

`python3 scripts/notes/linear-classifiers-renewal.py` recomputes all saved results; `--write` is the explicit regeneration mode. No downloads or third-party Python packages are needed.

- Exact OLS: base slope 10/29, intercept 5/29, boundary −1/2, 0 errors; added positive at 40 gives 106/3353, −135/3353, boundary 135/106, 1 error.
- Geometry: margins 4, 3, 1, 2, 4, −1, −3; projection (1.4, 1.8); distance 4/sqrt5; error 2/7. Average logistic 1.007191975, hinge 6/7.
- Conditional fixture: flexible logits ±log7, loss 0.543564443, error 0.125; linear weights (0, log(3/5)), loss 0.954434003, error 0.375. Both gradient components vanish and the full-rank positive-weight Hessian establishes uniqueness.
- Perceptron:3 updates, final (3, 0, −1), margins 5, 4, 8, 1. Unit witness (2, 0, −1)/sqrt5 gives R² = 11, gamma² = 1/5, bound 55.
- Parabola enumeration: n = 3: 8/8; n = 6: 32/64; n = 7: 44/128; n = 9: 74/512, exactly matching Cover's count.

`node scripts/notes/check-linear-classifiers-renewal.cjs` executes both figure frontmatters for both locales, compiles the Astro components, checks every math span with KaTeX, checks exact EN/RU formula and Python-block parity, replays the standalone inline code against its saved output, and compares TypeScript/Python geometry margins. Targeted diff whitespace checks passed. Browser appearance, whole-site build, link checks, source-rights CI, production publication and subsequent BIASED adaptation remain separate parent release checks.

No unverified source-specific asset remains identified within this recorded current scope. This is an evidence-bounded editorial decision for the listed files and intended use, not legal certification or a complete similarity scan of every cited publication.

Independent reviewer `course_licenses` read both complete localized bodies and all three local figure/data sources, replayed both checks and independently recomputed the key fractions, risks, counts, geometry and mistake bound. After the calibration wording correction, no mathematical or bilingual blocker remained. `npm run rights:check` recognized this current review but was blocked by another agent's in-progress `scripts/notes/mlops-data-cases.py`; it is not reported as a full-repository pass.
