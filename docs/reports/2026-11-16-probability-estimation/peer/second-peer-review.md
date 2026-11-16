# Independent full peer review: estimators and maximum likelihood

Reviewer: Codex gan_author. Date: 2026-11-16.

PASS for the complete two-topic candidate at `/Users/fedorpakhurov/code/_work/fp-probability-estimation-drafts`, final manifest SHA-256 `4632931f3d25b07a31c3b31948201c8ed0158e888bd6fa074d12f8cb9b658749`. All 25 release paths, 24 joint-record pins and four explicit obsolete-figure deletion hashes match. No remaining scoped finding. This is independent content/technical/provenance/source-component review of the two topics, not complete course rights clearance, a browser visual pass or publication approval.

## Complete reading

Read the current FP policy and course-writing guidance, all four complete EN/RU bodies, all four original figure components, the full companion calculation and scoped checker, both saved figure fixtures, plan, curriculum/figure identities, input-separation disclosure, detailed sources, author review, saved verification/results and joint rights record. The three unchanged first-party rendering/heading helpers were read and pinned in this review sequence and matched against the recorded Git objects.

Both locales preserve the concepts, assumptions, examples, formulas, tables, code/output, heading anchors and causal teaching sequence. The estimator lesson distinguishes parameter/rule/realized estimate, repeated-sample risk, bias/variance/MSE, the n−1 correction, consistency, standard error and model/dependence limits. It does not confuse a risk improvement at one parameter with universal dominance or closeness on every realized sample. The small-sample plug-in uncertainty limitation and unbiased-but-inconsistent example are explicit.

The MLE lesson distinguishes sequence/count likelihood, density from probability, fixed data from varying parameters, log transformations, open/closed parameter boundaries and nonexistence of a maximizer. Gaussian and Laplace loss derivations declare the relevant variance/scale assumptions and produce mean/median objectives with different units. The fitted Gaussian variance case separates Q>0 from all-identical observations. Fisher identities state support, differentiation-interchange and moment conditions; the Cramer–Rao derivation restricts the estimator class appropriately. The shifted-exponential example directly derives its nonregular sampling behavior rather than importing a blanket asymptotic-normality claim. The optional displayed code is complete and runnable without external assets.

## Findings closed

1. The binomial mass and its domain initially shared a long display. The author/root change places the domain on its own aligned line in both locales. Read back and strict parsing passed.
2. Requested aligned RHS breaks for the long MSE expansion, centered-sum identity, covariance-sum identity and Gaussian negative log-likelihood. All four changes are paired and preserve formula meaning; final math/ID parity passed.
3. Found the probability-axis label at baseline47 crossed by the SamplingDistribution top gridline at40. The final component places the plot/grid/axis/truth top at65, retaining the label at47 and mapping probability through145px height. The corresponding actual-render coordinate checker was updated. Independently read the final source and verified the rendered geometry; no arithmetic or fixture changed.
4. Investigated the Bayesian handoff as a possible held link. It is absent from the current withdrawal list and retains published status, so the ordinary next-topic link is valid. That does not clear Bayesian content as an upstream source. No change required.

## Independent numerical verification

The reviewer-owned standard-library `oracle.py` does not import the author's calculator. It passes 1,687 assertions against the saved results. The largest absolute floating comparison difference is `3.979039320256561e-13`, occurring in the complex-step score checks; exact rational reference calculations and the high-precision likelihood evaluation are retained in the oracle.

- Build binomial weights by integer polynomial convolution, independently of the author's binomial-coefficient expression. Verify all six sampling summaries and their exact rational strings, all eight PMF entries and all 202 points of both risk curves.
- Recompute the sample-variance example, enumerate the 16 Bernoulli samples for the correction, and distinguish the exact and plug-in standard errors.
- Compute likelihood ratios as exact rational probabilities and their logarithms using 90-digit Decimal arithmetic. Check all 99 plotted probabilities, four comparison rows and the peak. Independently differentiate the thirteen log factors by complex steps.
- Recompute all 141 Gaussian/Laplace objective pairs from the centered-sum identity and five absolute residuals, including fitted location, variance and normalization constants.
- Enumerate finite-sample score moments and estimator-score covariance at multiple sample sizes; check all four Fisher rows and equality in the Bernoulli bound.
- Verify shifted-exponential relative likelihoods, the product survivor and exact first/second excess moments.

