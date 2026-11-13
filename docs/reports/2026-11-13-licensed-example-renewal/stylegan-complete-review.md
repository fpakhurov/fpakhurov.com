# StyleGAN: complete scoped source and example renewal

Reviewed 2026-11-13 by Codex `course_licenses`. This records an author/source/numerical review of the complete English and Russian StyleGAN notes, both figures, their full seven-file import closure, and the scoped verification scripts. An independent reviewer and publication checks are separate; this report does not certify the rest of the course or universal ownership against unseen sources.

## What was replaced

The former `StyleFlow.astro` explicitly described itself as a rendition of StyleGAN Figure 1b. The versioned paper provides an arXiv non-exclusive distribution license, which was not treated as a reuse grant for that drawing. The old architecture drawing was removed in full. Its stable figure ID now contains a newly specified four-position numerical comparison: normalize `x + b n`, with `x=(-3,-1,1,3)` and `n=(1,-1,-1,1)`, then change the style or reverse the noise coefficient. This is a direct arithmetic fixture, not a redrawing with renamed boxes or a claim about trained-image identity preservation.

The source-specific missing-combination illustration was also removed. Its replacement is a full-support binary probability table with diagonal probabilities `7/16`, off-diagonal probabilities `1/16`, and an explicit two-uniform construction. It isolates exactly what separate functions of independent coordinates cannot represent. The same table supplies a finite InfoGAN posterior example: true mutual information `0.316377019304`, auxiliary lower bound `0.268138572025`, gap `0.048238447279` nats. These examples, the new figure, and new verification were authored for Fedor Pakhurov's project with Codex assistance. No claim is made that Fedor personally selected the constants.

The existing spike, two-channel demodulation, synthetic convolution, local singular-value and sampled-cosine examples were read and recalculated. They contain local synthetic numbers, not face images, paper benchmark samples or pretrained weights. They were not relabeled as new work. No matching distinctive numeric artifact or code was found in the inspected primary methods and historical lecture deck; the mathematical methods remain attributed. A search alone is not the basis for claiming all prior prose original.

## Full-note editorial and mathematical changes

- Replaced the implication that a fixed independent prior necessarily forces curved semantic directions with a precisely restricted coordinatewise-independence result.
- Made continuous entropy assumptions explicit; retained the primary InfoGAN implementation's learned positive Gaussian standard deviation, verified in Appendix C.
- Distinguished empirical semantic control from guarantees; included noise in the generator notation. AdaIN's scale cancellation is restricted to positive rescaling and nonzero variance, with zero stabilizer in the exact toy calculation.
- Restricted contraction to `0 <= psi < 1`; evaluation at the mean code is not the mean image, and independent noise may remain. Negative truncation is a reflection, not a semantic-negation guarantee.
- Distinguished external perceptual/attribute supervision in evaluation from label-free generator training. Linear separability's floor refers to the measured conditional entropies.
- Demodulation requires uncorrelated unit-variance inputs for the exact zero-stabilizer variance statement; the covariance counterexample gives `103/85`. Updated the figure title and shortened its captions accordingly.
- Separated the global path-length loss from the fixed-Jacobian delta-method approximation, stated fixed squared singular-value norm in the comparison, and retained the zero-collapse caveat. Distinguished layer-specific practical regularization and the lazy interval multiplier/optimizer correction.
- Separated continuous ReLU equivariance from aliasing introduced by its grid representation. Corrected the toy shift-effect comparison and the scope of the reported StyleGAN3 ablation (`FFHQ-U 256^2`); stated both actual training times, dataset boundaries and omission of path-length regularization.
- Corrected the inversion handoff to allow optimization, encoders or hybrids. The sequence, prerequisites, all 25 section headings in each locale and both figure IDs are preserved.

## Precisely checked primary references

All entries below are references for methods or attributed research facts. No article prose, image, data, model weights or implementation is incorporated under an assumed paper/library license.

