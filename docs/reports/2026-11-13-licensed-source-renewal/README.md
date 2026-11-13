# All-course source renewal — 13 November 2026

The workflow is fixed for both products: **existing curriculum → reviewed source selection → complete EN/RU fpakhurov.com notes → pinned note revision → BIASED teaching and assessment → validation → publication**.

The [binding policy](../../content/source-policy.md), repository `AGENTS.md` files and authoring guides now make this order explicit. The policy applies to all courses, not only the withdrawn NLP material. The sites' course/topic IDs and prerequisite graphs are retained.

## Completed scope and limits

- Inventoried all **15 FP courses, 353 topic pairs / 706 localized note files**: 311 published topics and 42 held topics.
- Mapped all **12 BIASED courses and 242 available topics** to an existing FP note. There are no unmapped upstream note URLs in this inventory. Existing URL links are still legacy/unpinned until a complete new review is recorded.
- Assigned every FP topic to a discipline review: foundations 80 topics, AI 116, systems 157. Reports include source/dependency indicators, exact file hashes, primary license evidence and remaining work. This is not paragraph-by-paragraph clearance of 353 topics.
- Inspected the six proposed discovery/source locations. Hugging Face and YSDA supply useful licensed candidates, with concrete exceptions. No organization, hub, wiki or link collection is globally approved.
- Added source-rights CI gates in both projects. They check an immutable pre-policy Git baseline; new/changed teaching files require current review records. Complete reviews include statically discoverable local assets, and BIASED verifies the pinned upstream note, review and declared asset bytes.
- Completed a full new SLO note pair, original figure and reproducible incident experiment, with a complete note-specific review. Replaced the VI lecture table and corrected neighboring SLO references under bounded maintenance records; those maintenance records leave unchanged content pending and cannot authorize a complete upstream source.

The full machine-readable [renewal inventory](../../../content-rights/renewal-inventory.json) lists every topic, both note hashes, source URLs, publication state and downstream mapping. The unchanged baseline is **inventory-not-clearance**; changing its revision or hashes cannot silently approve content. New full teaching revisions require `scope: complete`, per-asset provenance and verified EN/RU correspondence. Mechanical checks do not establish ownership, permission truthfulness or scientific accuracy.

## Proposed locations: actual decisions

