# Focused source comparison follow-up, 2026-11-13

This report extends the source inventory and the initial material-use review with bounded comparisons of Deep Learning, MLOps and DevOps teaching material. The comparisons did not identify an additional specific copied artifact requiring withdrawal. Two attribution corrections accompany this report: the explicitly adapted uv Dockerfile now has its source, change description and license notice; the LLMOps statistical correction now names its primary source and assumptions.

This is not a declaration that either site or any complete course is legally cleared. Exact-match checks can miss paraphrases, translations, renamed code and redrawn figures. A citation is neither evidence of permission nor, by itself, evidence of copying. Existing publication holds remain in force; this report does not reopen the withdrawn NLP notes or the two withheld MLOps notes. See [the withdrawal record](2026-11-13-nlp-source-review.md).

## Deep Learning: D2L comparison

### Scope and reproducible method

The local comparison covered all fourteen D2L-citing notes under `src/content/notes/deep-learning/` and the corresponding files under `src/content/notes-ru/deep-learning/`, at FP revision `ef3644b7de5bc8a6395d7b640d5b87b9bf45de72`.

The upstream comparison used [d2l-ai/d2l-en at revision `23d7a5aecceee57d1292c56e90cce307f183bb0a`](https://github.com/d2l-ai/d2l-en/tree/23d7a5aecceee57d1292c56e90cce307f183bb0a). All 91 selected Markdown files downloaded successfully. The selection included every Markdown file in these directories:

- `chapter_introduction`
- `chapter_preliminaries`
- `chapter_linear-regression`
- `chapter_linear-classification`
- `chapter_multilayer-perceptrons`
- `chapter_convolutional-neural-networks`
- `chapter_convolutional-modern`
- `chapter_optimization`
- `chapter_computational-performance`
- `chapter_computer-vision`
- `chapter_hyperparameter-optimization`

It also included `chapter_attention-mechanisms-and-transformers/vision-transformer.md`. This covers the chapter ranges named in the fourteen local D2L bibliography entries; it is not a comparison against every historical edition of the book.

Checks performed:

1. English prose was normalized to lowercase alphabetic tokens after removing front matter, fenced code, math spans and the local reference section. There were **zero matching twelve-word sequences** against the selected upstream prose. This is an exact-sequence screen, not a semantic similarity or translation test.
2. Fenced code was tokenized and compared for longest contiguous exact matches. The longest matches per note were **9–18 tokens**, consisting of ordinary API expressions such as adjacent PyTorch layers. These short matches do not establish copying of a distinctive implementation.
3. Every RU/EN note pair had matching Python executable ASTs after ignoring comments and replacing string contents with a placeholder. Numeric constants and executable structure were retained. This extends the code comparison to both locales, but not the English prose comparison to Russian prose.
4. All **49 imported figure components** were inventoried. A source scan found no literal external image URLs or literal image `src`/`href` references in them. They are locally generated Astro diagrams. Six distinctive figures were inspected in more detail: `CrossCorrelation`, `IouGeometry`, `NmsSteps`, `PatchTokens`, `ImagenetErrors` and `UNetFlow`. Local rendering alone does not prove that a figure's expression was independently created.
5. The principal worked examples and experiment structures were compared with the corresponding upstream chapters, as recorded below. No training runs were executed as part of this source comparison.

### Per-note evidence

Paths in the first column are relative to `src/content/notes/deep-learning/`; the same filenames exist in the Russian tree. The source links are pinned to the reviewed D2L revision.

| Local note | Compared source and concrete evidence |
| --- | --- |
| `deep-learning.mdx` | [Linear regression from scratch](https://github.com/d2l-ai/d2l-en/blob/23d7a5aecceee57d1292c56e90cce307f183bb0a/chapter_linear-regression/linear-regression-scratch.md): FP uses a two-point hand calculation and sklearn digits representations; D2L uses synthetic regression with weights `[2, -3.4]` and bias `4.2`. FP's ImageNet chart comments identify Russakovsky et al. and He et al. as the factual data sources. |
| `pytorch-and-autograd.mdx` | [Automatic differentiation](https://github.com/d2l-ai/d2l-en/blob/23d7a5aecceee57d1292c56e90cce307f183bb0a/chapter_preliminaries/autograd.md): FP implements scalar `Value` nodes and tests `(a*b+a)**2`; D2L begins with `arange(4)` and `2*dot(x,x)`. The broadcasting and digits-pipeline checks are also different examples. |
| `convolution.mdx` | [Convolution layers](https://github.com/d2l-ai/d2l-en/blob/23d7a5aecceee57d1292c56e90cce307f183bb0a/chapter_convolutional-neural-networks/conv-layer.md): FP uses a 4-by-4 input and 3-by-3 vertical-edge kernel, producing `[[5,7],[6,6]]`; D2L uses a 3-by-3 input and 2-by-2 kernel. FP's local figure computes the former example, and its loop implementation covers channels, stride, padding and dilation. |
| `cnn-architectures.mdx` | [Modern CNN chapter](https://github.com/d2l-ai/d2l-en/tree/23d7a5aecceee57d1292c56e90cce307f183bb0a/chapter_convolutional-modern) and [fine-tuning](https://github.com/d2l-ai/d2l-en/blob/23d7a5aecceee57d1292c56e90cce307f183bb0a/chapter_computer-vision/fine-tuning.md): FP has torchvision-sized parameter counts and a digits depth experiment. Standard LeNet, Inception and residual structures recur, but the comparison did not identify a distinctive copied implementation or the upstream hotdog transfer-learning experiment. |
| `normalization-and-initialization.mdx` | [Numerical stability and initialization](https://github.com/d2l-ai/d2l-en/blob/23d7a5aecceee57d1292c56e90cce307f183bb0a/chapter_multilayer-perceptrons/numerical-stability-and-init.md) and [batch normalization](https://github.com/d2l-ai/d2l-en/blob/23d7a5aecceee57d1292c56e90cce307f183bb0a/chapter_convolutional-modern/batch-norm.md): FP tests 50-layer variance propagation, gradients for `[1,2,3,6]` and a 30-layer digits model. D2L implements batch normalization and trains LeNet on Fashion-MNIST. |
| `losses-and-regularization.mdx` | [Weight decay](https://github.com/d2l-ai/d2l-en/blob/23d7a5aecceee57d1292c56e90cce307f183bb0a/chapter_linear-regression/weight-decay.md), [concise softmax regression](https://github.com/d2l-ai/d2l-en/blob/23d7a5aecceee57d1292c56e90cce307f183bb0a/chapter_linear-classification/softmax-regression-concise.md) and [dropout](https://github.com/d2l-ai/d2l-en/blob/23d7a5aecceee57d1292c56e90cce307f183bb0a/chapter_multilayer-perceptrons/dropout.md): FP uses logits `[100,0,-20]`, a four-value dropout demonstration and noisy-label digits. D2L's dropout example uses a 2-by-8 `arange` matrix and Fashion-MNIST. |
| `optimizing-deep-networks.mdx` | [Optimization chapter](https://github.com/d2l-ai/d2l-en/tree/23d7a5aecceee57d1292c56e90cce307f183bb0a/chapter_optimization), including [scheduling](https://github.com/d2l-ai/d2l-en/blob/23d7a5aecceee57d1292c56e90cce307f183bb0a/chapter_optimization/lr-scheduler.md): FP's noise-gradient simulation, 16-block digits warm-up test and mixed-precision checks differ from D2L's scheduler classes and LeNet training. The mathematical cosine-schedule form is shared standard material. |
| `training-in-practice.mdx` | [Hyperparameter optimization](https://github.com/d2l-ai/d2l-en/tree/23d7a5aecceee57d1292c56e90cce307f183bb0a/chapter_hyperparameter-optimization): FP demonstrates overfitting one digits batch, injected training bugs and an LR range test. The cited upstream chapter uses its own trainer and configuration-space workflow on Fashion-MNIST. |
| `object-detection.mdx` | [Detection chapters](https://github.com/d2l-ai/d2l-en/tree/23d7a5aecceee57d1292c56e90cce307f183bb0a/chapter_computer-vision), particularly [anchors and NMS](https://github.com/d2l-ai/d2l-en/blob/23d7a5aecceee57d1292c56e90cce307f183bb0a/chapter_computer-vision/anchor.md): FP's six A–F boxes, IoU `6/26` and synthetic AP experiment differ from D2L's dog/cat boxes and anchors. IoU and greedy NMS share ordinary algorithm structure; no distinctive copied code sequence was identified. |
| `semantic-segmentation.mdx` | [Segmentation dataset](https://github.com/d2l-ai/d2l-en/blob/23d7a5aecceee57d1292c56e90cce307f183bb0a/chapter_computer-vision/semantic-segmentation-and-dataset.md), [transposed convolution](https://github.com/d2l-ai/d2l-en/blob/23d7a5aecceee57d1292c56e90cce307f183bb0a/chapter_computer-vision/transposed-conv.md) and [FCN](https://github.com/d2l-ai/d2l-en/blob/23d7a5aecceee57d1292c56e90cce307f183bb0a/chapter_computer-vision/fcn.md): FP trains a tiny U-Net on generated disks and squares. D2L's FCN uses pretrained ResNet-18 and Pascal VOC2012. FP's U-Net figure reflects its own channel counts and dimensions. |
| `vision-transformers.mdx` | [Vision Transformer](https://github.com/d2l-ai/d2l-en/blob/23d7a5aecceee57d1292c56e90cce307f183bb0a/chapter_attention-mechanisms-and-transformers/vision-transformer.md): FP uses explicit patch unfolding, a linear embedding and `TransformerEncoder` on 8-by-8 digits. D2L uses convolutional patch embedding and its own ViT blocks on resized Fashion-MNIST. FP's patch figure uses a bundled digits image and its own example dimensions. |
| `self-supervised-learning.mdx` | [Fine-tuning](https://github.com/d2l-ai/d2l-en/blob/23d7a5aecceee57d1292c56e90cce307f183bb0a/chapter_computer-vision/fine-tuning.md): FP implements NT-Xent and SimCLR on digits. The cited D2L chapter's concrete example is ImageNet-to-hotdog transfer, not this contrastive experiment. |
| `adversarial-examples.mdx` | [Environment and distribution shift](https://github.com/d2l-ai/d2l-en/blob/23d7a5aecceee57d1292c56e90cce307f183bb0a/chapter_linear-classification/environment-and-distribution-shift.md): FP has a three-dimensional FGSM calculation and digits attacks. The cited D2L section covers distribution shift without that FGSM experiment. |
| `model-compression.mdx` | [Asynchronous computation](https://github.com/d2l-ai/d2l-en/blob/23d7a5aecceee57d1292c56e90cce307f183bb0a/chapter_computational-performance/async-computation.md) and [hardware](https://github.com/d2l-ai/d2l-en/blob/23d7a5aecceee57d1292c56e90cce307f183bb0a/chapter_computational-performance/hardware.md): FP has digits pruning, SVD and distillation experiments. The cited D2L sections address execution timing and hardware, rather than these experiments. |

### D2L license boundary and remaining work

The pinned [README license summary](https://github.com/d2l-ai/d2l-en/blob/23d7a5aecceee57d1292c56e90cce307f183bb0a/README.md#license-summary) separates **book text and figures under CC BY-SA 4.0** from **sample/reference code under a modified MIT license**. The actual [sample-code license](https://github.com/d2l-ai/d2l-en/blob/23d7a5aecceee57d1292c56e90cce307f183bb0a/LICENSE-SAMPLECODE) names Amazon.com, Inc. or its affiliates and omits the usual MIT notice-retention paragraph. Do not substitute Apache terms or indiscriminately apply the book license to its sample code.

This pass found no specific D2L-derived artifact for which a new rewrite, removal or adaptation notice could be justified from the observed evidence. It did not establish independent authorship of all fourteen notes. Remaining work includes semantic comparison of prose in both languages, the unexamined figure expression, historical source versions, and the other papers, datasets and code cited by each note. In particular, sklearn digits data and figures based on non-D2L papers are outside this D2L-specific conclusion.

## MLOps: remaining six source-linked notes

### Scope and sources

The comparison covered both locales of `llmops`, `llm-inference-systems`, `what-mlops-is`, `serving-models`, `monitoring-and-drift` and `testing-ml-systems` under `src/content/notes{,-ru}/mlops/`.

Upstream was [xufana/llm-system-engineering at revision `b3448fee526eb235b318284f26941875ed52b9fa`](https://github.com/xufana/llm-system-engineering/tree/b3448fee526eb235b318284f26941875ed52b9fa): 42 `.py`, `.html`, `.js`, `.md` and `.ipynb` files from the recursive tree, excluding `/grafana_data/`, `02week_RAG/` and duplicate compiled `06week_evaluation/lecture_evaluation.html`. Relevant prose, code and notebook cells were read directly. A lowercase twelve-word/token window scan used notebook cell sources and stripped HTML tags; script text remained in the fingerprint pass. Only shared Zheng paper bibliography windows matched, with no body/code twelve-token run identified.

Primary comparisons included [inference anatomy and budget](https://github.com/xufana/llm-system-engineering/blob/b3448fee526eb235b318284f26941875ed52b9fa/01week_introduction/part_01_anatomy_and_budget.html), [transformer inference](https://github.com/xufana/llm-system-engineering/blob/b3448fee526eb235b318284f26941875ed52b9fa/01week_introduction/part_02_transformer_inference.html), [evaluation lecture source](https://github.com/xufana/llm-system-engineering/blob/b3448fee526eb235b318284f26941875ed52b9fa/06week_evaluation/src/lecture/body.html), the evaluation seminar and shop environment, [system design](https://github.com/xufana/llm-system-engineering/blob/b3448fee526eb235b318284f26941875ed52b9fa/07week_system_design/07_lecture.html), and [observability source](https://github.com/xufana/llm-system-engineering/tree/b3448fee526eb235b318284f26941875ed52b9fa/08week_observability/src), together with project templates.

| Local note | Evidence and unresolved dependency |
| --- | --- |
| `llmops` | The note explicitly credits the HSE material for the release tuple and CI regression framing. The upstream evaluation lecture teaches PR regression and incident-derived cases; seminar cells 71–80 teach paired comparisons and guardrails that can block a better version. This remains **source-informed teaching structure**. The concrete artifacts differ: upstream has 12 shopping-agent tasks, five trials and side effects; FP has 150 routing items, three trials and slice-level probabilities. No upstream matches were found for `P_INTENT`, `0.796`, `0.867`, `0.0198` or `0.005732`. This does not establish that all expression is independent. |
| `llm-inference-systems` | The local note uses Qwen3-8B KV-cache arithmetic at 144 KiB per token and a 4,000-request NumPy scheduler. The upstream uses Llama3-8B at 128 KiB and cost calculators. No matching scheduler or recorded results were identified; the in-text conceptual attribution remains. |
| `what-mlops-is` | The local fraud-feature and weekly-pipeline examples differ from the upstream anatomy and project examples inspected. No particular copied code or recorded result was identified. |
| `serving-models` | The local fixed-overhead batching experiment and Triton configuration differ from the inspected inference and observability examples. No particular copied code or recorded result was identified. |
| `monitoring-and-drift` | The local PSI, KS and MMD Gaussian simulations differ from the upstream operational observability examples. No particular copied code or recorded result was identified. |
| `testing-ml-systems` | The local loan-approval tests using region and debt differ from the upstream shopping-agent tests. No particular copied code or recorded result was identified. |

No additional specific artifact withdrawal was established by this comparison. All six retain unresolved provenance review; the result is not permission to adapt the upstream course, and it does not change the separate holds on `ml-system-design` or `cost-and-efficiency`. Historical upstream versions, short reuse, translation and rendered-figure expression were not exhaustively compared.

### Statistical attribution correction

Both localized `llmops.mdx` notes now name the correction for the true win proportion as the symmetric-error special case of the Rogan–Gladen estimator. The explanation states the assumptions: sensitivity and specificity both equal `alpha > 1/2`, and the displayed standard error treats `alpha` as known. The existing HSE attribution, mathematical expression, code and recorded outputs remain.

The added primary bibliography entry is W. J. Rogan and B. Gladen, *Estimating prevalence from the results of a screening test*, American Journal of Epidemiology 107(1), 71–76, 1978, [DOI 10.1093/oxfordjournals.aje.a112510](https://doi.org/10.1093/oxfordjournals.aje.a112510). Metadata was checked against the publisher record, Crossref and [PubMed 623091](https://pubmed.ncbi.nlm.nih.gov/623091/). This corrects a missing scientific attribution; it is not evidence of rights clearance for the surrounding lesson.

## DevOps: Missing Semester, Pro Git and uv

### Scope and pinned source snapshots

The English body comparison covered sixteen FP DevOps notes and sixteen corresponding BIASED DevOps bodies: `builds-and-dependencies`, `cloud-building-blocks`, `container-images`, `continuous-delivery`, `continuous-integration`, `git`, `incidents-and-security`, `infrastructure-as-code`, `kubernetes`, `kubernetes-in-practice`, `networking-for-services`, `observability`, `resilience-and-capacity`, `slos-and-alerting`, `the-shell` and `what-devops-is`. A separate upstream Git-hash fingerprint check covered all 64 localized bodies across the two sites. The latter is not a Russian prose comparison.

Upstream consisted of five 2026 Missing Semester lectures and five Pro Git sections. The following content pins are **Git blob IDs**, not commit IDs. Their hashes were recomputed from the downloaded snapshots using the Git `blob <byte-length>\0<content>` representation and matched all ten recorded values. The linked GitHub blob API records identify the exact source content; the repository paths provide context.

| Repository | Source path | Verified content pin |
| --- | --- | --- |
| `missing-semester/missing-semester` | `_2026/course-shell.md` | [`2a4e3ec3b20586e783e93666b02e9a2721b0ef7d`](https://api.github.com/repos/missing-semester/missing-semester/git/blobs/2a4e3ec3b20586e783e93666b02e9a2721b0ef7d) |
| `missing-semester/missing-semester` | `_2026/command-line-environment.md` | [`7d4d7820706f623fb57967e30e39e2de61cee326`](https://api.github.com/repos/missing-semester/missing-semester/git/blobs/7d4d7820706f623fb57967e30e39e2de61cee326) |
| `missing-semester/missing-semester` | `_2026/version-control.md` | [`6a94990b4ed0701c9e25808cd3f280043d7a915c`](https://api.github.com/repos/missing-semester/missing-semester/git/blobs/6a94990b4ed0701c9e25808cd3f280043d7a915c) |
| `missing-semester/missing-semester` | `_2026/shipping-code.md` | [`46dfeb0901b3198489264af5d126c1d14c565213`](https://api.github.com/repos/missing-semester/missing-semester/git/blobs/46dfeb0901b3198489264af5d126c1d14c565213) |
| `missing-semester/missing-semester` | `_2026/code-quality.md` | [`6f68c62df3209161417e4ece73559052caed8acc`](https://api.github.com/repos/missing-semester/missing-semester/git/blobs/6f68c62df3209161417e4ece73559052caed8acc) |
| `progit/progit2` | `book/10-git-internals/sections/objects.asc` | [`3182d9f9d9dfa1bf1abc60bb3f6e03665bbcb5f3`](https://api.github.com/repos/progit/progit2/git/blobs/3182d9f9d9dfa1bf1abc60bb3f6e03665bbcb5f3) |
| `progit/progit2` | `book/07-git-tools/sections/rewriting-history.asc` | [`7fbb06d7fbd1667bf8979b0edce1ff526d8746c8`](https://api.github.com/repos/progit/progit2/git/blobs/7fbb06d7fbd1667bf8979b0edce1ff526d8746c8) |
| `progit/progit2` | `book/03-git-branching/sections/rebasing.asc` | [`c66535246259a8a8bbaa4957be0dc9f746e6afd4`](https://api.github.com/repos/progit/progit2/git/blobs/c66535246259a8a8bbaa4957be0dc9f746e6afd4) |
| `progit/progit2` | `book/03-git-branching/sections/basic-branching-and-merging.asc` | [`a894b670259e312116f7d8cc8f712e61378a09b5`](https://api.github.com/repos/progit/progit2/git/blobs/a894b670259e312116f7d8cc8f712e61378a09b5) |
| `progit/progit2` | `book/07-git-tools/sections/debugging.asc` | [`dd615c1c7dce6e40e4b91896c4a4e00f0b1ad5e1`](https://api.github.com/repos/progit/progit2/git/blobs/dd615c1c7dce6e40e4b91896c4a4e00f0b1ad5e1) |

### Observed similarities and differences

The normalized ten-token exact-match comparison excluded bibliography sections. Its only matching sequence was ordinary Git merge-error output. No upstream full SHA-1 fingerprint from the 25 found in the inspected chapters occurred in the 64 local RU/EN bodies.

The local shop example's Git blobs were recomputed and matched the displayed values:

- `README` containing `Shop service\n`: `968833021ad0e455854d495ed63783700c559153`.
- Original app: `aa11c8780835909b20ba5d886e45b00f65b2026c`.
- Rounded app: `b7332794ea787bc9b0e3495d430886e3c45e681c`.

These checks show that the displayed hashes are reproducible from the local example; they are not an authorship certificate. Additional differing samples were the 1,200-row nginx/API orders-and-search data, the `calc` Make dependency graph and hash builder, the toy dependency resolver, local OCI-blob construction, SQLite migration and Kubernetes arithmetic. The local `ObjectGraph`, `MergeRebase` and `PipelineFds` figures use source-native components and local data; no imported upstream image was identified in those samples.

This pass did not establish a particular copied Missing Semester or Pro Git artifact requiring an additional withdrawal. It did not exhaustively compare translations, paraphrases, rendered figure expression, every cited Pro Git chapter or historical versions. The NC-source questions in the original inventory remain material if such expression is found; an absence of a long exact match does not resolve them.

### Explicit uv Dockerfile adaptation and notice

The `container-images` note already identified its Dockerfile as adapted from Astral's uv documentation. That dependency is retained and documented rather than treated as an independently created example.

The reviewed upstream revision is `9b4fe9027f1682ed3e3c96d990ce9a9e1bb51b5d`:

- [Using uv in Docker source](https://github.com/astral-sh/uv/blob/9b4fe9027f1682ed3e3c96d990ce9a9e1bb51b5d/docs/guides/integration/docker.md).
- [Documentation license policy](https://github.com/astral-sh/uv/blob/9b4fe9027f1682ed3e3c96d990ce9a9e1bb51b5d/docs/reference/policies/license.md), offering MIT or Apache 2.0 at the user's option.
- [Actual MIT license](https://github.com/astral-sh/uv/blob/9b4fe9027f1682ed3e3c96d990ce9a9e1bb51b5d/LICENSE-MIT), explicitly including associated documentation and crediting Copyright (c) 2025 Astral Software Inc. No separate documentation-specific license file was found in the reviewed tree.

The adaptation selects the MIT option. Both localized `src/content/notes{,-ru}/devops/container-images.mdx` files now link the pinned source, policy and public notice beside the Dockerfile; the code comments preserve the credit. The change description identifies the retained installation/caching patterns and the local changes: `calc` source layout, Uvicorn entrypoint, image versions/digests, UID/GID 10001 and OCI source/revision labels. `public/THIRD_PARTY_NOTICES.txt` contains the exact full upstream MIT license and attribution for this example.

This notice addresses the identified uv documentation adaptation. It does not license every other source or component mentioned by the container lesson. The Dockerfile's code was not changed by the attribution correction, and no container build or runtime verification was performed in this follow-up.

## Validation boundary

The follow-up compared source content, verified the recorded upstream snapshot hashes, inspected the two localized attribution corrections and checked report formatting. It did not run site builds, training experiments or deployment checks. Those release checks must be reported separately. The methods and source pins above are evidence for a bounded comparison, not a global copyright or publication-clearance assertion.
