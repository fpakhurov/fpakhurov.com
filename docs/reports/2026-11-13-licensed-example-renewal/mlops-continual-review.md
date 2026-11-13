# MLOps renewal: retraining and continual learning

Reviewed 2026-11-13. Complete file-level scope: both new note bodies, their direct math/tables, original standard-library script and saved outputs. Independent coordinator/peer review and integrated publication remain separate pending stages. This record does not clear the rest of the systems courses.

## Replacement and provenance

Both entire bodies are newly composed for the Fedor Pakhurov project with Codex assistance. Old source-dependent explanations, simulated measurements and imported figures are removed. Curriculum IDs, prerequisites and explicit anchors remain; descriptions now match the bounded deterministic examples. EN/RU are approximately 2,498/2,273 whitespace-delimited words including references and math.

Reference sources are checked only for the stated mechanisms: Google Rules 8–9 and 35–36; TFX Evaluator's baseline/candidate validation interface; EWC and experience-replay primary abstracts; selective-label definition from the Cornell-hosted primary paper's indexed abstract. The direct selective-label PDF request timed out, so this report does not assert full-paper inspection. No paper experiments, code, datasets, diagrams, Google anecdotes or operational rates are reused. Exact locators and limitations are recorded in `content-rights/reviews/mlops-continual-learning-renewal.json`.

## Original reproducible cases

`scripts/notes/mlops-continual-cases.py` produces `mlops-continual-results.json` in this report directory.

- Linear age-cost model: C=12, a=0.75 gives continuous optimum sqrt(32) hours; exhaustive integer intervals 1–12 choose six hours at 4.25 cost units/hour. The model explicitly assumes instantaneous successful replacement and cannot infer a real retraining schedule.
- Conflicting scalar objectives `(w−1)^2` and `(w+2)^2`: individual minima 1 and −2, equal-replay optimum −0.5 with losses 9/4, anchor coefficient two yields optimum zero with losses one/four. No neural training, Fisher estimation or EWC implementation is claimed.
- Six independently specified decisions: label cutoff six observes a/b/e, accuracy 3/3; cutoff twelve observes all six, accuracy 4/6. The retrospective truth table is explicitly unavailable before the declared label arrival. No unknown label is recoded as negative.
- Equal click probabilities and squared expected-count allocation: exact share sequence 4/5, 16/17, 256/257, 65536/65537. This is a deterministic expected-count thought experiment, not sampled users or a copied recommender benchmark.
- Twelve original paired predictions give five improvements, one regression and exact i.i.d.-pair conditional two-sided p=7/32. The sole regression is a predesignated critical case, so its separate gate rejects the candidate despite the aggregate gain. Independent identically distributed paired observations and the limits of twelve cases are explicit.

Fresh execution matches the saved JSON byte for byte. Assertions cover all displayed results, paired predictions and exact fractions. Both bodies compile through MDX with strict KaTeX and local heading processing; all 17 mathematical spans match between languages, and every previous explicit anchor remains. No heavy build, browser check, real training or production experiment is claimed.

## Assets retired

After checking for remaining imports, removed the unreferenced components:

- `src/components/figures/continual-learning/RetrainingLoop.astro`
- `src/components/figures/continual-learning/FeedbackLoop.astro`

The replacement uses no imported teaching component, image, external model, external dataset or downloaded package. New direct teaching code and saved output are hash-covered. Shared unchanged renderer/runtime is outside this note-level review.

## Coordinator follow-up

The coordinator read both entire bodies and the fixture and independently checked the scalar losses, exposure sequence and p=7/32. Its precision correction is incorporated: the conditional binomial statement explicitly requires independent, identically distributed paired observations. This review does not assert that aggregate marginal equality plus arbitrary heterogeneous independent pairs suffices. Final replay and integrated release checks remain separate.

## Independent full bilingual review

A second reviewer read the complete EN/RU bodies, fixture, report and record. Fresh output replay was byte-identical. Separate Fraction calculations confirmed the integer cost optimum at six hours, scalar losses and derivatives, label snapshots, expected allocation shares and all64 conditional McNemar paths (14/64=7/32), including critical case6. Strict MDX/KaTeX and all17 paired math spans passed with no figure imports.

It freshly checked Google Rules8/9/35/36, TFX metric/slice/Pusher mechanisms and the EWC/replay primary abstracts. The Cornell selective-label PDF was accessible during this later pass: title/authors, abstract and first-page introduction were read. That resolves access to the cited definition; the earlier timeout remains historical and no full-paper inspection is claimed. No blocker remained within this full file-level scientific, bilingual and scoped-primary-source comparison. No browser/full-build/production validation is implied.
