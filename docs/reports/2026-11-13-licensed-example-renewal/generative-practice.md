# Generative-model practice replacement: bounded first batch

Date: 2026-11-13. Authoring and execution: Codex `course_licenses` for the Fedor Pakhurov project. Independent mathematical, execution and bilingual review: Codex `gm_practice_review`.

This first-stage snapshot records replacement of optional external-practice walkthroughs in nine topics, in both languages. It does **not** complete the historical body/figure/source review of these notes or the course. Each note therefore has a `scope: maintenance` record. Only the newly written verification script and its generated result file have a complete record.

The replacement exercises are deliberately small mechanism demonstrations. They preserve a concrete learning route without an unresolved data/model dependency, but they are materially narrower than full neural-network training laboratories. No image-generation quality, speech quality, learned perceptual metric, large-model training or production benchmark is claimed. Further complete-note renewal must assess and, where necessary, replace the unchanged material separately.

## Delivered material

- [Standalone Python script](../../../scripts/notes/generative-practice.py), containing nine independently specified experiments. It uses only `argparse`, `itertools`, `json`, `math`, `random` and `statistics`; there are no network requests, input-file reads or model downloads.
- [Full saved output](generative-practice-results.json), produced by `python3 scripts/notes/generative-practice.py` under CPython 3.9.7. A selected experiment can be run by appending its topic slug.
- Eighteen localized practice passages. All titles, frontmatter, headings, anchors, scientific references, existing Code sections and imported figures are unchanged. For DDPM, only the final CelebA homework paragraph was replaced; the preceding external diffusion-notebook procedure remains outside this correction.
- Nine per-topic maintenance records, named `content-rights/reviews/generative-<slug>-practice-maintenance.json`, and the specific complete record [generative-practice-verification.json](../../../content-rights/reviews/generative-practice-verification.json).

All synthetic observations and code were newly authored with Codex assistance. No old notebook examples, measured scores, source images, audio clips, benchmark records or pretrained weights were renamed into the replacement. Mathematical concepts are not claimed as inventions. Existing scientific citations remain in the notes.

## Replacement boundaries and measured results

| Topic | Removed optional-practice chain | New independently specified calculation and saved evidence |
| --- | --- | --- |
| WGAN | CelebA training walkthrough and interrupted source-run description | Translated empirical scalar samples: exact W1 0.65; unconstrained linear gaps 0.65/1.95/5.85; soft-penalty optimum slope 1.08125, explicitly above the Lipschitz bound. |
| VAE | CelebA convolutional VAE procedure | Four scalar observations and a Gaussian decoder/encoder: mean ELBO −1.996397, log likelihood −1.633903, posterior-KL gap 0.362494; separate reparameterized Monte Carlo expectation. |
| StarGAN | CelebA task and StarGAN/v2 notebook procedure | Three-coordinate analytic content/domain/style map: cycle error alone cannot reject identity; target-domain accuracy and style separation distinguish it. No adversarial training claimed. |
| Flow architectures | `nflib` implementation walkthrough and CelebA VAPNEV task | New 2-D coupling/swap/scaling composition; inverse error below 1e−12 and finite-difference log-determinant error below 1e−8. |
| Normalizing flows | `nflib`-linked training recipe, absent external data file | Newly generated Gaussian observations; correct density integrates to one, omitted-Jacobian expression to 1.605013. Doubling scale improves only the invalid objective. |
| DDPM objective | Final CelebA homework paragraph only | Procedural 8×8 cosine/stripe signals: conditional noise MSE 0.014848 versus zero-prediction 0.995149; reconstructed-signal MSE 0.012148. One analytic denoising step, no U-Net or reverse-chain training. |
| Audio generation | Speech checkpoint procedure, MusicGen weights and GTZAN continuation | Newly synthesized two-tone signal; scalar residual quantization MSE 0.020684 → 0.001261; five synthetic frames/three codebooks require seven delayed steps and reconstruct exactly. |
| Drag editing | External apps and GAN/diffusion checkpoint procedure | New 2-D feature field: full features recover (1,1), an ambiguous feature picks (1,−3); translation optimization leaves 0.001784 handle error and moves protected points too. No actual DragGAN/DragDiffusion run. |
| Autoregression | Movie-poster PixelCNN procedure | Newly generated binary Markov sequences, disjoint fitting/evaluation sets: 0.668339 held-out bits/symbol versus uniform 1; exact normalization over all 4096 sequences; conditional completion preserves its prefix. |

