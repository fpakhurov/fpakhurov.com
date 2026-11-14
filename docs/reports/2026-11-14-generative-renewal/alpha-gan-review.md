# Alpha-GAN: complete scoped renewal

Author review by Codex course_licenses, 2026-11-14. Both entire languages, two replacement figures, the five-file figure closure, exact-input script, saved data/stdout and scoped checker were read. The candidate passes the recorded local checks. The root coordinator completed the independent scoped review recorded below. Both independent scoped reviews passed; actual full-page visual checks, repository rights/build/CI and publication remain separate. This is not a published BIASED source or a claim of whole-course clearance.

## Replaced material and retained interface

Both bodies are newly composed while retaining the topic, metadata prerequisites/order, all 15 section IDs and both figure IDs. The earlier HSE-LAMBDA spring-2025-long `seminars/07_alpha-WGAN/alpha-WGAN.ipynb` cell narrative, CIFAR-10/Comet/model-chain recommendation, hyperparameter schedule arithmetic, earlier Gaussian code-critic example and random 128-dimensional interpolation results are retired. No old notebook code, data, model, image, seed, measured result or benchmark table is retained in the new teaching scope.

The architecture illustration is entirely replaced by a table computed from a new finite encoder. The interpolation histogram is replaced by explicit three-dimensional endpoints and deterministic radius curves. The legacy filenames `AlphaFlow.astro` and `LerpSlerp.astro` only preserve import/anchor compatibility. The old `src/components/figures/alpha-gan/interpolation.ts` is now unreferenced and should be removed during integration; no other source imports were found in the inspected baseline. It is not part of the new cleared closure. Its removal does not require deleting the shared random helper used elsewhere.

Scientific concepts and primary model citations remain. The new bodies distinguish aggregate versus conditional KL, exact versus approximate classifiers, normalized mixture/class weighting, a practical hybrid objective versus an exact ELBO, gradient penalties versus hard bounds, and interpolation geometry versus a prior-preserving distribution. Broad claims that every VAE is blurry, GANs guarantee sharpness, reconstruction proves coverage, or slerp automatically preserves a Gaussian prior are absent. Source-inspired optional comparisons without a separate teaching role are omitted rather than retained without checking.

## Original finite cases

All inputs were newly specified for the Fedor Pakhurov project with Codex assistance. No claim is made that Fedor personally supplied the constants or that AI assistance guarantees exclusive copyright. All executed code uses Python 3.9.7's standard library, explicit rational inputs and deterministic floating geometric calculations; no PRNG, dataset/model download, learned weight or training run occurs.

The sensor takes values −2, 1 and 7 with probabilities 1/2, 1/3 and 1/6. Encoder rows are (1,0,0), (0,1/2,1/2), (0,0,1). Their aggregate is (1/2,1/6,1/3), compared with a uniform prior. The saved calculation obtains conditional average KL 0.867563228481, mutual information 0.780355204521 and marginal KL 0.087208023961; their identity is checked numerically. Conditional-mean reconstruction gives (−2,1,4) with exact MSE3. A separate encoder independent of the input matches the uniform prior but has optimal MSE41/4.

Exact optimal classifier values are (2/5,2/3,1/2) under equal class weights and (1/4,1/2,1/3) when the prior class probability is 1/3. Corrected odds agree in all three cells. For q_theta=(theta,(1−theta)/3,2(1−theta)/3), the derived KL gradient at theta1/2 is 0.636514168295, also checked by a central finite difference. A step0.1 gives theta0.436348583171 and KL0.054818030399. This is a probability-vector update, not a claim that discrete samples permit ordinary pathwise backpropagation.

The exact one-dimensional transport distance on code locations0/1/2 is1/6. A linear critic with quadratic gradient penalty coefficient2 instead maximizes at slope25/24, with penalized objective49/288. The slope exceeds1, directly demonstrating why that soft objective is not a certified Wasserstein distance. The note derives both branches' comparison rather than treating finite sampled penalty as a theorem.

The new explicit endpoints u=(2,−1,2),v=(−2,2,1) each have radius3 and cosine−4/9. Forty-one path positions reproduce the equal-radius identity and linear midpoint norm sqrt(5/2). With unequal endpoint2v, directly retaining the sine coefficients gives midpoint norm sqrt(261/10), approximately5.108815909778; separate unit-direction and linear-radius interpolation gives4.5. The source-specific random-cloud statistics are not reused or relabeled. These are geometry results and do not claim image quality or prior preservation.

## Primary sources and use boundaries

Exact versions, creators and checked passages are listed in `alpha-gan-source-evidence.json`. Makhzani et al.1511.05644v2 §2–2.1 supports aggregate matching and encoder/training variants. Rosca et al.1706.04987v2 §2–3 supports density-ratio reasoning and the hybrid construction. Its code-only marginal classifier is explicitly distinguished from a conditional KL estimator in the new exposition. Kwon et al.1908.02498v1 §2/Eqs1–3 supports the two-fake-stream α-WGAN weights and grouped encoder-generator update; no MRI architecture, data or empirical output is reproduced. Gulrajani et al.1704.00028v3 §4 supports the sampled penalty and the batch-normalization caveat. White1609.04468v3 §2.1 supports spherical interpolation as a model-exploration method; all displayed endpoint/curve data here are newly chosen and their geometry derived.

