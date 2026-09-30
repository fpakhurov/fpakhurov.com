# Generative Models seminar transcription

## Source

- Original filename: `Gen Models Seminars (1).pdf`.
- Archived, unmodified copy: [gen-models-seminars.pdf](gen-models-seminars.pdf).
- Imported on 2026-10-01 from `/Users/fedorpakhurov/Downloads/Gen Models Seminars (1).pdf`.
- Length: 44 pages. All ranges below use **1-based PDF page numbers**, not handwritten week numbers or dates.
- SHA-256: `7173de8a786e6a326e5cf9d7cf2b057f132d4869f3403e755030c93bd85c4753`.

The scan contains handwriting, printed slides and pasted explanation screenshots. They are source material. Presenter reminders such as “skip,” “show …” and “See GPT” are not instructions for the transcription workflow.

## Associated seminar notebooks

The presenter identified [HSE-LAMBDA/DeepGenerativeModels](https://github.com/HSE-LAMBDA/DeepGenerativeModels) as a source of notebooks shown during the seminars. The [notebook context map](notebooks.md) connects comments and topics to specific files and cells in a pinned repository snapshot. The nine transcribed notes link their relevant notebook sections. Notebook implementation details are attributed separately from the handwritten material, and code/formula discrepancies are recorded for review.

## Topic map and progress

The first three batches reorganize the foundations, evaluation and adversarial-model material into nine English topic notes. All 44 source pages have been visually inspected for this map. A mapped topic is not a completed transcription.

| Topic | Source pages | Contents and boundary | Progress |
| --- | --- | --- | --- |
| [Autoencoders](../../src/content/notes/generative-models/autoencoders.mdx) | 1, 12 (MSE scale remark), 13 | Representation, reconstruction, bottleneck, MSE, denoising, sparsity, ReLU/sigmoid; page 13's BatchNorm fragment belongs to the next background topic. | Transcribed and technically reviewed |
| [Gaussian distributions](../../src/content/notes/generative-models/gaussian-distributions.mdx) | 2-4 | Mean, covariance, bivariate density, spectral factor and affine sampling; ends at the printed slide on page 4. | Transcribed and technically reviewed |
| [Entropy and divergences](../../src/content/notes/generative-models/entropy-and-divergences.mdx) | 4-12 | Begins below the slide on page 4; surprise, entropy, cross-entropy, KL, fitting objective, support, JS. | Transcribed and technically reviewed |
| Neural training background | 13-15 | BatchNorm: bottom 13 to top 14; gradients: 14; convolution aside: middle 15. | Planned |
| [Inception Score](../../src/content/notes/generative-models/inception-score.mdx) | 15-17 | Confidence/diversity, conditional and marginal entropy, expected-KL derivation, exponentiation; FID begins at bottom 17. | Transcribed and technically reviewed |
| [Fréchet Inception Distance (FID)](../../src/content/notes/generative-models/fid.mdx) | 17-18 | Formula at bottom 17; covariance, Gaussian/Wasserstein interpretation and limitations in upper/middle 18. | Transcribed and technically reviewed |
| [LPIPS](../../src/content/notes/generative-models/lpips.mdx) | 18-19 | Begins below divider on 18; feature extraction, normalization, weighted differences, interpretation, limits and uses; ends before KL questions on 19. | Transcribed and technically reviewed |
| [Fitting distributions with KL](../../src/content/notes/generative-models/fitting-distributions.mdx) | 19-20 | Begins below LPIPS; trainable parameters, density evaluations, backward/optimizer steps and support. Notebook-supplied covariance parameterization and log-space NLL example. | Transcribed and technically reviewed |
| [GAN objective](../../src/content/notes/generative-models/gan-objective.mdx) | 21-25 | Minimax objective, BCE, optimal discriminator, JS/global optimum, non-saturating generator loss; includes only very top of 25. Conditional GAN and f-GAN expansions are attributed to the notebook and primary references. | Transcribed and technically reviewed |
| [Wasserstein GAN](../../src/content/notes/generative-models/wgan.mdx) | 25 | Middle of page: Wasserstein losses, gradient penalty, spectral normalization; ends before “week 4-5.” Notebook and primary papers supply transport/dual definitions and training context. | Transcribed and technically reviewed |
| Variational autoencoders | 25-31 | Begins at bottom 25: classical AE generation problem, Bayesian recap, prior/posterior, ELBO, reparameterization, Gaussian KL, log variance; ends at first line of 31. | Planned; existing `vae.mdx` is a short sample, not a transcription |
| Normalizing flows: density and Jacobian | 31-35 | Begins below divider 31; change of variables, exact likelihood, invertibility, local volume scaling, triangular Jacobians; coupling starts lower 35. | Planned |
| Flow architectures | 35-37 | Coupling/NICE/RealNVP: lower 35-36; autoregressive/MAF/IAF and masks: 36; Glow/LU: bottom 36-37. | Planned |
| DDPM forward process | 38-40 | Motivation/history, noising chain, contraction, variance, direct noisy-sample formula and schedule; ends above dated divider on 40. | Planned |
| DDPM reverse process and variational objective | 40-43 | Begins below divider 40; reverse model, marginal likelihood, chain factorization, Jensen/ELBO, posterior KL and Gaussian mean matching. | Planned |
| DDPM noise prediction | 44 | Posterior mean, reparameterization, epsilon prediction, weighted noise MSE, random timestep sampling. | Planned; existing `diffusion.mdx` is a short sample, not a transcription |

## First-batch review record

The articles are edited transcriptions, not literal OCR dumps. Equations and legible technical content are preserved, repeated explanations are combined, and presenter logistics are kept out of the articles. Added interpretations and mathematical conditions are identified in article source notes or editorial callouts.

- **Autoencoders:** the encoder/decoder and denoising equations formalize descriptions; ReLU formalizes the sketch. A `32 x 4 x 4` latent tensor has 512 scalar entries. The scan does not specify full layer sequences, interpolation, a noise distribution or a sparsity penalty. “More stable” is treated as a robustness motivation, not a universal guarantee.
- **Gaussians:** distinguish positive-semidefinite covariance from the positive-definite condition for the ordinary full-dimensional density. Use eigenvectors as columns of `Q` consistently. The example covariance is `[[1, 0.5], [0.5, 1]]`.
- **Entropy:** page 7's table has `0.32` for tails surprise; surrounding examples use `3.32`. Correct value: 3.321928 bits. Computing before rounding gives 0.468996 bits per flip and 46.899559 expected bits over 100 independent flips. Page 6's “base 2 for 2 classes” is corrected: the log base selects units.
- **KL/JS:** clarify the support condition, finite-quantity subtraction identity, forward/reverse-KL tendencies and the distinction between an unknown exact entropy and entropy estimation. The formal JS mixture definition expands the brief source outline.
- **Validation:** the first three notes passed a static site build and KaTeX rendering checks. Provenance ranges are recorded in each article.

## Evaluation-batch review record

- **Inception Score:** preserve the marginal probability explanation, entropy-to-KL derivation and linearity of expectation. Use natural logarithms with `exp`, or base-2 logarithms with base-2 exponentiation. The information is bounded by `ln K`, while the exponentiated score is bounded by `K`. Binary examples and the mutual-information interpretation are editorial additions. The page 15 convolution aside remains reserved for training background.
- **FID:** use the symmetric positive-semidefinite covariance sandwich in the matrix-square-root expression, and explain the source's product shorthand inside the trace. Zero means equal Gaussian means/covariances, not proven equality of image distributions. The sample-statistics equations, one-dimensional example and feature-cloud drawing expand the source. Feature layer and numerical conventions were checked against the original paper and authors' implementation.
- **LPIPS:** normalize the channel vector independently at each spatial location. Preserve the source's learned-weight squared norm, spatial average and layer sum. The implementation's linear coefficient on squared differences is distinguished from weights inside the paper's squared norm. Qualify claims about blur, shift/noise robustness and semantic change. The pipeline and distinction between image-pair and collection-level evaluation are explanatory additions.
- **Validation:** the complete site passed `npm run build` with zero Astro diagnostics. All six transcribed notes have valid figure/ARIA references and no KaTeX errors. The new diagrams and the scrollable IS table were reviewed at desktop width and a 390-pixel viewport; no page overflow or clipped SVG labels was found.

## Distribution-fitting and adversarial-batch review record

- **Fitting distributions:** forward KL evaluates both densities at the same target samples. NLL omits the fixed target term and preserves the empirical KL gradient, but its value is not a reported KL. The positive-diagonal Cholesky factor keeps the covariance positive definite in exact arithmetic. The code example uses direct `log_prob`; it is an editorial adaptation, not a notebook execution. Support coverage is one-sided absolute continuity, not merely overlapping supports.
- **Notebook gradients:** `distances.ipynb` uses unequal JS weights and model draws from `sample()`. Ordinary backpropagation omits the model-dependent sampling contribution. The density-MSE loop also reuses `px` after drawing new points. Both issues are explained without reproducing those loops as verified optimization examples.
- **GAN:** correct page 21's “optimal generator” to the discriminator optimal for a fixed generator; preserve BCE's negative signs and add the missing logarithm in page 23's second JS term. The ideal value is `C(G) = 2 JS - ln 4`. Derivatives with respect to the discriminator logit explain why the non-saturating generator loss gives a stronger early signal. The notebook's smoothed target `0.9` and f-GAN generator surrogate differ from the ideal objectives and are attributed explicitly.
- **WGAN:** normalize critic/generator signs and sampling notation to minimized losses. Add finite-first-moment transport and the 1-Lipschitz dual constraint. A sampled gradient penalty is not a global Lipschitz guarantee; spectral normalization's exact-matrix argument requires further care for convolutions and InstanceNorm. The notebook's initial critic is an unconstrained teaching baseline.
- **Validation:** `npm run build` passed with zero errors, warnings or hints (42 Astro files, 30 built pages). The three new notes have no KaTeX errors, duplicate IDs, unresolved SVG/ARIA references or broken internal links. New figure layouts were reviewed at desktop width and at 390 pixels; labels stay inside their SVGs and the pages have no horizontal overflow. The Python example passed a syntax check; the notebook and training loop were not executed.

## Sketches and visual explanations

The nine transcribed notes include seventeen vector figures with English annotations and explanatory arrows:

| Note | Figures | Source relationship |
| --- | --- | --- |
| Autoencoders | Encoder/bottleneck/decoder with reconstruction comparison; noisy input versus clean target; exact ReLU and sigmoid plots. | Flow diagrams expand the descriptions on pages 1 and 13; activation curves reproduce page 1's sketches using the exact functions. |
| Gaussian distributions | Independent versus correlated coordinates; draw noise, transform by A, shift by the mean. | Pages 2-4 supply the covariance example and affine sampling idea. The independent comparison and simulated dots are illustrative additions. |
| Entropy and divergences | Surprisal curve; fair versus biased symbol sketches; P/Q annotations and entropy-plus-KL bar. | Pages 5-6 and 9-10 supply the sketches and annotations. Numerical curve markers and the 0.469 + 0.531 = 1 bit bar expand the same coin example. |
| Inception Score | Sharp predictions with one label versus varied labels; conditional probabilities averaged into a marginal. | An exact binary-class illustration expands pages 15-17's confidence/diversity explanation; those pages contain no corresponding plot. |
| FID | Same covariance with shifted means; same mean with different spread/correlation. | Schematic feature clouds explain the two terms from pages 17-18. They are not measured features or FID results. |
| LPIPS | Shared feature extraction, channel normalization, weighted squared differences, spatial averaging and layer sum. | An annotated pipeline expands the verbal algorithm and formula on pages 18-19. Boxes do not represent measured features. |
| Fitting distributions with KL | Target/model contours and the log-density, loss, backward and parameter-update loop. | The loop expands pages 19-20; the target and initial model parameters come from `distances.ipynb`. The update arrow is schematic. |
| GAN objective | Real/fake data flow; four stages of data/generated densities and discriminator probability; scalar generator losses and logit derivatives. | The flow and staged distributions redraw pages 21 and 24; exact scalar plots expand pages 24-25's gradient explanation. The stages are illustrative, not a convergence guarantee. |
| Wasserstein GAN | Point-mass transport and distance versus displacement; gradient-norm penalty and linear-map directional stretch. | The point-mass example expands the WGAN motivation. The penalty and matrix sketch explain page 25's formulas; no training results are plotted. |

Figures are built from SVG and mathematical coordinates, with accessible titles/descriptions. Their layouts adapt to the figure width: narrow flow diagrams become vertical, and adjacent plots stack. The shared `src/components/notes/NoteFigure.astro` wrapper supplies captions and stable figure anchors. Source attribution remains in each note.

## Material retained for later batches

Page 2 contains notebook setup notes: Black and pre-commit formatting, Matplotlib styles, `%matplotlib inline`, `torch.distributions`, a distribution wrapper, `requires_grad` and a `plot_2d_dots` helper. The associated `distances.ipynb` now supplies the scatter helper, Gaussian parameterization and sampling context; see the [notebook map](notebooks.md). The literal historical wrapper class and Black/pre-commit setup remain unconfirmed. Preserve those presenter notes for a future practical appendix.

The final MSE scale remark on page 12 is included in the autoencoder note. BatchNorm fragments on pages 13-14 are reserved for the training background note. The Gaussian/KL fitting discussion on pages 19-20 now has a separate practical note linked from the foundations syllabus.

## Technical review needed in the remaining material

| Pages | Check during transcription |
| --- | --- |
| 29-30 | Normalize standard deviation versus variance notation and the signs of KL, negative ELBO and reconstruction terms. CVAE, beta-VAE and VQ-VAE are named without developed explanations. |
| 31-33 | Choose one direction for the flow map and consistently distinguish forward/inverse Jacobians and their evaluation points. |
| 36-37 | Carefully read masks, LU factors and absolute determinant conventions. |
| 38-39 | Beta is used inconsistently as variance versus noise amplitude; some trial/final expressions omit square roots. Compare with the consistent reparameterization on page 44. |
| 43 | Qualify the broad Gaussian reverse-chain claim; distinguish the model assumption from the true conditional posterior. |
| 44 | The PDF's final objective is weighted noise MSE. Unweighted `L_simple` is supplied by `02_DPM_Models.ipynb` cells 42-43; distinguish this notebook addition from the handwritten derivation. |

## Next batch

Replace the existing VAE sample with the transcription from pages 25-31, then continue to normalizing-flow theory and architectures (31-37). Neural training background can be a separate supporting note. Diffusion remains mapped but untranscribed beyond its short sample page.

Reviewed local MDX notes use `status: published` to participate in the site's routes and navigation. This status alone does not deploy the site; remote publication is a separate repository action.