| Location | Checked decision |
| --- | --- |
| [Hugging Face Course](https://github.com/huggingface/course/blob/8b893f0ede6c781045692a7f892f25a0c92b4805/LICENSE) | Apache-2.0 candidate for specifically reviewed own text/code, with license/attribution/change notices. External images, models and datasets are separate. |
| [Yandex Data School NLP](https://github.com/yandexdataschool/nlp_course/blob/078f1a3a791f47f566c8408cbe72c86414fff085/LICENSE) | MIT candidate for covered material at this revision. The active notebooks load third-party data/models/media; later listed weeks are not all implemented. |
| [Hugging Face organization](https://github.com/huggingface) | Discovery only. Thirteen relevant repositories and 221 selected files were inspected. The separate `huggingface/documentation-images` resource declares NC-SA; similarly named course images have different or absent terms. |
| [Yandex Data School organization](https://github.com/yandexdataschool) | Discovery only. Practical_DL has MIT at the root, plus NVIDIA noncommercial and GPL subtrees. ML-Handbook-materials has MIT; the separate ML-Handbook repository has no verified reuse grant. |
| [HSE CS wiki](https://wiki.cs.hse.ru/Wiki_%D0%A4%D0%9A%D0%9D) | Requested page returned 403; no usable license evidence. Individual course/file permissions must be established separately. |
| [Atakan NLP course list](https://github.com/atakansite/nlp-courses/tree/1aa782741692f573a25430c9487966e26ecae943) | Link collection without a verified repository license. Follow links to primary sources; do not transfer a collection's visibility to linked-course rights. |
| [Kaggle discussion](https://www.kaggle.com/discussions/getting-started/150588) | No readable body/terms retrieved. Discovery candidate, not permission evidence. |

## Every-course renewal route

The last column names candidates and remaining work, **not approved source packages**. A prospective source is not an assertion that it was used in the existing text. A source without a grant may remain a factual citation; copying/adaptation requires a different basis.

| FP course | Topics | Held | Evidence | Renewal route |
| --- | ---: | ---: | --- | --- |
| `acos` | 32 | 0 | [systems review](systems-review.md) | Pinned HSE ACOS Apache-2.0 material and primary manuals; preserve third-party exclusions. Verify source-specific examples/figures and Karl Rupp dataset credit. |
| `agents` | 27 | 0 | [huggingface review](huggingface-and-ai-review.md) | Selected Hugging Face Agents Course and smolagents text/code under Apache-2.0; new local environments. Replace/review four Sutton-Barto example chains, regenerate their code, plots and results. |
| `bayesian-methods` | 15 | 0 | [ysda review](ysda-foundations-review.md) | Primary papers; selected Pyro Apache-2.0 or pyprobml MIT code with notices; original calculations. VI table replacement is bounded maintenance; review remaining distinctive examples and recorded runs. |
| `big-data` | 35 | 0 | [systems review](systems-review.md) | Pinned Apache Spark/Flink/Kafka/Iceberg material and original relational examples. Trace diagrams, warehouse templates and code; preserve book citations as references. |
| `databases` | 19 | 0 | [systems review](systems-review.md) | Scoped PostgreSQL/SQLite/DuckDB sources and original shop schemas. Compare distinctive figures and textbook examples; verify executable fixtures. |
| `deep-learning` | 14 | 0 | [huggingface review](huggingface-and-ai-review.md) | Selected YSDA Practical_DL MIT files and upstream libraries; inspect internal exceptions. Retain UCI attribution; D2L prose/figures need a separate SA decision when adapted. |
| `devops` | 16 | 0 | [systems review](systems-review.md) | Pinned upstream implementation/docs with their exact terms; independent service cases. Renew SLO policy, alert design and example; preserve uv MIT notice and reference-only book boundaries. |
| `generative-models` | 34 | 0 | [huggingface review](huggingface-and-ai-review.md) | Selected HSE-LAMBDA MIT and HF Apache code; original synthetic image/audio data. Review 26 notebook walkthroughs and eight immediate model/data/implementation dependency chains. |
| `math` | 16 | 0 | [ysda review](ysda-foundations-review.md) | Original derivations and diagrams with checked primary references; reciprocal sources only after compatibility review. Review source-following proof exposition and textbook examples; no blanket OpenStax/OCW reuse grant. |
| `ml` | 27 | 0 | [ysda review](ysda-foundations-review.md) | Selected YSDA ML-Handbook-materials MIT and upstream code; credited UCI or original synthetic data. Replace or establish permission for three diabetes examples; inspect explicitly source-related tables and figures. |
| `mlops` | 16 | 2 | [systems review](systems-review.md) | Selected Efficient DL Systems MIT and MLflow/OpenTelemetry/upstream sources; original systems cases. Keep two holds; renew six remaining xufana-linked notes before full upstream approval. |
| `nlp` | 41 | 40 | [huggingface review](huggingface-and-ai-review.md) | Pinned HF Course Apache-2.0 and YSDA nlp_course MIT files; original corpora and figures. Rebuild 40 held topics from new sources; retain and review the original retrieval lab; fill classic-topic coverage gaps with primary research. |
| `probability` | 22 | 0 | [ysda review](ysda-foundations-review.md) | Independently derived elementary examples and checked primary references. Verify historical aggregate data locators and distinctive textbook examples; rerun displayed numbers. |
| `python` | 22 | 0 | [systems review](systems-review.md) | Scoped CPython docs/examples and individually licensed scientific-library sources. Record snippet origin and rerun local examples; check PEP terms individually. |
| `sql` | 17 | 0 | [systems review](systems-review.md) | Scoped PostgreSQL/SQLite/DuckDB sources plus original query fixtures. Preserve the shared shop schema; verify all result tables and snippet provenance. |

## Evidence bundles

- [YSDA and foundations](ysda-foundations-review.md), [160 localized-file inventory](ysda-foundations-inventory.json).
- [HF and AI](huggingface-and-ai-review.md), [source evidence and 116-topic mapping](huggingface-and-ai-review.json).
- [Systems](systems-review.md), [314 localized-file and source evidence](systems-evidence.json).
- [Preceding takedown](../2026-11-13-nlp-source-review.md), [prior source comparison](../2026-11-13-source-comparison-followup.md), [dataset-specific decisions](../2026-11-13-dataset-review.md).

## Publication status

This report does not reopen the 42 held FP topics or their BIASED lessons. The initial release contains policy/enforcement, the complete renewed SLO note, and the specifically recorded maintenance changes; full course renewal remains itemized above. No paid lesson may be described as newly rebuilt from verified notes until its complete review and pinned upstream chain exist. The complete/maintenance distinction prevents a local correction from silently clearing an entire legacy course.
