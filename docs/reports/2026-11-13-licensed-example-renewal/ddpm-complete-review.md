# DDPM reverse process and training objective: complete scoped renewal

Reviewed 2026-11-13 by Codex `course_licenses`. This report covers the complete EN/RU `generative-models/ddpm-training-objective` note, all seven imported teaching figures and their local dependency closure, its inline NumPy experiment, and the replacement optional practice. This is a file/use-specific decision, not clearance of the entire Generative Models course or assurance against every possible historical source. The coordinator's independent review, browser rendering, CI and publication are separate stages.

## Material decisions

| Material | Decision and evidence |
| --- | --- |
| Reverse-Markov lemma, chain ELBO decomposition, image-to-noise parameterization route | Retain as an explicitly attributed adaptation of BMML lecture 5, section 5.4 / Lemma 1. The pinned repository LICENSE grants MIT permission for software **and associated documentation**. The exact copyright and license are delivered in `public/licenses/bmml-ftda.txt`, linked beside the dependency in both notes. Intermediate algebra and bilingual explanation are expanded locally. |
| Mathematical DDPM method and cited research results | Credit Ho, Jain and Abbeel's primary paper. Compare its equations 5–14, algorithms 1–2, sections 3.2–3.4, Table 1 and Appendix B. No arXiv submission license is treated as a reuse grant for paper artwork or implementation. The note reports the paper's FID and NLL-bound values as cited findings, with their training-set FID reference, not local model results. |
| Old HSE diffusion notebook walkthrough | Remove the complete source-specific Swiss-roll/ConditionalLinear/mirrored-timestep/EMA procedure from the recommended practice. The earlier batch had removed only its CelebA homework recommendation; that was not enough to finish this note. No original HSE notebook, face dataset, checkpoint or implementation is downloaded or executed by the replacement. This records the historical dependency rather than recasting it as original work. |
| Replacement practice | Retain the already independently reviewed project-authored standard-library experiment: 256 rank-one 8×8 cosine/stripe signals, fixed seed 9304, Gaussian amplitude prior and Gaussian noise. Add its explicit posterior derivation and limitations to both notes. This is conditional estimation for a one-degree-of-freedom signal, not U-Net training, a reverse sampling chain or evidence of image-generation quality. |
| Existing inline NumPy example | Inspect its full code and replay it in a fresh execution namespace. It simulates a scalar two-step Gaussian conditional, calculates schedule weights, then samples two-point data with an analytic conditional-mean oracle. No source data/model/benchmark is consumed. Both locales now contain identical code, including English comments. Existing code is not falsely described as newly written during this renewal. |
| Seven code-native figures | Full source and bilingual caption/description review; no external image payload or source figure file is imported. Compare the cited lecture diagrams and primary paper architecture facts. Local numeric fixtures and arrangement are recorded below. Shared Mulberry32 code has its own source-specific public-domain notice; it is not relabeled MIT. |
| Isachenko and Murphy | Retain scientific/background citations. Compare the relevant Isachenko lecture TeX and diagram assets with the local diagrams; do not infer an adaptation grant from a citation. Murphy remains a background reference with no extracted figure, example, table, code or quoted passage. Full book prose comparison was not performed. |

The BMML source PDF itself credits third-party figures. Its repository's MIT grant is **not** extended to those third-party illustrations; none is used here. The adaptation notice covers only the identified documentation material.

## Pinned primary evidence

