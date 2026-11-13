# Normalizing flows: complete scoped source and numerical review

Reviewed 2026-11-13 by Codex `course_licenses`. Scope: both complete localized notes, all seven imported figures, their transitive source helpers, the replacement practice experiment and the new numerical verifier. This is a complete decision for these exact files and uses, not approval of other Generative Models notes or a claim about every possible historical source.

## Material changed

The former opening matches Stanford CS236 lecture 7, slide 6: uniform `[0,2]`, transformation `4Z`, density at `X=4`. Citation alone was not used to authorize retaining this distinctive exercise. The opening now uses a newly specified triangular density, decreasing affine map `X=3-2Z`, point density, full normalization and orientation. It exercises a different input distribution and reflection as well as stretching.

The earlier optional-practice dependency on `nflib`/external course files was already replaced in this batch with the standalone 4,096-point affine-flow experiment in `generative-practice.py`. The underlying original `karpathy/pytorch-normalizing-flows` repository did not have an applicable license grant established in the earlier audit. Its source remains bibliography-only; no module, model weights or data are loaded. HSE's umbrella license was not treated as authorization for that dependency.

Full-body review also corrected:

- Topology versus peak count. A diffeomorphism preserves support topology; it can turn one smooth density peak into two. The strictly positive Gaussian-mixture example is representable but badly conditioned near its gap, not topologically impossible.
- Ten weight norms: `23^10 = 4.14265112136e13` meets the displayed slope; `22^10` did not.
- Affine MLE: the denominator is `N`. Omitting the Jacobian makes the objective improve towards a finite supremum as scale grows; it does not diverge to infinity.
- Finite bands use average density; a finite curved cell's area factor is an average of local determinants, not exactly the determinant at its centre.
- The history sentence attributes the use for variational inference to Rezende and Mohamed without saying they introduced flows to all of machine learning.
- Real NVP's symmetric logit preprocessing is linked to the exact primary implementation. Its `data_constraint=.9` gives `.05+.9*x/256`; this is distinct from the paper's displayed asymmetric notation.

## Source-to-material decisions

