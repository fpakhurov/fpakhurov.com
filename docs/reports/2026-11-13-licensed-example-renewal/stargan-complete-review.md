# StarGAN: complete scoped renewal

Reviewed 2026-11-13 by Codex `course_licenses`: both full localized notes, both figure source files and their local dependency closure, every worked calculation, replacement practice, primary references and exact reuse scope. This is a complete decision for the recorded topic files and uses. It does not clear the rest of the generative-models course, linked external downloads or all historical sources.

## Material decisions

The earlier HSE CelebA homework procedure was replaced by the independently specified three-coordinate content/domain/style diagnostic. The remaining unused HSE bibliography entry is now removed, while its historical role remains in this report and the superseded maintenance record. The new diagnostic imports no model, dataset, source image or external implementation. It does not reproduce StarGAN training or perceptual evaluation.

The old five-face-attribute worked classifier example is replaced by a newly specified four-attribute synthetic tile example: striped/bright/wide/tilted, target `(1,0,1,0)`, logits `(0.8,-0.3,1.1,0.4)`. The v1 diagram now uses this fixture, including seven input channels and recentered labels. No photographs are displayed. Original new checks were authored for Fedor Pakhurov's project with Codex assistance; no assertion of exclusive copyright in AI-assisted material is made.

The distinction between a scientific method and its implementation matters here. The v1 mathematical loss/data-flow description is credited to the primary paper and checked against its official code. It reproduces neither paper photographs nor source code. The local symbolic diagram uses project components and a synthetic fixture; the four necessary operations follow the algorithm, not a copied source image layout. The face/RaFD dataset names, original experiment counts and selected classification errors are clearly attributed descriptions of published research, not inputs to the local practice or newly measured results.

For v2 we conservatively record adaptation of the article's method explanation, local symbolic schematic and selected Table 1 rows. The **versioned article**, arXiv:1912.01865v2, explicitly links **CC BY 4.0**. The separately published code repository is **CC BY-NC 4.0**. These are different grants. The new `/licenses/stargan-v2-paper.txt` notice names the four authors, exact article version, license, changed wording/layout/table selection, no endorsement and the licensed material boundary. Both notes link it next to the adaptation. The article's grant is not extended to code, checkpoints or source photographs. None of those is distributed or loaded by the practice.

The R1 section attributes the Dirac-GAN mathematical construction and local convergence theorem to Mescheder, Geiger and Nowozin. It independently derives the linearized equations with the note's real-positive/fake-negative logit convention, which reverses the sign of the paper's discriminator parameter. The numerical trace uses a new initial state, not a copied source trajectory. Mathematical definitions and theorem facts are referenced; no source plot, proof prose, code or dataset is imported.

## Primary evidence

All following primary source checks were performed on 2026-11-13.