- BMML: commit `e68351cda47e224e0fe3465f2780ca7ff37b330b`; [lecture 5](https://github.com/bmml-team/bmml_ftda/blob/e68351cda47e224e0fe3465f2780ca7ff37b330b/Lectures/lecture_5.pdf), PDF blob `d4c0c8d0ccb74aeb0b745b44cfcf5341b7bc91b2`; [MIT LICENSE](https://github.com/bmml-team/bmml_ftda/blob/e68351cda47e224e0fe3465f2780ca7ff37b330b/LICENSE), blob `d99a154d04e565bfe4166956485927f96f1ba3f3`. Copyright (c) 2026 Bayesian Methods in Machine Learning. The full PDF text was extracted locally; the relevant lemma/proof/decomposition and diagram credits were inspected.
- Ho, Jain, Abbeel: [arXiv:2006.11239v2](https://arxiv.org/html/2006.11239v2), primary method and experiment comparison. Table 1 gives NLL **upper bounds** 3.75/3.70 bits/dim, not exact likelihoods. Appendix B gives the four CIFAR-10 resolution levels, attention at 16×16 and EMA 0.9999.
- Sohl-Dickstein, Weiss, Maheswaranathan, Ganguli: [arXiv:1503.03585v8](https://arxiv.org/html/1503.03585v8), section 2.2. Its small-step motivation refers to Feller; the note now distinguishes a local Taylor argument from a global conditional-distribution claim. Feller's original paper is not separately claimed to have been compared.
- Nichol, Dhariwal: [arXiv:2102.09672v1](https://arxiv.org/html/2102.09672v1), Appendix **G**, Figure 17 for the EMA sweep. The prior citation incorrectly named Appendix F; corrected in both locales.
- Isachenko: commit `3d0e73d96a3a08a908348e34b57a138efea5485e`, [Lecture7.tex](https://github.com/r-isachenko/2025-DGM-MIPT-YSDA-course/blob/3d0e73d96a3a08a908348e34b57a138efea5485e/lectures/lecture7/Lecture7.tex) blob `b2943212680f8f2db1791e623eb26f0f6ece15d4`, [Lecture8.tex](https://github.com/r-isachenko/2025-DGM-MIPT-YSDA-course/blob/3d0e73d96a3a08a908348e34b57a138efea5485e/lectures/lecture8/Lecture8.tex) blob `2f02e99d7dea2b72191bd0df5fd217b241edfc4a`. Compared reverse-step motivation, ELBO/parameterization math and diagram references. Visually inspected `DDPM.png` blob `52bcb48048648eaa889b699e057209ef10632e04`, `diffusion_objective.png` blob `5d242397abc2d9657f41b10f42ef4e66cc2f947f`, and `diffusion_pgm.png` blob `fb991e062e420057fece6b8aa0e4e983d61987dc`. These contain source photos/chain illustrations; the local code neither imports those photos nor reproduces those figure assets.
- Historical HSE practice: commit `42dd64b535f5bedf1d2b3db28f2f21ce96c9f09f`, `seminars/10_Diffusion-Models/02_DPM_Models.ipynb` and `homeworks/04_hw_diffusion.ipynb`. The old source-specific execution recommendation is removed. The previous audit's third-party data/implementation restrictions are not erased or purportedly cured by an umbrella repository license.
- Shared PRNG: [bryc/code `88c1317ea6f9b25c153afa9c369c365fed11b482`](https://github.com/bryc/code/blob/88c1317ea6f9b25c153afa9c369c365fed11b482/jshash/PRNGs.md#mulberry32), explicit embedded public-domain dedication; original Tommy Ettinger C gist revision `fc93b8ad259c09a3635d80ed12a05309120795dc` has the CC0 dedication. Previously independently verified by root; `public/licenses/mulberry32.txt` is included unchanged.

## Complete figure/dependency pass

| Local figure | Inspected content and verification |
| --- | --- |
| `InverseProcessChain` | Formula-created 8×8 ring/dot with 24 foreground cells; shared Gaussian draw seed 11; alpha-bars 1, .6, .42, 0. All 256 displayed cells independently recomputed. Caption now says marginal snapshots, **not a Markov trajectory**, and calls the zero-alpha-bar endpoint a limit. |
| `AllPathsIntegral` | Eleven local four-mode random bridge curves with seed 7; 41 points each, separately laid out wide/narrow. Endpoints verified; caption explicitly schematic, not a trained diffusion trajectory or numerical likelihood estimate. |
| `PosteriorGraph` | Local three-node conditional-distribution schematic with explicit extra x0 condition; full wide/narrow geometry inspected. Does not import the source lecture's two-row PGM or photo-containing chain artwork. |
| `EqualVarianceKL` | Two unit-variance Gaussians with local means −1.3 and 1.4; gap 2.7 and KL 3.645. Independently integrates q log(q/p) to confirm the squared-distance result. |
| `TrainingStep` | Diagram aligned with Algorithm 1: t ranges 1…T and the displayed loss has unit weight. The weighted KL sum for t≥2 is distinguished from the separate decoder term. Old mixed ranges/labels and a stale notebook claim removed. |
| `LossWeight` | Local direct evaluation of the mathematical weight for the paper's stated schedule, not a traced paper plot. Both variance choices checked for finite values for t≥2; minimum t=349 agrees with independent Python. |
| `DenoiserFlow` | Local stage schematic of the architecture described in the paper, with separate time-conditioning bus and stepper. Caption states boxes condense resolution stages and the diagram is not an executed network. No model code or weights included. |

Dependency closure inspected: `Figure.astro`, `geometry.ts`, `lang.ts`, five `seqflow` components, `tones.ts`, `generative-modeling/Sub.astro`, and `sampling.ts` (used here for `subParts`). The latter's unrelated distribution demonstrations are not shown/executed by this note, and this review does not clear their use in another course page. No shared helper was changed. The shared random generator's source and notice remain explicit.

## Corrections and reproducibility

The renewal also corrects claims that could mislead readers. Root independent reading additionally caught the expectation over a fixed x0 and the opening training shorthand; both are corrected in EN/RU:

- In L(x0), the noise-loss expectation is over epsilon; the outer data expectation belongs to the training objective. The opener now describes the basic objective, not a full training system, as one line.
- Local small-step Gaussian approximation is qualified by smoothness/concentration and excludes an atomic endpoint; Gaussian data can have exact larger reverse steps.
- The factor T−1 must be retained relative to L0 when estimating the full bound.
- Returning the final mean is distinguished from the discrete decoder and from a zero-variance continuous endpoint.
- Interior-bin assumptions are stated for the 0.305/0.456/0.239 decoder calculation.
- The two-point Monte Carlo check is a finite seeded tolerance check, not a proof of equality of distributions.
- Small-noise steps are not universally easier noise-prediction tasks. EMA and clipping do not guarantee better samples or bound every adaptive optimizer's update.
- The displayed sinusoidal frequency rule is identified as a common convention rather than an exact implementation byte match.

Executed locally, without model/data downloads:

```sh
OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 /Users/fedorpakhurov/code/_work/courses/s/venv-ml/bin/python scripts/notes/check-ddpm-renewal.py
node scripts/notes/check-ddpm-figures.cjs
```

The Python verifier freshly executes the identical EN/RU inline code and checks exact displayed stdout. Independent calculations use joint-Gaussian conditioning, normal CDFs, posterior-parameterization identities and analytic Bayes risk. Saved evidence: `ddpm-numerical-checks.json`. It reproduces first 1%-ambiguity step 110, gap 0.736631, short-chain final ambiguity 0.743741, bin probabilities, EMA initial weights, and the optional synthetic practice.

The JS verifier evaluates seven figure frontmatters in both locales, compiles all seven figures plus seven imported Astro components, strictly compiles both MDX bodies and checks all **434 math spans per locale**. Math multisets match after only whitespace, localized thousands separators and the translated “other states” label are normalized. Saved evidence: `ddpm-figure-checks.json`. This is compilation/numerical validation, not a browser layout or full build assertion.

The previous `generative-ddpm-training-objective-practice-maintenance` record is retired as withheld/superseded, preserving its historical limited scope. The new complete record names exact current hashes. Current edits and new checks were authored for Fedor Pakhurov's project with Codex assistance; neither the user's personal authorship of every constant nor blanket rights in cited works is asserted.