| Primary source and version | Checked scope |
| --- | --- |
| [Chen et al., InfoGAN, 1606.03657v1](https://arxiv.org/abs/1606.03657v1) | Sections 3–7, Appendix C: information objective, posterior lower bound and forward joint sampling; shared recognition network; categorical/Gaussian heads including learned mean and standard deviation; MNIST classification result and experiment sizes. |
| [Karras, Laine, Aila, StyleGAN, 1812.04948v3](https://arxiv.org/abs/1812.04948v3) | Sections 2–4; Tables 1/2/4; Appendices B–C: 8-layer/512-dimensional mapping, 18 styles, learned constant, noise, mixing, FID settings/results, PPL and attribute classifier separability, truncation and dataset-dependent losses. Figure 1b and Figure 6 were identified as the former expressive examples and removed rather than licensed by citation. |
| [Karras et al., StyleGAN2, 1912.04958v2](https://arxiv.org/abs/1912.04958v2) | Sections 2–4, Table 1, Appendices B–C: normalization hypothesis and modulation equations; path-length definition, Jacobian analysis and local/global distinction; lazy regularization, layer-specific styles, skip/residual alternatives and combined FID result. |
| [Karras et al., StyleGAN3, 2106.12423v4](https://arxiv.org/abs/2106.12423v4) | Sections 2–4 and Figure 3: infinite-grid continuous interpretation, sampling/filters, nonlinear bandwidth, Fourier inputs and margins, oversampling ablation, training times, unaligned/beach datasets and the path-length ablation. Project video page opened for the link destination, not downloaded or redistributed. |
| [Mescheder, Geiger, Nowozin, 1801.04406v4](https://arxiv.org/abs/1801.04406v4) | Section 4.1 Eq. 9 and adjoining convergence assumptions. This note cites R1 and links to the already reviewed StarGAN explanation; it does not assert unconditional convergence. |
| [Huang, Belongie, 1703.06868v2](https://arxiv.org/abs/1703.06868v2) | Section 5 Eq. 8, channel-wise spatial moments. StyleGAN's affine style parameters are distinguished from the original style-image statistics. |
| [Zhang et al., 1801.03924v2](https://arxiv.org/abs/1801.03924v2) | Section 3 Eq. 1: normalized feature differences, weights and squared distance, supporting the epsilon-squared PPL normalization. |

The unverified textbook citation was removed; the sampling discussion now cites the checked StyleGAN3 primary section. The historical HSE lecture URL was removed from the learner bibliography. For provenance comparison only, all 56 pages' extracted text of `lectures/04_Lecture_StyleGAN.pdf` at [42dd64b535f5bedf1d2b3db28f2f21ce96c9f09f](https://github.com/HSE-LAMBDA/DeepGenerativeModels/blob/42dd64b535f5bedf1d2b3db28f2f21ce96c9f09f/lectures/04_Lecture_StyleGAN.pdf) were read. This was not a drafting input or a grant for its diagrams. No slide image or distinctive lecture data/code is retained in the renewed executable/figure scope. Shared scientific facts were checked against primary papers.

## Dependencies and permissions

The figure import closure is enumerated in `stylegan-figure-checks.json`: two figures, `styleCases.ts`, `Figure.astro`, `lang.ts`, `geometry.ts`, and `random.ts`. All seven were read. The only third-party implementation within that closure is the previously attributed Mulberry32 routine. The complete pinned `bryc/code` PRNG source was fetched; blob `5b58125493d8043cc416bd035b8f24fa8843e006` matches commit `88c1317ea6f9b25c153afa9c369c365fed11b482`, and its opening public-domain dedication and Mulberry32 section were checked. Existing public notices remain intact.

The new Python verifier translates the same small routine to reproduce the existing figure's exact stream. This is explicitly credited in `public/licenses/stylegan-verifier.txt`, with the exact source, dedication, adaptation scope and statistical limitation. It is not labeled MIT or claimed newly invented. Other scalar calculations and verification logic are newly authored. NumPy is an execution dependency used through its API, not a source for copied implementation; its package/runtime review is separate from this content record. There is no external image, model or dataset download.

## Executed validation

- `OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 <venv-ml>/bin/python scripts/notes/check-stylegan-renewal.py`: passes with Python 3.14.7 / NumPy 2.5.4. Exact saved stdout of the bilingual inline example is reproduced.
- Independent scalar/array calculation verifies the binary construction, information/KL gap, all 12 new figure values and their moments, eight spike settings, covariance example, cosine alias and direct complex-sum spectra. The direct spectra are compared to the inline rFFT computation.
- Independent vectorized NumPy convolution is compared against all 144 actual TypeScript output standard deviations and 48 predicted scales; it reproduces every plotted value within `1e-10`, not just rounded extrema.
- `node scripts/notes/check-stylegan-figures.cjs`: strict MDX/KaTeX, identical 266 math spans per locale, identical executable code, Astro compile and stable heading checks. Current exact counts are stored in `stylegan-figure-checks.json` and take precedence if a reviewer makes a later correction.
- Actual Astro components rendered with the project CSS in Chromium 156.0.8078.4 at EN/RU × 390/1000 px × light/dark (eight configurations): no page or SVG text overflow. Both RU mobile figures and the entire EN wide dark preview were visually read. The extra visible SVG reported by the harness is shared definitions; there are two content figures.

Screenshots stayed in `/tmp/stylegan-review` rather than adding generated image files to the public repo. `stylegan-visual-checks.json` records the bounded run. This is a standalone figure review, not a full-page, production, model-training, hosted-notebook or benchmark test. Full-site CI, page review and publication belong to the coordinator. Independent peer review was not yet performed when this author record was created.

## Independent coordinator review

Codex root read both complete bilingual notes, both figure implementations, the new numeric module and both verification scripts. The existing shared helper closure retains the prior reviewed implementation and notices; the author independently read all seven closure files in this pass. Root checked the finite probability/InfoGAN calculation, covariance formula and fixed-scale singular-value argument and reran both numerical and strict figure/MDX checks successfully. Root also freshly checked StyleGAN2 v2 sections 2 and 3 / Appendix B on modulation, demodulation and lazy updates, plus StyleGAN3 v4 sections 3 and 4 on per-pixel noise, the scoped upsampling ablation and GPU hours. Other primary passages were checked by the author as recorded above, not claimed to have been newly read in full by root.

Four bilingual prose corrections followed this review: earlier-layer spatial patterns can persist through later AdaIN operations; positive stabilizer variance is close to one only when the squared-weight sum dominates it; StyleGAN3 removes per-pixel noise, not latent randomness; coarse/fine semantic roles in the takeaway are empirical and overlap. No numeric fixture or saved output changed. Full-page browser evidence and CI are recorded separately below when executed.

## Coordinator full-page release check

Codex root rendered the actual full Astro topic pages in EN/RU at 390 and 1440 px, in light and dark themes. All eight views had no document overflow, KaTeX errors, font errors or clipped visible SVG text. Both RU mobile figures were opened and visually inspected; labels, captions, plotted values and panel spacing are readable. The measurements are saved in `stylegan-full-page-checks.json`. This is local browser evidence, separate from CI and publication.
