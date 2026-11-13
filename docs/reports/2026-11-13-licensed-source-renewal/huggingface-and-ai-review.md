# Hugging Face candidates and AI-course renewal review

Review date: 2026-11-13. This is a source-selection and renewal plan, not global legal clearance. No course bodies, code, models, datasets, builds or deployments were changed by this review.

The review inventories **all 15 FP courses and all 12 currently represented BIASED courses**. Its deeper material review covers **116 FP topics** in NLP, AI Agents, Generative Models and Deep Learning. Other disciplines remain in the curriculum-wide review; an inventory row does not mark their materials cleared. The intended order is FP renewal first, followed by corresponding BIASED lessons, exercises and optional notebooks, while retaining the curriculum structure.

The companion [evidence and per-topic renewal mapping](huggingface-and-ai-review.json) contains exact source revisions, checked files, source hashes, all course rows and all 116 AI-topic dispositions. The mapping has 40 `withdrawn`, 13 `queued` and 63 `review-needed` topics. These are work states, not findings of infringement. The 40 withdrawn NLP topics stay withdrawn until replacement material is validated; the new semantic-search lab is retained as a separate, already documented original example.

## Coverage and baseline

FP baseline: `07232f858bd91d7d6a45900d681f336a97ac5c6e`. It contains 353 topics in each locale: 311 published and 42 held (40 NLP and two MLOps). BIASED baseline: `a7db7aa9032e9d67c38ceb1d6812c885541f275e`, with 242 current topic manifests after the prior withdrawals. A missing withdrawn BIASED body is not permission to recreate it from the old disputed material.

| FP course | Topics per locale | Published / held | Depth of this pass |
| --- | ---: | --- | --- |
| `acos` | 32 | 32 / 0 | Inventory; separate discipline review remains |
| `agents` | 27 | 27 / 0 | Focused material/source review |
| `bayesian-methods` | 15 | 15 / 0 | Inventory; separate discipline review remains |
| `big-data` | 35 | 35 / 0 | Inventory; separate discipline review remains |
| `databases` | 19 | 19 / 0 | Inventory; separate discipline review remains |
| `deep-learning` | 14 | 14 / 0 | Focused material/source review |
| `devops` | 16 | 16 / 0 | Inventory; separate discipline review remains |
| `generative-models` | 34 | 34 / 0 | Focused material/source review |
| `math` | 16 | 16 / 0 | Inventory; separate discipline review remains |
| `ml` | 27 | 27 / 0 | Inventory; separate discipline review remains |
| `mlops` | 16 | 14 / 2 | Inventory; separate discipline review remains |
| `nlp` | 41 | 1 / 40 | Focused material/source review |
| `probability` | 22 | 22 / 0 | Inventory; separate discipline review remains |
| `python` | 22 | 22 / 0 | Inventory; separate discipline review remains |
| `sql` | 17 | 17 / 0 | Inventory; separate discipline review remains |

| BIASED course | Current topic manifests |
| --- | ---: |
| `ai-agents` | 27 |
| `bayesian-methods` | 16 |
| `computer-architecture` | 32 |
| `deep-learning` | 14 |
| `devops` | 16 |
| `generative-models` | 35 |
| `machine-learning` | 27 |
| `math-for-ml` | 16 |
| `mlops` | 14 |
| `nlp` | 1 |
| `probability` | 22 |
| `python` | 22 |

## Hugging Face: precise permission boundaries

The review fetched complete, non-truncated Git trees for thirteen relevant repositories, all located license/notice files, and 221 selected teaching/code files: 104 English LLM-course pages, 74 English Agents-course pages, seven diffusion notebooks and 36 selected library/cookbook files. All 221 selected files downloaded successfully. Notebook source cells were inspected without copying their saved image payloads into this repository.

All thirteen repositories declare Apache-2.0 at the root. This supports considering their own selected text/code as candidates, with Apache redistribution conditions and any file-level notices preserved. It is not an organization-wide grant for all content hosted or linked by Hugging Face. The revisions below are review snapshots, not promises of stable runtime APIs or recommended package versions.

