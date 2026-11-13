# MLOps renewal: first eight topics

Reviewed 2026-11-13 by Codex. This is a complete replacement-body review of the named eight topics, their two locales and their direct teaching dependencies. It is not completion of the remaining eight MLOps topics, the systems group, or all courses. Publication, independent coordinator review and production checks are separate.

## Boundary and method

The six published notes had a prior xufana-linked source history. Their complete teaching bodies have been replaced; this is not removal of a bibliography entry while retaining its examples. The two previously withheld notes remain withheld. Only their pre-takedown YAML metadata and curriculum anchor IDs were extracted for continuity. Their old bodies were not supplied to the rewrite. IDs, section order, prerequisites and existing explicit section anchors are preserved.

The new connecting case is a fictional service reviewing previews of study cards. Its manifests, counts, transformations, scheduling traces, costs and supplied output arrays were independently specified for Fedor Pakhurov's project with Codex assistance during this task; this does not claim that the user personally supplied those constants. There is no external dataset, downloaded model, live provider call, student record or benchmark result. Text clearly distinguishes hypothetical inputs and locally computed consequences from empirical performance.

Primary sources retain scientific credit for their concepts. Each source has a precise claim and checked locator in `mlops-renewal-sources.json` and the per-topic review. These sources are references, not blanket permissions to reproduce their figures or examples. No upstream prose passage, figure, code listing, dataset or model artifact is distributed by the replacement. The original stdlib simulator and all its inputs/outputs are included in each complete review's hashes because the notes link to them.

## Topic decisions

Both locale paths use `src/content/notes{,-ru}/mlops/<slug>.mdx`.

| Topic | Substantive replacement and actual verification | State |
| --- | --- | --- |
| `what-mlops-is` | Four-field release manifest, independent scanner/editor dependency situations, SHA-256 identity change and 6/8 label coverage; Google/Microsoft material reduced to a short credited framework distinction | Replacement in working tree; full file-scoped record |
| `serving-models` | Original six-arrival queue, independently implemented batching rule, complete finish/latency table, runnable inline code, causality/conservation checks, low-load and deadline counterexamples | Replacement in working tree; full file-scoped record |
| `testing-ml-systems` | Original score specification, filename mutation with exactly two changed decisions, repaired invariant, monotonicity/range/boundary checks, hand-derived gradient step and JSON round trip; runnable inline code | Replacement in working tree; full file-scoped record |
| `monitoring-and-drift` | Original fractions and tied discrete samples; PSI and Pearson discrepancy, all 252 group allocations for KS, 204 extreme allocations, linear-kernel MMD with a limitation counterexample | Replacement in working tree; full file-scoped record |
| `llm-inference-systems` | Four independently specified output lengths, six-tick continuous schedule, explicit 9 MiB cache arithmetic, 32-token blocks and exact three-symbol speculative correction | Replacement in working tree; full file-scoped record |
| `llmops` | Eight supplied title-output pairs, mandatory-case release failure despite better mean, authored 117 ms sequential trace, fictional judge counts and retry/token accounting | Replacement in working tree; full file-scoped record |
| `ml-system-design` | New preview-review decision, 1,000 cards / 80 defects, confusion matrices, 664 versus 384 minutes, capacity 130, whole-request 100 ms bounds and independent decision record | Full replacement and draft review outside served paths; hold unchanged |
| `cost-and-efficiency` | New A–D configuration data and Pareto calculation, low-load denominator, MFU definition, checkpoint/restart assumptions and energy units; inherited five-step worksheet is absent | Full replacement and draft review outside served paths; hold unchanged |

Held drafts are at `/Users/fedorpakhurov/code/_work/fp-renewal-held-drafts/mlops/<slug>.{en,ru}.mdx`, with `<slug>.review-draft.json`. Their planned target hashes currently cover `status: needs-review`. The coordinator must approve and move each pair, change status and the hold manifest atomically, and regenerate exact current hashes. A draft record does not authorize publication or BIASED derivation. Served stubs were byte-compared with `origin/main` and are unchanged.

## Retired direct assets

No replacement imports a teaching component. New mechanism tables/formulas are authored directly in Markdown. These nine unreferenced legacy components were removed after scanning source imports:

