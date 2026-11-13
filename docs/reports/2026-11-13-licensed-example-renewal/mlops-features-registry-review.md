# MLOps renewal: feature history and experiment identity

Reviewed 2026-11-13. This record covers the complete newly composed English and Russian bodies for `features-and-skew` and `experiments-and-registry`, their inline examples, original standard-library source and saved outputs. The four remaining MLOps notes and the remaining systems courses are not approved by this record. Independent coordinator review, integrated checks and publication remain separate stages.

## Substantive replacement

Both complete teaching bodies were replaced. Existing curriculum YAML, prerequisite graph and explicit section anchors remain. No source-dependent anecdote or old experiment is retained under a smaller bibliography. The new English bodies have approximately 2,013 and 2,034 words, with corresponding full Russian explanations. Old externally described Google incident cases, long API demonstrations and the prior random-forest results are absent from these replacement bodies.

The fixture was authored for Fedor Pakhurov's project with Codex assistance; the user did not personally specify its numeric constants. No claim of exclusive copyright in AI-assisted material is made. Each complete review records exact teaching-file and source/output hashes:

- `content-rights/reviews/mlops-features-and-skew-renewal.json`
- `content-rights/reviews/mlops-experiments-and-registry-renewal.json`

## Features and training-serving skew

Five original feature records use distinct event and availability hours. A's correction of hour 8 only becomes available at hour 20. B's hour-9 event becomes available at 15. For predictions A@10, B@10 and A@30, the historical two-clock join yields `[0.2, 0.7, 0.4]`; filtering only event time yields `[0.9, 0.1, 0.4]`; latest-at-present yields `[0.4, 0.1, 0.4]`.

A fixed review rule `contrast < 0.5` disagrees on two of three decisions between the first two joins. This is not an accuracy result: no outcome labels or model fit occur. Four-hour event-age TTL gives `[0.2, 0.7, null]`. The fitted centering state has mean 13/30. Tables, selected values and arithmetic are newly specified and reproduced by code.

The note develops code, data and time mismatch; fitted transformation state; correction ordering; availability versus event timestamps; freshness; minimal actual-served-feature evidence; biased logging; versioning and migration; and feature-store limitations. The original selector assumes accurate clocks and a total correction order, with no cache/concurrency simulation. It explicitly does not claim that one point-in-time predicate proves absence of leakage upstream.

Primary references were read for particular concepts: Martin Zinkevich's Rules of Machine Learning (training-serving skew and rules 29-31) and Feast's current point-in-time guide. The latter now documents an optional created-timestamp constraint, not an unconditional property of every retrieval call. The replacement preserves those caveats and does not import Feast's example driver rows, diagrams or code.

## Experiments and the model registry

The original fit data are `(0,1),(1,2),(2,4)`; evaluation data are `(3,5),(4,7)`. OLS gives slope 3/2 and intercept 5/6. Training/evaluation MSE are 1/18 and 5/72. The training-mean constant has errors 14/9 and 130/9. These results were computed by the fixture and checked separately with exact Fraction arithmetic; they are not transplanted benchmark scores.

Canonical run records carry algorithm, data identity, parameters and measured errors. Versions 1 and 2 identify the two artifacts, while alias `serving` moves from 1 to 2 after a predefined constructed MSE rule. An already recorded request keeps version 1. JSON serialization/reload produces exactly equal predictions on the two local evaluation points.

The text develops execution versus content identity, split and preprocessing boundaries, missing measurements and failed runs, immutable version versus mutable alias, artifact/feature compatibility for promotion and rollback, and serialization trust. It does not claim that this dictionary is a registry service or that it tests authentication, transactions, concurrency, cross-language reproducibility or model capability. Pickle, safetensors and ONNX are concept comparisons checked against primary documentation; no foreign serialized object, tensor file, export graph or model is loaded.

Exact documentation references include MLflow workflow revision `614d987099d69f5aa32f2dbd29e7f9bf4500aebd`, safetensors specification `9e6f4d6c7af8c63ac791ab1bfdd58d2de02fbaa4`, Python pickle documentation 3.15.2 and ONNX Concepts 1.24.0. Bouthillier and coauthors' arXiv:2103.03098v1 abstract supports only the stated general point about variation sources; no empirical table or benchmark setup is reused.

## Assets and execution evidence

Removed after checking that no source imports remain:

- `src/components/figures/features-and-skew/SkewPaths.astro`
- `src/components/figures/features-and-skew/PointInTime.astro`
- `src/components/figures/experiments-and-registry/RunToRegistry.astro`

The replacement notes import no teaching components. Direct assets are original Markdown tables, formulae, the two inline programs, `scripts/notes/mlops-features-registry-cases.py`, and `docs/reports/2026-11-13-licensed-example-renewal/mlops-features-registry-results.json`. Shared unchanged site rendering remains outside this topic review. Reference documentation is not bundled, and a software license is not being treated as clearance for a third-party data or image asset.

Executed checks:

1. Ran the original script and saved its JSON output; a fresh independent process reproduced the saved bytes exactly.
2. Executed every inline program in both locales; stdout exactly matches the displayed blocks.
3. Mechanically matched 23 mathematical spans and two Python blocks across the language pairs. A first checker regex mishandled display-math delimiters; the corrected inline/display parser passed without changing the mathematical content.
4. Separately derived both coefficient values and all four MSE values using exact rational arithmetic.
5. Confirmed identical curriculum frontmatter and preservation of prior explicit anchors. Compiled all four final MDX bodies with local heading processing, remark-math and strict KaTeX.

No heavy site build, browser verification, installed feature store or registry integration, remote execution or production deployment is claimed here. Parent-coordinated publication must run the integrated rights/practice/build checks on the final selected snapshot.

## Coordinator review follow-up

Coordinator read both complete English notes and checked the current Feast guide. At their suggestion, both the full selector and inline version now detect unequal values at the same eligible entity/event/availability key, rather than relying on the fixture's total-order assumption. Identical repeats are accepted; a conflict whose timestamps are not yet eligible remains outside the historical view. Focused assertions exercise these boundaries, and baseline training MSE 14/9 now has an explicit assertion. Both locale explanations were updated. Full fixture output and the inline shown stdout remain unchanged; record hashes were refreshed. This is a bounded improvement, not a runtime feature-store test.