| Source repository | Pinned revision and license | Reviewed applicability |
| --- | --- | --- |
| `huggingface/accelerate` | [`f5cc53877677eb7fa0ef7091fe41536a777fee6a`](https://github.com/huggingface/accelerate/blob/f5cc53877677eb7fa0ef7091fe41536a777fee6a/LICENSE) | Quicktour and `src/accelerate/accelerator.py`; distributed-training software, not training-data rights. |
| `huggingface/agents-course` | [`9b3d6b3887bc489510da0239d4c1bc1ee23fd40f`](https://github.com/huggingface/agents-course/blob/9b3d6b3887bc489510da0239d4c1bc1ee23fd40f/LICENSE) | 74 `units/en/*.mdx` pages: agent/tool/workflow explanations and inline examples; exclude external course images, game assets, benchmark data and hosted demos. |
| `huggingface/cookbook` | [`b23df069425fe24cd9a38f8a86c5cb9e163917a0`](https://github.com/huggingface/cookbook/blob/b23df069425fe24cd9a38f8a86c5cb9e163917a0/LICENSE) | Only `notebooks/en/rag_evaluation.ipynb` and `notebooks/en/agents.ipynb` inspected; preserve named author credits. External calls/corpora and generated outputs are not pre-cleared. |
| `huggingface/course` | [`8b893f0ede6c781045692a7f892f25a0c92b4805`](https://github.com/huggingface/course/blob/8b893f0ede6c781045692a7f892f25a0c92b4805/LICENSE) | 104 `chapters/en/*.mdx` pages: NLP/LLM explanations and inline examples; exclude externally hosted images, embeds, models and datasets until separately reviewed. |
| `huggingface/datasets` | [`efc82474bc990f5872226dca56457536c9a880e9`](https://github.com/huggingface/datasets/blob/efc82474bc990f5872226dca56457536c9a880e9/LICENSE) | `loading.mdx`, `dataset_card.mdx`, `src/datasets/load.py`; the loader license does not license a downloaded dataset. |
| `huggingface/diffusers` | [`2c58e66a08a61ea5c58b9add560cf808e2c851de`](https://github.com/huggingface/diffusers/blob/2c58e66a08a61ea5c58b9add560cf808e2c851de/LICENSE) | Basic-training/pipeline docs and DDPM/DDIM scheduler implementations; separate image, model and dataset review required. |
| `huggingface/diffusion-models-class` | [`72bf3dd739da641075dcff0ee54ce28e7a38a8ab`](https://github.com/huggingface/diffusion-models-class/blob/72bf3dd739da641075dcff0ee54ce28e7a38a8ab/LICENSE) | Seven `unit1`–`unit4` notebook source-cell sequences; 71 saved image outputs were counted, not adopted. Data/checkpoint dependencies are separate. |
| `huggingface/huggingface_hub` | [`2c61ae8c11eedb1b79e262dd9eb5e68962cac063`](https://github.com/huggingface/huggingface_hub/blob/2c61ae8c11eedb1b79e262dd9eb5e68962cac063/LICENSE) | Model-card and download guides; access/download ability is not a reuse license. |
| `huggingface/peft` | [`66a7c305bac9d7f8183b1f158280b77be971a3d4`](https://github.com/huggingface/peft/blob/66a7c305bac9d7f8183b1f158280b77be971a3d4/LICENSE) | PEFT configuration/LoRA documentation and `src/peft/tuners/lora/layer.py`; base models and adapter checkpoints remain separate. |
| `huggingface/smolagents` | [`96f33faaf028479119ec8d34507b47694cf14e34`](https://github.com/huggingface/smolagents/blob/96f33faaf028479119ec8d34507b47694cf14e34/LICENSE) | ReAct and agent-building docs plus `src/smolagents/agents.py`; tool outputs, web pages and external services are separate. |
| `huggingface/tokenizers` | [`39e28180be35af322d0abf08007d937641a5493b`](https://github.com/huggingface/tokenizers/blob/39e28180be35af322d0abf08007d937641a5493b/LICENSE) | Quicktour and BPE/WordPiece/Unigram implementation files. **Exception:** `bindings/node/LICENSE` is MIT, copyright 2020 N-API for Rust. `tokenizers/LICENSE` points to the root license. |
| `huggingface/transformers` | [`41f9d3992023970fb5a463e70d56232506c80fbc`](https://github.com/huggingface/transformers/blob/41f9d3992023970fb5a463e70d56232506c80fbc/LICENSE) | Selected task/generation docs and BERT/GPT-2 implementation files, including their Apache headers; no checkpoint weights are included in this scope. |
| `huggingface/trl` | [`72566b0d5b2089e4832ac3dd211b38e13376fee6`](https://github.com/huggingface/trl/blob/72566b0d5b2089e4832ac3dd211b38e13376fee6/LICENSE) | SFT, DPO and GRPO trainer documentation; preference datasets, reward models and base-model weights are separate. |

The exact file list, Git blobs, SHA-256 hashes, explicit-header observations and resource-call locations are in the JSON. Root-license checks and selected-file checks are distinct: not every selected document has an inline license header. A copied passage or modified implementation still needs a source-specific record and visible attribution/change information where required; merely adding a repository to an allowlist is insufficient.

### External media and model/data exceptions

These primary Hub cards were checked independently of the accessing libraries. Card declarations record the provider's grant; individual embedded third-party works can still require separate attention.

| Exact resource | Pinned evidence | Decision for renewal |
| --- | --- | --- |
| `huggingface-course/documentation-images` | [`96e71ad956904da670e6827274fc2c9b735b09d5`](https://huggingface.co/datasets/huggingface-course/documentation-images/blob/96e71ad956904da670e6827274fc2c9b735b09d5/README.md) | Card declares Apache-2.0. Consider only individually identified assets with a recorded path/revision and any own credit; do not extend this to other similarly named repositories. |
| `huggingface/documentation-images` | [`6c6a779823c80c0951b22162ad12ffcacfaea12c`](https://huggingface.co/datasets/huggingface/documentation-images/blob/6c6a779823c80c0951b22162ad12ffcacfaea12c/README.md) | **CC BY-NC-SA 4.0**, despite being embedded by Apache-licensed course/library pages. Do not import this media into a commercial course under an Apache assumption. Use independently created diagrams or a separately permitted asset. |
| `agents-course/course-images` | [`d500ca088f407051ab7a1ef0789bdee1d2d01a3f`](https://huggingface.co/api/datasets/agents-course/course-images) | No root license/card license was found. Do not treat the Agents course root Apache license as evidence for these separately hosted assets. Game screenshots and third-party illustrations need their own source review. |
| `huggan/smithsonian_butterflies_subset` | [`3cdedf844922ab40393d46d4c7f81c596e1c6d45`](https://huggingface.co/datasets/huggan/smithsonian_butterflies_subset/blob/3cdedf844922ab40393d46d4c7f81c596e1c6d45/README.md) | No license declaration in the inspected card; it points to another dataset and describes processing. Trace the source image rights before using; use synthetic shapes for the default lab. |
| `lewtun/music_genres` | [`1fafac00f14590feb94984ee7dc1adc861179fc7`](https://huggingface.co/datasets/lewtun/music_genres/blob/1fafac00f14590feb94984ee7dc1adc861179fc7/README.md) | No license declaration; the card contains a placeholder for missing information. Do not use it as a cleared audio-training corpus. |
| `google/ddpm-celebahq-256` | [`cd5c944777ea2668051904ead6cc120739b86c4d`](https://huggingface.co/google/ddpm-celebahq-256/blob/cd5c944777ea2668051904ead6cc120739b86c4d/README.md) | Model card declares Apache-2.0. This does not grant CelebA/CelebA-HQ image rights or retroactively license the course notebook screenshots/data. Model weights and source dataset are different artifacts. |
| `HuggingFaceTB/SmolLM2-135M` | [`93efa2f097d58c2a74874c7e644dbc9b0cee75a2`](https://huggingface.co/HuggingFaceTB/SmolLM2-135M/blob/93efa2f097d58c2a74874c7e644dbc9b0cee75a2/README.md) | Model card declares Apache-2.0 at this exact revision; optional small-model candidate, separate from the Transformers license. No weights were downloaded or model run performed. |

The LLM course scan found external media/embeds in 50 of 104 pages, and the Agents course in 53 of 74. Those counts include interactive frames, not just image files. Course pages refer to all three documentation-image repositories above. The seven diffusion notebooks contain 71 saved image outputs and load resources including CelebA-HQ checkpoints, Stable Diffusion models, butterfly images and music datasets. Bulk notebook/image import would therefore bypass material-specific review. Prefer original synthetic data, newly generated and validated outputs, and local diagrams for the renewed lessons.

Hugging Face's own [Hub license documentation](https://huggingface.co/docs/hub/repositories-licenses) requires checking each project's code/data license; Hub hosting is not a single uniform license.

## Existing FP material: renewal priorities

### NLP: 41 topics, 40 still held

Keep every existing topic, prerequisite and section position. Forty withdrawn topics need replacement bodies in both languages. The per-topic JSON maps verified HF chapter paths for tokenization, Transformer architecture, BERT/GPT, fine-tuning, NER, QA, translation, summarization, PEFT, evaluation and selected retrieval material. Use new supplied text/corpora and freshly executed examples instead of the HF chapters' downloaded datasets or saved demonstrations.

HF does not directly cover every old topic at the required depth. The mapping explicitly records gaps for classic/specialized material such as n-grams, word2vec, GloVe, fastText, recurrent models and text diffusion. Retain these lessons and author original mathematics/toy exercises from cited primary research; do not substitute an unrelated HF page or imply that its root license grants rights to the research paper's figures/prose. The new `semantic-search` fictional corpus and reproducible lexical baseline remain the existing clean starting point, with the limitations already documented in its own provenance files.

### AI Agents: 27 topics, four source-specific textbook chains

Most notes combine primary-paper citations with local small examples and generated figures. No rule in this review treats all such citations as copied material. Four notes nevertheless explicitly adopt named examples from Sutton and Barto rather than merely citing general theory. The [publisher's primary record](https://mitpress.mit.edu/9780262039246/reinforcement-learning/) labels the book **CC BY-NC-ND**. The authors' host timed out in this pass; the publisher record, not an inferred MIT software license, is the evidence used here.

| Note | Concrete dependency at the FP baseline | Coordinated renewal boundary |
| --- | --- | --- |
| `agents/temporal-difference-learning` | Section on the 10-armed testbed (EN line 73); five-state A–E random walk (114); fixed eight-episode batch (161); 4-by-12 cliff walking (192). Figures `BanditCurves`, `RandomWalkRms`, `CliffWalking`. | Keep exploration/MC/TD/SARSA/Q-learning concepts. Write a new task, transition/reward specification and fixtures, rerun every reported comparison, and update associated diagrams, code and RU/EN narrative together. |
| `agents/model-based-rl` | Explicit 6-by-9 maze from book example 8.1 (42–48), with `DynaMaze`. | Replace the source-specific maze and recorded learning curves with an original planning environment; preserve the Dyna explanation and scientific citation. |
| `agents/policy-gradients` | Explicit short corridor from example 13.1 (28), with `ShortCorridor` and its analytic/experimental chain. | Author a different stochastic-policy task and recompute its optimum, gradients, figures and outcomes. Cosmetic relabeling is not evidence of independent renewal. |
| `agents/deep-q-networks` | Explicit maximization-bias example 6.7 (136), with `MaxBias`. The separate CartPole code says it follows Gym's task (218–235). | Replace the book-specific example/results if policy requires permissive-only source expression. Review the CartPole implementation separately under Gym's MIT source grant; book licensing does not decide the software license. |

These are **renewal/review priorities**, not a legal conclusion that ordinary algorithms, equations or independently implemented benchmark ideas are infringing. No new publication hold is imposed by this report. A safe first stage is a source-specific manifest and coordinated replacement task; changing only citations or labels would leave the actual dependent material untouched. HF Agents/Smolagents can supply permitted agent/tool/workflow background, but they do not replace a complete tabular-RL curriculum.

### Generative Models: 34 topics, 26 notebook walkthroughs

Twenty-six notes contain an explicit `Notebook` section describing HSE-LAMBDA cell sequences, source procedures or saved runs. These should not be recorded as bibliography-only dependencies. The other eight lack that section; that absence does not certify their prose/figures. All 34 topic records are retained in the JSON.

[HSE-LAMBDA DeepGenerativeModels at `42dd64b535f5bedf1d2b3db28f2f21ce96c9f09f`](https://github.com/HSE-LAMBDA/DeepGenerativeModels/blob/42dd64b535f5bedf1d2b3db28f2f21ce96c9f09f/LICENSE), corresponding to `spring-2025-long`, has an MIT license naming the HSE Laboratory of methods for Big Data Analysis (2024). It is therefore a possible source for material actually covered by that grant, with the copyright and permission notice retained for copied substantial portions. Its top-level license is not proof that every included dependency, photograph, weight file or dataset is under MIT.

Specific dependency boundaries found:

- `normalizing-flows` and `flow-architectures` explicitly rely on `nflib` from Karpathy's `pytorch-normalizing-flows`. The pinned original tree and `Readme.md` contain no license grant found in this pass. HSE's umbrella MIT declaration does not by itself settle that original dependency. The original and HSE `flows.py`, `nets.py` and `spline_flows.py` are not byte-identical, but the local notes explicitly identify the source relationship; a lack of a long exact-code match would not erase it.
- `wgan`, `vae`, `stargan`, `flow-architectures` and a homework paragraph in `ddpm-training-objective` direct readers to CelebA exercises. The separate [dataset review](../2026-11-13-dataset-review.md) records the maintainers' noncommercial-research boundary. No local CelebA photos or loader were found in that prior pass; source commentary is not automatically image redistribution. Nevertheless, replace these as the default commercially offered practice route with a generated-data lab or an explicitly permitted dataset.
- `audio-generation` describes `facebook/musicgen-small` and continuation of a GTZAN clip. AudioCraft's software is MIT, while its **weights have CC BY-NC 4.0 terms**. Transformers' Apache license does not replace those terms. The music clip also needs its own source rights. Prefer generated tones/synthetic audio for the default exercise.
- `drag-editing` points to unofficial DragGAN and official DragDiffusion apps, plus a StyleGAN2-ADA cat. The official DragGAN repository itself uses NVIDIA's StyleGAN3 source license with a noncommercial limit; the exact unofficial app and its checkpoint chain were not cleared here. Keep the paper explanation and local two-dimensional blob demonstration; do not turn the external app chain into an approved reusable course dependency without checking it individually.
- `autoregressive-models` recommends training/completion of movie posters. No dataset-specific grant for those poster images was established. Replace the practice images with original generated pixel patterns.
- Several notes carefully label values as outputs saved by the source course. Preserve that provenance while retained. Do not present them as independently rerun results after a source swap; regenerated outputs need their own executable evidence.

### Bounded first-stage text work

The following boundaries identify the optional external-practice text that can be replaced without restructuring the course. Line numbers are from the pinned English baseline, not permanent anchors; check source hashes and corresponding Russian content before editing.

| Note | Exact section | Initial replacement direction |
| --- | --- | --- |
| `generative-models/wgan` | `## Notebook`, EN 178–186 | A new one-dimensional/2-D generated-distribution critic experiment; cite WGAN/WGAN-GP papers and separate any reused implementation license. |
| `generative-models/vae` | `## Notebook`, EN 447–455 | Synthetic binary shapes or a documented permitted dataset, with independently executed ELBO/reconstruction checks. |
| `generative-models/stargan` | `## Notebook`, EN 249–258 | Original controlled-domain toy data and loss accounting; do not substitute the NC StarGAN-v2 repository wholesale. |
| `generative-models/flow-architectures` | `## Notebook`, EN 470–479 | Original transform/Jacobian checks; remove the unresolved `nflib`/CelebA practice dependency after providing a concrete replacement. |
| `generative-models/normalizing-flows` | `## Notebook`, EN 294–302 | Original small affine/coupling flow on generated 2-D points with explicit inverse and log-determinant checks. |
| `generative-models/ddpm-training-objective` | CelebA homework paragraph, EN 614 | A generated-data DDPM exercise; the separate 2-D methodological description is not automatically a restricted-dataset artifact. |
| `generative-models/audio-generation` | `## Notebook`, EN 315–323 | Generated waveforms/codebook exercises; any pretrained model requires an independently recorded weight license. |
| `generative-models/drag-editing` | `## Notebook`, EN 242–251 | Promote and extend the local blob/latent-motion exercise; preserve scientific references without recommending an unreviewed app/checkpoint chain. |
| `generative-models/autoregressive-models` | `## Notebook`, EN 260–269 | Original small quantized image grids with a reproducible mask/causality check. |

This report does not claim those replacements have been authored or executed. Removing a problematic recommendation without supplying equivalent practice would not complete the user's requested course renewal.

### Deep Learning: 14 topics

The previous [focused D2L comparison](../2026-11-13-source-comparison-followup.md) compared all fourteen English notes against 91 pinned source files and found no specific distinctive copied D2L artifact in that bounded pass. Its limitations remain. D2L's book text/figures are CC BY-SA 4.0; its sample/reference code has a separate modified MIT grant. Do not relabel all of it Apache or infer that a reference licenses the entire note.

All fourteen notes also cite `xiyori/intro-to-dl-hse`; no license grant was found in the inspected current tree/README. That citation can remain as scholarship, but material cannot be approved for adaptation on the basis of GitHub visibility. The UCI digits attribution and exact figure-array credits added earlier remain applicable. Keep those separate from software licenses and from the independent-implementation question.

## Other exact AI-source license checks

These primary source checks identify alternatives and exclusions, not full repository clearance. In particular, a source's current root grant does not settle every transitive model/data/asset dependency or historical source version.

| Repository | Pinned license evidence | Observed boundary |
| --- | --- | --- |
| `xiyori/intro-to-dl-hse` | `fd7e8f5b22337eb83a0b480e8a5e8e9e1828d743`; [inspected tree](https://github.com/xiyori/intro-to-dl-hse/tree/fd7e8f5b22337eb83a0b480e8a5e8e9e1828d743) | No license file or README grant found. Citation may remain; adaptation permission not established. |
| `bmml-team/bmml_ftda` | `e68351cda47e224e0fe3465f2780ca7ff37b330b`; [LICENSE](https://raw.githubusercontent.com/bmml-team/bmml_ftda/e68351cda47e224e0fe3465f2780ca7ff37b330b/LICENSE) | MIT, copyright 2026 Bayesian Methods in Machine Learning; exact copied file and nested assets still need review. |
| `r-isachenko/2025-DGM-MIPT-YSDA-course` | `3d0e73d96a3a08a908348e34b57a138efea5485e`; [inspected tree](https://github.com/r-isachenko/2025-DGM-MIPT-YSDA-course/tree/3d0e73d96a3a08a908348e34b57a138efea5485e) | No license file or README grant found. Citation-only use differs from adapting its lecture material. |
| `karpathy/pytorch-normalizing-flows` | `b60e119b37be10ce2930ef9fa17e58686aaf2b3d`; [inspected tree](https://github.com/karpathy/pytorch-normalizing-flows/tree/b60e119b37be10ce2930ef9fa17e58686aaf2b3d) | No license file or Readme grant found; unresolved origin for the explicitly linked nflib dependency. |
| `karpathy/micrograd` | `7bc720e951fe422b8f8814aa5aa1b64121d26b4c`; [LICENSE](https://raw.githubusercontent.com/karpathy/micrograd/7bc720e951fe422b8f8814aa5aa1b64121d26b4c/LICENSE) | MIT, copyright 2020 Andrej Karpathy; a concrete permitted source candidate for scalar autograd code, with notices for actual adaptation. |
| `Lornatang/CycleGAN-PyTorch` | `161bc4cbd0ed6943a15bb6537aef64febc535635`; [LICENSE](https://raw.githubusercontent.com/Lornatang/CycleGAN-PyTorch/161bc4cbd0ed6943a15bb6537aef64febc535635/LICENSE) | Apache-2.0 code; image datasets and pretrained checkpoints remain separate. |
| `yunjey/stargan` | `94dd002e93a2863d9b987a937b85925b80f7a19f`; [LICENSE](https://raw.githubusercontent.com/yunjey/stargan/94dd002e93a2863d9b987a937b85925b80f7a19f/LICENSE) | MIT code; the checked notice has an empty author field after the year, which should not be silently filled in by inference. Dataset/checkpoint rights separate. |
| `clovaai/stargan-v2` | `875b70a150609e8a678ed8482562e7074cdce7e5`; [LICENSE](https://raw.githubusercontent.com/clovaai/stargan-v2/875b70a150609e8a678ed8482562e7074cdce7e5/LICENSE); [NOTICE](https://raw.githubusercontent.com/clovaai/stargan-v2/875b70a150609e8a678ed8482562e7074cdce7e5/NOTICE) | CC BY-NC4.0; NOTICE also identifies subcomponents with their own terms. Not a blanket permissive commercial-lab source. |
| `tkarras/progressive_growing_of_gans` | `2504c3f3cb98ca58751610ad61fa1097313152bd`; [LICENSE.txt](https://raw.githubusercontent.com/tkarras/progressive_growing_of_gans/2504c3f3cb98ca58751610ad61fa1097313152bd/LICENSE.txt) | CC BY-NC4.0 source grant; paper discussion and factual comparisons are different from importing code/assets. |
| `richzhang/PerceptualSimilarity` | `082bb24f84c091ea94de2867d34c4544f68e0963`; [LICENSE](https://raw.githubusercontent.com/richzhang/PerceptualSimilarity/082bb24f84c091ea94de2867d34c4544f68e0963/LICENSE) | BSD 2-clause-style code license with named authors; classifier weights, comparison images and datasets are separate artifacts. |
| `bioinf-jku/TTUR` | `ec6561000644ef798b4a358846b1aee481332045`; [LICENSE](https://raw.githubusercontent.com/bioinf-jku/TTUR/ec6561000644ef798b4a358846b1aee481332045/LICENSE) | Apache-2.0 code; metric implementation does not license benchmark images or classifier weights. |
| `phlippe/uvadlc_notebooks` | `c7d9e18f42fee53bc8925f08ec2358371b1e9200`; [LICENSE.md](https://raw.githubusercontent.com/phlippe/uvadlc_notebooks/c7d9e18f42fee53bc8925f08ec2358371b1e9200/LICENSE.md) | MIT, copyright 2020 Phillip Lippe; selected tutorial content can be evaluated separately from its datasets/images. |
| `XingangPan/DragGAN` | `336f120ce126aca6f55dc58537e76c10d19eabd0`; [LICENSE.txt](https://raw.githubusercontent.com/XingangPan/DragGAN/336f120ce126aca6f55dc58537e76c10d19eabd0/LICENSE.txt) | NVIDIA Source Code License for StyleGAN3; noncommercial use limit. The exact unofficial implementation in the HSE notebook was not separately cleared. |
| `facebookresearch/audiocraft` | `896ec7c47f5e5d1e5aa1e4b260c4405328bf009d`; [LICENSE](https://raw.githubusercontent.com/facebookresearch/audiocraft/896ec7c47f5e5d1e5aa1e4b260c4405328bf009d/LICENSE); [LICENSE_weights](https://raw.githubusercontent.com/facebookresearch/audiocraft/896ec7c47f5e5d1e5aa1e4b260c4405328bf009d/LICENSE_weights) | MIT software and a separate CC BY-NC4.0 LICENSE_weights. MusicGen weights are not covered by Transformers MIT/Apache assumptions. |
| `openai/gym` | `bc212954b6713d5db303b3ead124de6cba66063e`; [LICENSE.md](https://raw.githubusercontent.com/openai/gym/bc212954b6713d5db303b3ead124de6cba66063e/LICENSE.md) | MIT, copyright 2016 OpenAI; candidate source for software/environment implementations, not a license for Sutton–Barto book expression. |

## Acceptance boundaries for renewal

1. Keep source identity at file/revision level, with distinct roles for citation, adapted text/code, figures, datasets, model weights and recorded outputs. A root package license or domain allowlist must not approve the other roles.
2. For copied/adapted permitted material, preserve the actual notice, author credit and change description required by that exact source. Preserve D2L's code/book split, Tokenizers' Node-binding exception, and third-party notices. Do not overwrite those with a site-wide license claim.
3. For a newly authored example, record the generator/fixture, exact input hash, executable source and rerun outputs. A changed citation or renamed variable is not provenance evidence.
4. Review both language versions and all dependent figures, questions, notebooks and printed results before transferring a renewed FP topic into BIASED. Keep the topic marked pending until those artifacts match.
5. Maintain unresolved items explicitly. Primary papers and restrictive textbooks may remain cited for scientific ideas; importing their expression requires a different basis. No new blanket takedown or license clearance follows from this inventory.

## Validation and limits

The evidence JSON parses successfully and contains every one of the 116 scoped AI topics with source hashes and explicit renewal status. All 221 selected HF files were fetched; the corresponding Git trees were non-truncated. The current-source checks are read-only and no runtime dependencies, model weights or training data were downloaded. The report does not verify every scientific claim, every source in every bibliography, every historical code version, Russian semantic derivation, or every rendered figure. Those are remaining work, not implied approvals.
