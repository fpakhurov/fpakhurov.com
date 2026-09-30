# Generative Models seminar transcription

## Source

- Original filename: `Gen Models Seminars (1).pdf`.
- Archived, unmodified copy: [gen-models-seminars.pdf](gen-models-seminars.pdf).
- Imported on 2026-10-01 from `/Users/fedorpakhurov/Downloads/Gen Models Seminars (1).pdf`.
- Length: 44 pages. All ranges below use **1-based PDF page numbers**, not handwritten week numbers or dates.
- SHA-256: `7173de8a786e6a326e5cf9d7cf2b057f132d4869f3403e755030c93bd85c4753`.

The scan contains handwriting, printed slides and pasted explanation screenshots. They are source material. Presenter reminders such as “skip,” “show …” and “See GPT” are not instructions for the transcription workflow.

## Topic map and progress

The first batch reorganizes the opening material into three English topic notes. All 44 source pages have been visually inspected for this map. A mapped topic is not a completed transcription.

| Topic | Source pages | Contents and boundary | Progress |
| --- | --- | --- | --- |
| [Autoencoders](../../src/content/notes/generative-models/autoencoders.mdx) | 1, 12 (MSE scale remark), 13 | Representation, reconstruction, bottleneck, MSE, denoising, sparsity, ReLU/sigmoid; page 13's BatchNorm fragment belongs to the next background topic. | Transcribed and technically reviewed |
| [Gaussian distributions](../../src/content/notes/generative-models/gaussian-distributions.mdx) | 2-4 | Mean, covariance, bivariate density, spectral factor and affine sampling; ends at the printed slide on page 4. | Transcribed and technically reviewed |
| [Entropy and divergences](../../src/content/notes/generative-models/entropy-and-divergences.mdx) | 4-12 | Begins below the slide on page 4; surprise, entropy, cross-entropy, KL, fitting objective, support, JS. | Transcribed and technically reviewed |
| Neural training background | 13-15 | BatchNorm: bottom 13 to top 14; gradients: 14; convolution aside: middle 15. | Planned |
| Inception Score | 15-17 | Confidence/diversity, conditional and marginal entropy, expected-KL derivation, exponentiation; FID begins at bottom 17. | Planned |
| Fréchet Inception Distance (FID) | 17-18 | Formula at bottom 17; covariance, Gaussian/Wasserstein interpretation and limitations in upper/middle 18. | Planned |
| LPIPS | 18-19 | Begins below divider on 18; feature extraction, normalization, weighted differences, interpretation, limits and uses; ends before KL questions on 19. | Planned |
| Fitting Gaussian parameters with KL | 19-20 | Begins below LPIPS; trainable parameters, density evaluations, backward/optimizer steps and support. Can extend the divergences article. | Planned |
| GAN objective and optimality | 21-25 | Minimax objective, BCE, optimal discriminator, JS/global optimum, non-saturating generator loss; includes only very top of 25. | Planned |
| WGAN and training constraints | 25 | Middle of page: Wasserstein losses, gradient penalty, spectral normalization; ends before “week 4-5.” | Planned |
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

## Sketches and visual explanations

The first three notes now include eight vector figures with English annotations and curved explanatory arrows:

| Note | Figures | Source relationship |
| --- | --- | --- |
| Autoencoders | Encoder/bottleneck/decoder with reconstruction comparison; noisy input versus clean target; exact ReLU and sigmoid plots. | Flow diagrams expand the descriptions on pages 1 and 13; activation curves reproduce page 1's sketches using the exact functions. |
| Gaussian distributions | Independent versus correlated coordinates; draw noise, transform by A, shift by the mean. | Pages 2-4 supply the covariance example and affine sampling idea. The independent comparison and simulated dots are illustrative additions. |
| Entropy and divergences | Surprisal curve; fair versus biased symbol sketches; P/Q annotations and entropy-plus-KL bar. | Pages 5-6 and 9-10 supply the sketches and annotations. Numerical curve markers and the 0.469 + 0.531 = 1 bit bar expand the same coin example. |

Figures are built from SVG and mathematical coordinates, with accessible titles/descriptions. Their layouts adapt to the figure width: narrow flow diagrams become vertical, and adjacent plots stack. The shared `src/components/notes/NoteFigure.astro` wrapper supplies captions and stable figure anchors. Source attribution remains in each note.

## Material retained for later batches

Page 2 contains notebook setup notes: Black and pre-commit formatting, Matplotlib styles, `%matplotlib inline`, `torch.distributions`, a distribution wrapper, `requires_grad` and a `plot_2d_dots` helper. These belong to a future practical appendix. The helper/wrapper source and exact notebook name are not supplied by this PDF; do not invent them.

The final MSE scale remark on page 12 is included in the autoencoder note. BatchNorm fragments on pages 13-14 are reserved for the training background note. The Gaussian/KL fitting discussion on pages 19-20 remains to be transcribed even though its conceptual prerequisites are in the first batch.

## Technical review needed in the remaining material

| Pages | Check during transcription |
| --- | --- |
| 19-20 | Normalize continuous/discrete KL notation and support assumptions. Preserve optimizer details only when readable; pasted explanations need the same review as handwriting. |
| 21 | The text says “If generator is optimal” before the JS reduction. Check against the optimal-discriminator derivation. Review labels in the GAN schematic. |
| 21, 25 | Conditional GAN and f-GAN are headings only; the Fenchel fragment is incomplete. There is not enough material for full standalone transcriptions of these topics. |
| 29-30 | Normalize standard deviation versus variance notation and the signs of KL, negative ELBO and reconstruction terms. CVAE, beta-VAE and VQ-VAE are named without developed explanations. |
| 31-33 | Choose one direction for the flow map and consistently distinguish forward/inverse Jacobians and their evaluation points. |
| 36-37 | Carefully read masks, LU factors and absolute determinant conventions. |
| 38-39 | Beta is used inconsistently as variance versus noise amplitude; some trial/final expressions omit square roots. Compare with the consistent reparameterization on page 44. |
| 43 | Qualify the broad Gaussian reverse-chain claim; distinguish the model assumption from the true conditional posterior. |
| 44 | The final objective is weighted noise MSE. An unweighted `L_simple` objective is not explicitly written in the source. |

## Next batch

Continue with the evaluation topics: Inception Score (15-17), FID (17-18) and LPIPS (18-19). Then transcribe the practical KL fitting discussion and adversarial models. Neural training background can be a separate supporting note.

Reviewed local MDX notes use `status: published` to participate in the site's routes and navigation. This status alone does not deploy the site; remote publication is a separate repository action.
