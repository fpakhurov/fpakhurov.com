# Autoregressive models: complete scoped material review

Reviewed 2026-11-13 by Codex `course_licenses`. New synthetic practice independently checked by `gm_practice_review`; that independent review does not cover the entire historical body. The complete record is `content-rights/reviews/generative-autoregressive-models-complete.json`.

## Scope and decisions

Both complete EN/RU bodies were read, including references, reported measurements, examples, code and captions. Both imported figures (`Masks`, `BlindSpot`) and their recursive `Figure`/`lang` dependencies were read. The shared new practice script, saved JSON and existing-code output are included by hash. No external image/audio, copied notebook payload, dataset loader or checkpoint remains in this topic.

The initial comparison against [Isachenko lecture1.tex at 3d0e73d](https://github.com/r-isachenko/2025-DGM-MIPT-YSDA-course/blob/3d0e73d96a3a08a908348e34b57a138efea5485e/lectures/lecture1/Lecture1.tex), blob `a1de04c537639e2c38c609f675506ede52d8f09c`, found the same 28×28 binary-MNIST histogram/independent/Markov exercise. It was replaced by an independently specified 12-step binary sensor example tied to the newly executed practice corpus. The new comparison also distinguishes position-specific transitions (23 parameters) from shared transitions (3), so it teaches the extra modeling assumption rather than merely changing dimensions. Background attribution is retained without claiming permission to adapt the old slide/example.

The earlier poster-data PixelCNN procedure has been replaced by the original Markov fit/evaluation exercise described in [the bounded practice report](generative-practice.md). No quality claim about learned image generation is made.

## Source comparison

| Material | Primary source and inspected locator | Current use / conclusion |
| --- | --- | --- |
| PixelRNN/CNN, RGB masks, CIFAR likelihoods | [1601.06759v3](https://arxiv.org/html/1601.06759v3), Sections2–4/Table5 | Scientific definitions and credited measurements. No paper image, model or dataset adopted. |
| Gates, blind spot, two stacks and training-time comparison | [1606.05328v2](https://arxiv.org/html/1606.05328v2), Sections2.1–2.3/3.1/Table1 | Corrected time comparison to ImageNet. CIFAR3.03 is a separate reported result. |
| PixelCNN++ likelihood and dropout result | [1701.05517v1 PDF](https://arxiv.org/pdf/1701.05517v1), Sections2.1–2.2/3.4.4/Table1 | Checked bin boundaries, RGB mixture10K and paper measurements. Local illustrative bin probabilities independently recalculated. |
| WaveNet | [1609.03499v2](https://arxiv.org/html/1609.03499v2), Sections2.1–2.2 | Checked dilation and companding; clarified initial input shift so target cannot leak. |
| NADE/MADE/PixelVAE handoffs | [NADE primary record](https://proceedings.mlr.press/v15/larochelle11a.html), [MADEv2](https://arxiv.org/abs/1502.03509v2), [PixelVAEv1](https://arxiv.org/abs/1611.05013v1) | Brief mechanism descriptions checked against primary abstracts; no source artifacts adopted. |
| FVSBN | [Stanford CS236 page](https://deepgenerativemodels.github.io/notes/autoregressive/) | Mathematical reference only; all parameter totals recomputed. No page text/image reuse or assumed page-wide license. |
| Coding bound | [Cover–Thomas publisher record](https://doi.org/10.1002/047174882X) | Metadata checked; standard bound recomputed. Full book was not accessed. No book prose/figure/exercise reused. Added explicit model/file-overhead exclusion. |

The two local SVG diagrams are evaluated from causal predicates/Minkowski sums. They do not import or trace source images. Mathematical mechanisms are attributed; local rendering does not claim ownership of the scientific idea. Paper benchmark numbers are explicitly published measurements, not local reproductions or released datasets.

## Technical and bilingual verification

- Both existing NumPy code blocks parse to identical Python ASTs and execute to identical stdout; [saved output](autoregressive-code-output.txt) gives toy joint probability0.0983, sum1, and six unreachable cells.
- The 5×5 mask formulas produce12/13 active cells; four3×3 layers produce6 blind cells out of40 prior positions in the stated window. The proof and independent input-perturbation experiment agree.
- New sensor comparison totals:4095,12,23,3,78. The practice script fits separate transitions after0/1, not a one-parameter symmetric-flip model.
- Recomputed logistic bin masses are0.112/0.124/0.121/0.105; the saturated255 bin is0.438. Compression arithmetic and the1024-sample/64ms receptive field agree.
- Qualified generation as **ordinary ancestral sampling**; caching and parallel work inside a pass are not ruled out.
- Entire EN/RU prose and captions read for corresponding meaning. Numeric/math/code checks pass. New practice independently replayed byte for byte by a second agent.
- The complete record covers the exact files, not all generative-model notes. Integration MDX/build/rights/CI/browser/publication checks are recorded separately by the parent.

This is a complete scoped editorial/material review with no remaining identified unverified reused artifact in this note. It is not a universal ownership guarantee, permission to reuse linked sources, or evidence that the whole course is complete.

Root independently reviewed the full English body and replayed the numerical examples and new lab. Its two final copy findings were fixed in both locales: zero-mass conditionals may be chosen arbitrarily without changing the joint, and ideal arithmetic coding has a comparable bound rather than the identical Shannon–Fano–Elias codeword; finite-precision and termination overhead are excluded.
