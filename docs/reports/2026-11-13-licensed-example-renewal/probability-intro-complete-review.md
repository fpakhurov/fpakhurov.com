# Probability introduction: complete recorded-scope renewal

Date: 2026-11-13. Author/source/math review: Codex takedown_routing. Scope: both complete `probability/what-probability-is` notes, both displayed figures, their local teaching dependencies, original numerical verification and saved evidence. Independent peer review and release checks are separate. This is a bounded material-use decision, not legal certification of the entire probability course or either site.

## Retired and replaced material

The previous medical screening example, its claimed clinician study, its rounded population counts, and the Charig kidney-treatment table are entirely removed from EN/RU, executable examples and figure code. The former fair-coin paths, seeds, saved checkpoints and approximate 95% band are removed. The familiar 365-day/23-person worked case and its simulation are removed too. This decision does not assert that citing the papers or teaching general conditional probability is prohibited. It avoids retaining those source-specific teaching artifacts without an appropriate asset review.

New material was specified for this project with AI assistance, rather than by renaming the old cases:

- A three-category finite queue population, with two distinct input mixes and fixed category-specific long-job shares. Explicitly selected uniform finite rows give `16/33` and `32/39` for archive restoration conditional on a long task. The second population changes the initial mix and retains the conditional rates. These are specified inputs, not collected service data.
- A deliberately small 64-label independent uniform identifier model. Exact counting finds the first half-probability collision threshold at ten objects; nine and ten have probabilities approximately `0.445226` and `0.523241`. This instantiates general occupancy mathematics. No claim of novelty for the birthday mechanism or of accuracy for a real hash implementation is made.
- A new three-stratum comparison specified in this renewal workflow: A has `(3/4,4/8,2/8)` and B `(8/12,1/3,0/1)`. A exceeds B within every stratum; pooled rates reverse (`9/20 < 9/16`). A new equal-stratum target population gives `1/2 > 1/3`. The table does not establish causal benefit or statistical precision. No kidney-treatment data or source diagram is retained.
- A measurement mechanism with independent equal-probability errors `-2,+2`, then a shared independent batch offset `-1,+1`. Exact finite distributions yield variances `4/n` and `1+4/n`. The distinction between random batch effects and a fixed unknown bias is explicit.
- New illustrative Bernoulli paths use `p=3/8`, length 4096 and seeds 101,103,107 with the already reviewed Mulberry32 helper. The helper's source is preserved and is not claimed as an original random-number generator. No confidence band, monotone-path guarantee or empirical convergence proof is claimed.

The topic ID, frontmatter course/order/prerequisites, all nine heading IDs and both existing figure anchors remain. The held NLP n-gram link was removed from the overview. No curriculum or prerequisite graph change was made.

## Scientific and licensing source decisions

| Source and exact checked scope | Actual use and boundary |
| --- | --- |
| Alan Hájek, *Interpretations of Probability*, SEP, substantive revision November 16, 2023; sections 1, 3.1, 3.3.1–3.3.4 and 3.4 | Factual reference to interpretation versus calculus, equal-probability assumptions, credence/coherence and frequency readings. No source examples, quotations, figures or code reproduced; no open reuse license asserted. Author name confirmed in the page copyright footer. |
| Kyle Siegrist, *Probability, Mathematical Statistics, and Stochastic Processes*: Conditional Probability, Definitions/product rule/partition; LLN, Moments and Weak/Strong Laws; Birthday Problem, Sampling Model and Simple Birthday Problem | Definitions and mathematical claim checking. The actual website declares CC BY 2.0 at its Rights and Permissions footer, explicitly permitting commercial adaptation with credit and a home link. The linked CC BY 2.0 deed was read. This is **not** CC BY 4.0. The present use remains reference-only: no source teaching exercise, prose, drawing, program or dataset is copied. The actual license is disclosed in the bibliography without licensing our new material under it. |
| Judea Pearl, *Understanding Simpson's Paradox*, UCLA report R-414, December 2013, sections 1–2, especially the distinction between reversal arithmetic and causal interpretation | Primary factual reference for why the table alone cannot select a causal adjustment. PDF downloaded from the author's UCLA site and passages read via text extraction. Source examples, figures and wording not reproduced. No source reuse grant asserted. |
| bryc, Mulberry32 JavaScript at commit `88c1317ea6f9b25c153afa9c369c365fed11b482`, `jshash/PRNGs.md` opening public-domain declaration and Mulberry32 section; original algorithm Tommy Ettinger (2017) | Actual code reuse through unchanged `random.ts`; Python uint32 transcription explicitly credited in its header. The embedded public-domain declaration was reread and implementation compared. Existing pinned source/dedication notice remains delivered in `public/licenses/mulberry32.txt`. Source warning about limitations is respected: only finite teaching illustrations, no cryptographic or general simulation-quality claims. |

Fetched source-representation SHA-256 hashes and canonical URLs are retained in `probability-intro-source-evidence.json`; scratch copies stay outside the repository. For mutable reference pages these identify the checked bytes, not an assertion that the public URL is immutable. The pinned generator commit identifies the reused code revision. The source-evidence file does not contain redistributed third-party source content.

Current OpenStax Introductory Statistics 2e pages were inspected as a candidate and found to carry CC BY-NC-SA and an additional AI-ingestion notice. They were excluded from adaptation and are not a source for the replacement. This finding does not relabel historical versions or revoke any independently established earlier grant.