- `src/components/figures/what-mlops-is/MlSystem.astro`
- `src/components/figures/what-mlops-is/LifecycleLoop.astro`
- `src/components/figures/serving-models/DynamicBatching.astro`
- `src/components/figures/serving-models/BatchingTradeoff.astro`
- `src/components/figures/testing-ml-systems/MlTestPyramid.astro`
- `src/components/figures/monitoring-and-drift/DriftDetection.astro`
- `src/components/figures/llm-inference-systems/PrefillDecode.astro`
- `src/components/figures/llm-inference-systems/ContinuousBatching.astro`
- `src/components/figures/llmops/LlmTrace.astro`

Shared figure/layout helpers are unchanged and are not claimed as newly reviewed by this batch. There are no replacement image, model, notebook or dataset imports requiring a separate upstream asset license. Runtime fixture dependencies are Python's standard library only.

## Technical and bilingual evidence

- `python3 scripts/notes/mlops-renewal-cases.py --output docs/reports/2026-11-13-licensed-example-renewal/mlops-renewal-results.json` executed successfully; no network or model inference.
- The serving and testing Python blocks were extracted from the final note pairs and executed; exact stdout matches the displayed text. EN/RU blocks are identical. Results are in `mlops-renewal-validation.json`.
- Sixteen replacement MDX bodies compiled using `@mdx-js/mdx`, `remarkMath`, the local heading plugin and strict `rehypeKatex`; no full build or browser validation is claimed.
- Every inline/display mathematical expression matches between locales. Existing explicit Russian anchor IDs all remain. Internal note destinations exist, including routes still subject to publication holds.
- Review found and fixed a new-table reasoning error: D satisfies the 80 ms delay bound, but is dominated by B. Both languages now distinguish feasibility from dominance.
- Reviewed vLLM's pinned documentation warning: its Paged Attention design page describes a historical kernel. Both locales now say so rather than treating it as current implementation detail.
- McNemar's full name and original bibliographic scope were confirmed on the publisher page. The exact binomial variant was checked separately in official statsmodels documentation; inaccessible full paper text was not claimed as inspected.
- The queue trace demonstrates finite-trace arithmetic only. Small-sample KS uses a stated exchangeability null and exhaustive allocation; the tiny Pearson example does not claim an asymptotic p-value. Kernel MMD is explicitly the biased squared estimator. The LLM outputs are supplied arrays, not fabricated execution of a model.

`npm run practice:check` passed: 239 notes, 241 targets, 2 multi-target notes and 72 omissions. `git diff --check` passed. `npm run rights:check` confirmed all 42 held notes in both locales and accepted this batch's exact review hashes; the complete shared-worktree check then stopped at in-progress linear-classifier files owned by another agent. This is not recorded as a full gate pass. The coordinator will validate the final integrated publication snapshot.

## Remaining work

The other MLOps topics (`data-pipelines`, `data-quality-and-versioning`, `features-and-skew`, `experiments-and-registry`, `distributed-training`, `rolling-out-models`, `continual-learning`, `responsible-ml`) and the rest of the systems group are still pending actual material-level review. Existing inventory is not clearance. None is newly approved by this report. No BIASED content is changed here; it may derive only from the subsequently published exact FP revision with complete records.

Independent review follow-up: serving now explicitly stipulates its six-millisecond input and states that the batching target counts request age while a busy worker can delay actual dispatch past it. Both locales and exact hashes were updated.

An independent Codex agent (`course_licenses`) read the complete EN/RU serving, testing, LLMOps and inference pairs. Its separate event-clock oracle reproduced both queue schedules; rational arithmetic reproduced rename positions, gradient loss 13/40, decode completion [2,5,3,6], 9 MiB KV, 84 unused positions, speculative mass, 117 ms trace and costs. It replayed the full fixture byte-for-byte against saved JSON, checked inline stdout and 78 mathematical spans across these four pairs. Two serving wording corrections above were incorporated. This is bounded independent content/arithmetic review, not a browser, real-model, production or whole-course pass. Coordinator review also made the design capacity comparison explicitly conditional on daily arrivals repeating the stipulated 1,000-preview mix and error rates.

A second independent Codex agent (`takedown_routing`) read all eight locale bodies for introduction, monitoring, design and cost. It independently recomputed confusion matrices/burdens, the integer ECDF allocation count 204/252, PSI 0.4 ln(15), Pearson discrepancy 56/3, linear MMD 64/25, Pareto frontier B/C, checkpoint fraction and energy. Fixture replay was byte-identical and all 64 mathematical spans matched across those four pairs. This pass covers mathematics, data and parity, not another source-permission review. Coordinator statistical review also required independent paired items for the exact McNemar binomial argument; that assumption is explicit in both testing locales.