Separately, the fresh author-script execution exactly reproduces its stored JSON and both fixtures, passing 505 assertions. The four literal inline code blocks reproduce the displayed outputs.

## Actual rendering and strict language checks

Fresh serial execution used Node's 192 MiB heap limit and the installed scoped Astro/MDX tools; no full build or browser. The fresh JSON equals the saved author verification. Each locale has 62 math spans/14 displays/12 heading IDs for estimators and 80 spans/16 displays/11 IDs for maximum likelihood. Strict MDX and KaTeX pass; math order, tables, IDs and code/output parity are exact.

The actual Astro render contains four figures and eight SVGs per locale. The author's check verifies 3,744 coordinates. Independent `closure.py` adds 6,130 assertions on the real rendered fragments: every risk, likelihood and loss curve coordinate; all sampling stems/markers; both likelihood maxima and objective minima; corrected probability-label/grid separation; axis/plot bounds; unique IDs and accessible title/description references. All are consistent with the independently checked cases.

The source components stack paired panels below700px, use shared theme color variables and avoid fixed caption heights. Reading and coordinate assertions do not establish glyph extents, viewport-specific line wrapping or light/dark browser appearance. Those remain release browser gates.

## Source rights and identity closure

The plan explicitly predates primary-source reading and fixes all original samples, parameters and constructions. Its release copy equals PLAN.md. The disclosure accurately describes access to historical identity metadata, headings outside fences, Astro import paths, and four later literal figure-ID strings. It does not claim that no historical metadata was seen. No historical descriptions, teaching narrative, examples, source code, results or old figure implementations were output or retained as writing input in this review.

`identity.py` independently re-extracts only this allowed metadata from exact Git revision `9a6815795fdf0a507041044782c5b345616f9a4e`, without displaying or saving withdrawn teaching text. All four identity records and four historical figure IDs match. The current graph, titles, order, prerequisites, 12/11 heading anchors and four figure URL anchors are preserved. The four obsolete figure hashes match that Git revision, and a filename-only consumer scan finds no surviving teaching consumer beyond the replaced four localized bodies and old components.

Read the relevant primary passages in Zhou Fan's Stanford2016 Lectures12–15: §12.2 estimator bias/SE/MSE; §13.1 likelihood and Example13.2 Gaussian optimization; §14.1 consistency and Lemma14.1 score identities/proof; §15.2 Theorem15.4/proof. The author/institution index establishes attribution. The candidate adopts standard mathematical facts and supplies new wording and preselected computations. It does not adopt source-specific data, figures, code or the source's incomplete generic MLE regularity assertions. Its Q=0 qualification improves on the implicit nondegenerate condition in the normal example.

All four PDF hashes, four extracted-text hashes and index hash verify. `source-replay.json` additionally records byte-exact fresh pdftotext extraction for all four PDFs. No reuse license was located in the checked index/documents; the record correctly treats them as reference-only and excludes source snapshots from release. This is not permission to reuse third-party expression or linked assets. No external dataset, model, notebook or image is delivered. Both original-source entries contain authorship, method and verification, with explicit assisted-composition limits. All three helper bytes match their exact Git revision/blob/SHA pins. The joint record's reference entries equal the detailed source evidence and its 24 pins close the complete candidate apart from the record itself.

## Evidence and limits

The external `oracle.json`, `source-replay.json`, `identity.json`, `fresh-check.json`, `closure.json` and `reviewed-files.json` record results and final pins. `evidence-manifest.json` pins the review tools, report, results and actual rendered fragments. The reviewer did not change candidate or release source. No browser, full build, install, CI/Actions, push, deployment or model download ran. Independent root review, integration/global rights-content checks, responsive browser review and live publication remain separate gates. BIASED must wait for the reviewed, published and live-verified FP revision.