## Whole-note corrections and source boundaries

- A deterministic classifier need not output probabilities; not every learning objective is a likelihood. The likelihood, regularizer/prior and fixed-classifier test-error connections now state conditions rather than universal equivalence.
- Lack of information does not establish a uniform sampling mechanism. Finite frequency and assigned probability are separated.
- Coherent probability assignments and empirical calibration are distinct. The course chooses a standard probability framework without asserting philosophical unanimity.
- For independent Bernoulli trials, expectation, variance, root mean squared error and a weak-law bound are given with their conditions. The square-root rate is not a deterministic per-path error bound. There is no normal approximation at tiny n or simultaneous-path coverage claim.
- Conditional reversal names both denominators and requires a positive conditioning probability. The three-category construction is exact rather than rounded.
- Collision products are conditional avoidance probabilities, not an independence assumption for all pair events.
- Pooled rates, common-weight standardized rates and causal effects are kept distinct. The note does not prescribe conditioning on every variable.
- Shared random error leaves a variance floor; a fixed bias instead contributes its square to mean squared error. Adaptive model selection is not justified by a pointwise law of large numbers.

Both bodies were read in full as part of authoring; all imports and their transitive teaching files were inspected. `Figure.astro`, `lang.ts`, `random.ts` and the heading-ID plugin remain byte-unchanged. Generic first-party rendering helpers are retained with their existing attribution boundaries; `random.ts` contains the separate reviewed generator source. The verifier renders with current global application CSS; that is a rendering dependency, not a new third-party teaching asset or a clearance claim for the site's full styles.

## Verification and observed scope

Commands run from the FP worktree:

```sh
python3 scripts/notes/probability-intro-cases.py
node scripts/notes/check-probability-intro-renewal.mjs
```

The optional `--write` flags regenerate the corresponding saved evidence; the default commands compare it. `--render` on the Node command retains standalone preview HTML.

Observed checks:

- Exact `Fraction` conditional counts and posterior fractions for both 200-row populations. Explicit row counts independently match the weighted formulas.
- Exhaustive identifier sequences for every label count 1–4 and sample length 0–5 match the product formula, including empty/singleton and pigeonhole boundaries. Exact 64-label values and first-half threshold recomputed separately from displayed decimals.
- All within-stratum inequalities, pooled fractions and equal-weight rates recomputed.
- All independent sign vectors and shared-offset variants for sample sizes 1–8 enumerated; exact first and second moments equal the stated formulas.
- Independent Python uint32 arithmetic matches SHA-256 hashes of all 12,288 cumulative counts generated by the TypeScript figure helper. Final frequency labels come from these same arrays.
- All 42 mathematical spans match between locales; strict KaTeX succeeds, actual MDX recognizes every display-math block, and nine expected headings are preserved. Both standalone Python examples produce saved stdout exactly. The same-line display-delimiter regression is explicitly rejected.
- Actual Astro rendering succeeds for both new components in each locale; two figure anchors are preserved and no duplicate IDs, `NaN` or `undefined` occur.
- Eight standalone Chromium configurations: EN/RU × 390/1000px × light/dark, with no page overflow or SVG text outside its viewport. Screenshots `ru-390-dark` and `en-1000-light` were opened and visually inspected. Labels, panels and captions are readable without overlap. Saved measurements are in `probability-intro-visual-checks.json`.

Default Python was 3.9.7; the exact rational and uint32 oracles do not depend on NumPy or downloaded assets. The inline displayed decimal output records this run. Node version was 22.22.3.

Full note-page layout, site build, CI and production deployment are outside this author pass and remain release checks. Passing arithmetic, source inventory or a machine-readable gate is not a claim of complete rights clearance for other topics.

## Independent peer review

Codex course_licenses completed a full read of both note bodies, both figures, cases.ts, both verifiers and the Figure/random/lang teaching closure. Fresh Python and Node runs passed. Separate calculations enumerated both finite task populations, all sign-vector error cases for n=1..8 and Bernoulli distributions for n=1..8; factorial occupancy probabilities for n=9,10, the stratum comparison and measurement standard deviations agreed. The peer checked the primary Siegrist definitions/LLN/birthday passages, actual CC BY 2.0 link, and selected Hájek passages afresh. Its independent request to Pearl's host timed out; it read sections 1–2 through the cached author-hosted PDF extraction captured and hashed in this review, rather than claiming a second successful network retrieval.

The peer visually inspected the author-run RU390dark and EN1000light screenshots and found no issue; it did not run a second browser session. Final readback verified all 17 current file hashes, the explicit Python PRNG adaptation credit, the refined Russian fixed-bias wording and all seven source decisions. No substantive mathematical, bilingual, source-boundary or recorded-scope blocker was found. This pass does not establish rights for other notes, full-page layout, CI or production state.

## Coordinator full-page release check

Codex root rendered the actual full Astro topic pages in EN/RU at 390 and 1440 px, in light and dark themes. All eight views had no document overflow, KaTeX errors, font errors or clipped visible SVG text. Both RU mobile figures were opened and visually inspected; labels, captions, plotted values and panel spacing are readable. The measurements are saved in `probability-intro-full-page-checks.json`. This is local browser evidence, separate from CI and publication.