| Primary source | Checked use and decision |
| --- | --- |
| [Papamakarios et al., arXiv v2](https://arxiv.org/html/1912.02762v2), JMLR 22(57), 2021 | Sections 2.1–2.4 and 5.5: change of variables, conditional-CDF expressivity, objectives, history, support topology. Scientific ideas/formulas and attributed background; no paper artwork/prose/code adopted. The local one-/two-dimensional parameters and numerical tables are independently evaluated. |
| [Rezende and Mohamed, PMLR37](https://proceedings.mlr.press/v37/rezende15.html), 2015 | Primary publication metadata and stated variational-inference role. Planar/radial details are a handoff to the next note, not implemented here. |
| [Stanford CS236 notes](https://deepgenerativemodels.github.io/notes/flow/) and [lecture7 PDF](https://deepgenerativemodels.github.io/assets/slides/cs236_lecture7.pdf) | Directly compared the opening, CDF derivation and generic volume illustration. Exact opening exercise replaced. Standard CDF/change-of-variables reasoning remains cited; no lecture image or source prose retained. |
| [Isachenko lecture2 source](https://github.com/r-isachenko/2025-DGM-MIPT-YSDA-course/blob/3d0e73d96a3a08a908348e34b57a138efea5485e/lectures/lecture2/Lecture2.tex) | Commit `3d0e73d96a3a08a908348e34b57a138efea5485e`, blob `83b96870d9bbf010ade35f92c364ad53ed84fbb1`: normalizing-flow prerequisite/definition/Jacobian sections and embedded-figure references compared. Its imported images and slide diagrams are not local dependencies; local grids/curves are formula-generated. No reuse grant inferred. |
| [Theis et al., arXiv v3](https://arxiv.org/html/1511.01844v3) | Section3.1: dequantization/Jensen relationship. Local density lower-bound example and numerical rescaling are separately checked; no benchmark data imported. |
| [Real NVP, arXiv v3](https://arxiv.org/html/1605.08803v3) and [pinned primary implementation](https://github.com/tensorflow/models/blob/36101ab4095065a4196ff4f6437e94f0d91df4e9/research/real_nvp/real_nvp_multiscale_dataset.py#L1063-L1076) | Paper4.1 and code parameters/operations. Code commit `36101ab4095065a4196ff4f6437e94f0d91df4e9`, blob `c0e1864f1988cd983cdba14ced2462dae1b67e29`. The note explains the mathematical preprocessing and independently calculates its derivative; no TensorFlow code or CelebA/ImageNet/CIFAR data copied/run. |
| [Glow, arXiv v2](https://arxiv.org/html/1807.03039v2) | Section2, eq2: discretization constant. No samples, implementation or trained model used. |
| [Murphy, book2](https://probml.github.io/pml-book/book2.html), 2023 | Background citation to chapter23. Primary author page identifies CC BY-NC-ND for its draft; this is not permission to adapt its expression. No book exercise, table, illustration or code is an input here. Full chapter prose comparison was not performed. |
| HSE course / Karpathy repository | Historical bibliography and removal boundary only. Replacement practice has no import/download dependency. Prior detailed source audit remains in `huggingface-and-ai-review.md`. |
| Shared Mulberry32 helper | Source-specific code explicitly recognized in `geometry.ts`, even though this flow figure uses only its deterministic geometry/density helpers. Exact bryc public-domain and Tommy Ettinger CC0 evidence/notice are in `mulberry32-source-review.md`, `public/licenses/mulberry32.txt`, and `shared-figure-geometry-random.json`. |

The mathematical Gaussian-CDF approximation in `flow-math.ts` already identifies Abramowitz–Stegun 7.1.26. Its coefficients express that numerical formula, not a copied third-party implementation. The new verifier independently integrates the Gaussian and checks the local approximation over `[-4,4]`; no global numerical-library guarantee is claimed.

## Asset and code closure

- `ZXMapping`: three explicit points transformed by the local analytic two-step map.
- `ChangeOfVariables1D`: `z + .8*tanh(2z)`, inverse bisection within the fixed latent bracket `[-20,20]`, Gaussian density and a probability band; all curves computed locally. This solver covers the plotted and checked range, not arbitrary real inputs.
- `LocalVolume`: local coupling/shear map and sampled cell boundaries. Two-decimal area labels are verified against analytic area integrals; finite polygon approximation is stated as such.
- `JacobianSquares` and `DeterminantCases`: local linear matrix images, determinant sign/area and singular collapse, not image files.
- `TriangularJacobian`: symbolic triangular entries and order-of-growth bars, with cubic cost explicitly an order estimate.
- `ModelFamilies`: source-native SVG primitives showing generic GAN/VAE/flow connectivity. No imported architecture picture, dataset sample or model output. It is a conceptual schematic, not a trained experiment.
- Transitives: `flow-math.ts`, `geometry.ts`, `Figure.astro`, `src/utils/lang.ts`; all read. No runtime image/network/data/model loader. The listed public notice records known shared PRNG reuse rather than claiming all helper code newly authored today.

## Independent review

Root read the complete English note and source/material report, checked the opening, finite bands, inverse/triangular logic, topology, affine MLE and dequantization units, and replayed the verifier. `takedown_routing` independently compared all 321 pre-final-clarification EN/RU math spans and recomputed table values, probability bands, separated-mixture slope, pixel corrections and conditional-CDF example with Python `erf`; all agreed. Its figure pass covered all seven imported components. Final review shortened the two changed captions, documented the fixed inverse bracket, and added the explicit onto-R limit argument to both locales; no numerical outputs changed. Both final MDX bodies compile, and all 325 final EN/RU math spans match exactly.

## Executed verification

`node scripts/notes/check-normalizing-flow-renewal.cjs` checks the saved `normalizing-flow-checks.json`; `--write` regenerates it. It uses the installed TypeScript compiler to evaluate local figure frontmatter and independently specified Simpson integration, finite differences, explicit inverse formulas and scalar CDF inversion. This new verifier and its observations were authored with Codex assistance.

- New opening: density `.5`, total mass `1`, mapped middle-interval mass `.5`.
- Nonlinear 1D example: total mass `1`; peak `x=1.501`, density `.233749690293`; band mass `.151634623997`, width ratio `2.12843767146`, average densities `.379086559992` and `.178105549002`.
- 2D map: maximum checked finite-difference determinant error `1.01e-11`, inverse error `2.23e-16`. Polygon area ratios `.646473828515`/`1.55097192009` versus analytic averages `.646472716297`/`1.55080742735`; both retain the stated two-decimal labels. The verifier permits `2e-4` absolute polygon discretization error, not exact centre-determinant equality.
- Separated Gaussian mixture: central slope `3.94814800913e13`; latent edge for the gap `3.96940151433e-5`.
- Logit bit corrections: `3.80325103343`, `6.15198526217`, `3.80325103343`; rescaling correction `6.99435343686`.
- Conditional-CDF worked point: `(.632120558829,.691462461274)`, joint density `.129517595666`.
- All seven figure frontmatters execute; both complete localized MDX bodies compile with remark-math/KaTeX. The replacement Python practice was independently replayed by `gm_practice_review` in the earlier bounded pass; it verifies likelihood only, not neural/spline training.

No source-specific unverified reused artifact remains identified within this scoped note/dependency review. Scientific references, cited methods, independently evaluated formulas and approved PRNG reuse are distinguished from copying expression. This is not a blanket permission for any linked paper/book/repository, and not an assertion that a full neural flow or image benchmark was run. Browser layout, release CI and hosted verification are separate parent checks.