| Source/version | Checked locations and local use |
| --- | --- |
| Choi, Choi, Kim, Ha, Kim, Choo, [StarGAN, arXiv:1711.09020v3](https://arxiv.org/html/1711.09020v3) | §§3.1–3.2 losses/mask, §4 WGAN-GP/network, §5.2 dataset counts, §5.3 initial learning rate/batch/critic schedule, §5.5 Table 3 errors and comparison scope, §5.6 Figure 7 mask experiment. arXiv perpetual nonexclusive license is not treated as a reuse license. Scientific reference only. |
| Choi, Uh, Yoo, Ha, [StarGAN v2, arXiv:1912.01865v2](https://arxiv.org/html/1912.01865v2) | §2 networks/objectives, §3.1 and Table 1 ablation, Table 2/§3.2 FID/LPIPS and authors' artifact conjecture, Appendices B/C/E for weights, evaluation and dimensions. [Versioned record](https://arxiv.org/abs/1912.01865v2) links [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/); article adaptation is explicitly attributed. No source image is copied. |
| Odena, Olah, Shlens, [AC-GAN, arXiv:1610.09585v4](https://arxiv.org/html/1610.09585v4) | §3 auxiliary class/source heads. Reference to architectural idea; StarGAN's real-only classifier update is separately stated, not confused with all AC-GAN loss terms. |
| Mescheder, Geiger, Nowozin, [arXiv:1801.04406v4](https://arxiv.org/html/1801.04406v4) | §2.2 mathematical Dirac-GAN, §3.3 zero-centered penalty, §4.1 R1, §4.2 assumptions I–III/Theorem 4.1. Own sign convention and local linearization; source theoretical result is not claimed as global neural training convergence. |
| Liu, Huang, Mallya, Karras, Aila, Lehtinen, Kautz, [FUNIT, arXiv:1905.01723v2](https://arxiv.org/html/1905.01723v2) | §3.2 multi-task binary discriminator. Reference only; no FUNIT software, images or examples used. |
| `yunjey/stargan` commit `94dd002e93a2863d9b987a937b85925b80f7a19f` | `model.py` blob `3d0e62755f9edda24d0ca8585f5fbcd0e3af4523`: tiled labels, zero padding, training-time instance statistics. `solver.py` blob `f2079b294e30022e9400d0f411f5f309db565e23`: shuffled target labels, BCE, detached fake/GP for D, fake/class/reconstruction for G. `LICENSE` blob `8864d4a39633c1bcb33a8983d146d0b6390ed3d0`, MIT. Read as implementation evidence; no implementation copied into local practice. |
| `clovaai/stargan-v2` commit `875b70a150609e8a678ed8482562e7074cdce7e5` | `core/model.py` blob `c503549424f9962ef1689f7225a4af871bae5bf0`: AdaIN scale `1+gamma`, bottleneck layers. `core/solver.py` blob `e20552149f6361b0377b2c6e776dc5c9f073e6fc`: nonsaturating/auxiliary losses. `LICENSE` blob `50b5d37ae95b22c575e12ce150d6f5ec8b4bc47e` and `NOTICE` blob `955ab9a74778c7a01cc8f9485205a3d775a567d7`: NAVER CC BY-NC 4.0 and component exceptions. No local code reuse/download recommendation for this implementation. |

The v2 paper presents the mathematical diversity objective symmetrically; the official implementation detaches its second generated output when evaluating that loss. Our schematic explains the paper's objectives, not a byte-for-byte implementation or gradient trace. The toy practice uses neither implementation.

## Scientific and teaching corrections

- v1 gradient penalty is a D regularizer; the generator's adversarial term is explicitly `-E D_src(G(...))`, with no gradient through GP.
- Reflection-padding cancellation is restricted to current-image instance statistics during training. Zero-padding introduces a spatial difference at the boundary; normalization also changes the interior through its global channel statistics. The old implication that the effect stays at the boundary is removed.
- Style reconstruction encourages use of distinct styles but does not prevent mapping-network collapse. Varying latent codes does not guarantee distinct outputs. Diversity-weight decay is an empirical training choice, not a stability theorem.
- R1's example is a local linearized continuous-time minimax system. The theorem requires realizability, the discriminator equilibrium condition, regular manifolds, nondegeneracy/expressivity and sufficiently small learning rates. It is not a global StarGAN-v2 guarantee.
- Paper FID/LPIPS values remain labeled source measurements. Sample count confounds part of the ablation; equal counts do not establish content preservation. The authors' artifact explanation is marked a conjecture. Single-index domains describe the published setup, not an impossibility theorem for overlapping attributes.

## Execution and asset checks

`python3 scripts/notes/check-stargan-renewal.py` passes using the standard library. Its saved JSON records:

- BCE loss `2.12580648793`, joint label probability `0.11933668585`, flipped-logit loss `4.02580648793`; finite-difference gradient error below `7e-12`.
- 1,500 boundary cells out of 16,384, fraction `0.091552734375`; reflected-offset cancellation below `3e-15`; zero-padding changes a chosen interior normalized value by about `0.76618` in the original numeric map.
- Norm-one linear critic: GP zero, R1 `0.5`. Own initial state `(0.7,-0.2)` in the local damped system has squared radius `0.53` at time zero and about `0.00406916` at time eight. Finite-difference ODE checks pass; undamped Euler steps are separately shown to expand the radius.
- Original three-point practice replay matches its saved results: zero content/cycle error, unit target accuracy, identity-map target accuracy zero, style separation `0.8`. These are analytic diagnostics, not learned-model quality.

`node scripts/notes/check-stargan-figures.cjs` passes: both figure frontmatters in EN/RU; eleven Astro source files compile; strict MDX and all 162 mathematical spans per locale parse and match; label channels, latent/style dimensions, step counts, arrow endpoints and scoped notice links are checked. This is source/compiler validation, not a claim of browser visual QA, production build or hosted execution.

Local dependencies are the shared Figure/locale/sequence primitives and the Sub helper's transitive sampling/geometry modules. They were read; no source media or remote assets are loaded by these figures. The preexisting Mulberry32 implementation in the transitive helper remains covered by its exact public-domain/CC0 source evidence and `public/licenses/mulberry32.txt`; it is not used to invent a benchmark result. The current topic does not assert rights over unrelated code merely because it imports a helper module.

## Independent scoped review

On 2026-11-13, `takedown_routing` independently read both complete notes, both figures and all 15 local figure-closure sources, notices and executable practice wiring. Fresh Python/Node checks passed. Separate Decimal sigmoid/product calculations reproduced BCE `2.125806487931688`; rational Jordan/R1 calculations reproduced the saved times; literal 49-cell kernel coverage/normalization and the three-point diagnostic matched. The reviewer compared the primary v1/v2 methods, reported values and protocols, AC-GAN, FUNIT and the Mescheder assumptions/sign convention. Eight pinned raw Git blobs matched the reported identities. The versioned v2 article's license link resolved to CC BY 4.0 and its conditions matched the scoped notice. A fresh request for the redundant original C gist was blocked (403); that C evidence remains the earlier author/coordinator check, while the pinned JavaScript public-domain dedication was freshly verified.

An independent standalone actual Astro render with project CSS and shared FigureDefs covered eight EN/RU × 390/1000-pixel × light/dark configurations, without page or SVG-text overflow. The reviewer visually inspected RU 390/light and EN 1000/dark. This was an all-steps standalone figure view, not full-page interactivity or production verification. No blocker or additional source-specific artifact was found in this scoped pass. Earlier `gm_practice_review` independently covered the shared practice only. Build/CI, coordinator production checks and unrelated course material are outside this report.