## Source decisions

The previous dependency findings and pinned primary evidence remain in [the Hugging Face and AI source review](../2026-11-13-licensed-source-renewal/huggingface-and-ai-review.md). The new script adopts none of those external artifacts, so it does not infer a dataset/model grant from a library license.

- HSE-LAMBDA code at `42dd64b535f5bedf1d2b3db28f2f21ce96c9f09f` has a [root MIT license](https://github.com/HSE-LAMBDA/DeepGenerativeModels/blob/42dd64b535f5bedf1d2b3db28f2f21ce96c9f09f/LICENSE). That grant does not resolve third-party inputs embedded in or downloaded by its notebooks. This batch removes the specified walkthroughs rather than reusing their implementations.
- [CelebA's primary project page](https://mmlab.ie.cuhk.edu.hk/projects/CelebA.html) describes its noncommercial-research availability. No face photographs or CelebA loader are part of the new experiments.
- The reviewed [StarGAN-v2 license](https://github.com/clovaai/stargan-v2/blob/875b70a150609e8a678ed8482562e7074cdce7e5/LICENSE) is noncommercial. Scientific discussion of the method remains; its implementation/weights are not adopted here.
- The source tree of [Karpathy's `pytorch-normalizing-flows` at b60e119](https://github.com/karpathy/pytorch-normalizing-flows/tree/b60e119b37be10ce2930ef9fa17e58686aaf2b3d) had no applicable license found in the earlier pinned review. The new flow functions are independently written elementary transformations, without `nflib` imports or copied routines.
- AudioCraft separates [MIT code](https://github.com/facebookresearch/audiocraft/blob/896ec7c47f5e5d1e5aa1e4b260c4405328bf009d/LICENSE) from [noncommercial weights](https://github.com/facebookresearch/audiocraft/blob/896ec7c47f5e5d1e5aa1e4b260c4405328bf009d/LICENSE_weights). The new exercise has neither weights nor GTZAN/voice recordings. Terms of unrelated external speech checkpoints are not declared cleared.
- Drag app/checkpoint and movie-poster chains lacked a completed per-input review. They are not dependencies of the new exercises. Retaining their scientific/historical citations elsewhere is not approval for reuse.

These are conservative editorial removal decisions for the specified practice scope, not legal findings that every possible citation or use of the old sources is prohibited.

## Verification

- The full script executes successfully. Independent fresh execution matches the saved JSON byte for byte; the nine selected experiment invocations use the same functions.
- Independent empirical-CDF integration confirms W1 0.65. Numerical Gaussian quadrature confirms the mean ELBO. An independent Bayes-risk calculation is consistent with the finite-sample DDPM noise MSE. Closed-form gradient convergence confirms the drag error and displacement.
- In-script checks cover Gaussian ELBO/KL identity, change-of-variables normalization, inversion, numerical Jacobians, denoising MSE identity, token schedule reconstruction, autoregressive normalization and preserved generation prefixes.
- All nine changed practice passages have identical math spans and source URLs in EN/RU. The independent reviewer read both versions and confirmed equivalence.
- Diff comparison confirms the eighteen localized changes stay within the stated Notebook boundaries. No existing figure or unrelated code/body section is silently approved.
- All eighteen MDX files compile with `remark-math` and `rehype-katex`, with no math-render errors. `npm run rights:check` and `git diff --check` pass for this batch snapshot.
- Whole-site build, rendered browser inspection, CI and publication are root's subsequent integration checks; they are not claimed by this report.

## Outstanding whole-note work

Whole-note review must still inspect the untouched exposition, existing mathematical examples, source-specific tables, imported generated diagrams, existing code and historical result claims. The DDPM external 2-D diffusion-notebook commentary is explicitly still present. A complete review requires exact dependency coverage and comparison to the cited primary material; a local SVG or standard library does not by itself establish provenance.

Nothing in this batch qualifies these nine notes as complete reviewed upstream sources for new BIASED material. Root owns the global renewal inventory and publication order. These maintenance corrections can ship independently while complete-note renewal continues.

## Subsequent complete-note review

The first-stage scope above is historical. The later [autoregressive full-note review](autoregressive-complete-review.md) supersedes that topic’s maintenance record with a complete record for its exact bilingual bodies and dependencies. It also replaces the identified lecture-specific counting exercise and corrects benchmark/sampling/causal-input details. The other eight topics remain maintenance at this checkpoint.