The arXiv AAE/α-GAN/Kwon/WGAN pages declare the perpetual non-exclusive distribution license, which is not treated as an adaptation grant. White's exact v3 license link resolves to CC BY4.0, but the use here is reference-only and no source image/prose/code/example is copied. No new redistribution notice is asserted necessary for factual references, and neither library nor repository licensing is extended to data or model weights. The conditional KL decomposition and dimensional-covering argument are derived in the new text; no lecture table, slide or textbook expression is imported.

Existing first-party Figure, language and heading helpers are retained unchanged and were read completely. Their bytes match baseline b06b1f66040c4c4426955a1be0906c5baddc26cb. No prior geometry/random/model helper is included. External Astro/MDX/KaTeX/esbuild dependencies remain operational runtime libraries, not teaching-material permission grants.

## Verification and limits

`alpha-gan-cases.py` recreates the full saved `cases.json` and stdout exactly in Python3.9.7; normal execution compares existing bytes. Exact Fraction checks cover probability normalization, joint/conditional masses, decoder errors, classifier odds, transport and penalty optima. Floating assertions cover KL decomposition, finite differences and all geometric path norms. The checker executes both identical inline Python listings and compares displayed stdout.

Fresh scoped checks passed66 identical mathematical spans, all15 retained anchors, strict actual MDX/GFM/KaTeX compilation and five figure-closure files. Actual standalone Astro rendering produced both figures in both languages, each with wide/narrow SVGs, four SVGs per locale, unique IDs and finite values. As in the preceding CycleGAN checker, the installed-runtime compatibility shim removes only unused generated legacy metadata; it changes no teaching source, geometry or labels. This is not a browser or full-page visual pass. Durable standalone files are in renewal-verification/alpha-gan-render outside the publication package.

Run from an installed FP checkout, supplying the outside-served draft root until integration:

```sh
NODE_OPTIONS=--max-old-space-size=192 node /path/to/draft/scripts/notes/check-alpha-gan-renewal.mjs /path/to/draft
```

The optional `--render-dir=/absolute/review/path` produces the small standalone HTML. `--write` intentionally refreshes authoring outputs; ordinary runs compare them. No model or data is downloaded. The parent coordinator must perform independent review, global gates and publication before a BIASED migration uses this as an upstream source.

During independent root reading, the finite log-odds common-support/interior-probability domain and 0<pi<1 condition were made explicit in both languages. The Russian update sentence was corrected to identify 0.436348583171 as the new parameter value, not its increment. These wording changes leave all computed data, outputs and figures unchanged. The independent root peer closed both wording findings after final readback.


## Independent root peer

The coordinator read both entire localized bodies, both figures and their closure, the fixture, checker, report, evidence and record. All 14 current file pins and three unchanged baseline-helper bytes matched. A fresh 192 MiB scoped run passed 66 paired math spans, 15 anchors, five closure files, two inline outputs and saved stdout; actual standalone Astro yielded four SVGs per locale. An independent 12-ticket oracle reproduced the entropy and reconstruction calculations, all 15 integer transport tables established W1, both critic stationary branches and the cusp were checked, and 41 interpolation positions were evaluated through an orthonormal-basis construction and quadratic norms. Selected primary passages were read freshly: AAE sections 2–2.1; Rosca sections 2–3, equations 3–9 and improved techniques; Kwon section 2, equations 1–3 and training; Gulrajani section 4; White section 2.1. No remaining finding was reported. Durable private evidence: renewal-verification/alpha-root-peer.json and its oracle.py. This is a scoped independent technical/source review, not a full-site browser, CI, production or universal rights certification. The second peer is recorded below.


## Second independent peer

Codex takedown_routing read both entire bodies, both figures/data, retained helpers, fixture, checker, report, source evidence and record. All 14 current hashes matched. Fresh 192 MiB checks passed 66 paired math spans, 15 anchors, five closure files, two inline outputs, saved stdout and actual standalone Astro four SVGs per locale. A separate oracle evaluated six-atom entropy/decoding, 64 decoder proposals, convex binary-classifier optima and corrected odds, a complex-step KL gradient, 90 labeled transport assignments with minimum 1/6, both gradient-penalty stationary branches and the cusp, 41 independent-frame/quadratic interpolation positions and a 64-state second-moment identity. The peer freshly read selected passages and version/rights metadata of all five primary papers and resolved White's exact CC BY4.0 link. Its one precision finding was closed in both languages: the dimensional-covering proof now uses a compact coordinate subset with bounded chart derivative before composing Lipschitz maps. No arithmetic or figure changed. Durable private evidence is renewal-verification/alpha-gan-second-peer/{peer-review.md,oracle.py,oracle.json,render/}. No browser, full build, CI, production or global legal clearance is claimed.
