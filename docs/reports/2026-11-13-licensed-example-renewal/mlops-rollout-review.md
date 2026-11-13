# MLOps renewal: rolling out models

Reviewed 2026-11-13. Scope: complete newly composed EN/RU note, direct tables/math, original standard-library source and saved outputs. This record does not clear the remaining MLOps or systems topics. Independent peer review is recorded below; integrated coordinator/publication checks remain separate.

## Substantive replacement

Both complete bodies were replaced by independently specified preview-service examples authored for Fedor Pakhurov's project with Codex assistance. Existing curriculum YAML and explicit anchors remain. No old long simulation, source-book/course anecdote, external experiment result or figure layout is retained under a changed bibliography. New bodies are approximately 2,788 English and 2,446 Russian words, with derivations and limits.

Per-file hashes and source-specific scope are in `content-rights/reviews/mlops-rolling-out-models-renewal.json`. General conceptual citations remain, including historical algorithm credit. A paper's public PDF is not being treated as a reusable dataset or illustration license; its examples, prose and source code are not reproduced.

## Original cases

The independent fixture `scripts/notes/mlops-rollout-cases.py` saves results to `docs/reports/2026-11-13-licensed-example-renewal/mlops-rollout-results.json`.

- A stipulated canary gate uses 14 candidate failures and two baseline failures per 200 attempts. The candidate's 7% exceeds a predeclared 5% operational pause rule. This is not a calibrated significance test.
- Planning assumes 0.40 versus 0.44 success probabilities, independent binary units, common planning probability 0.42, two-sided alpha0.05 and target power0.80. The explicitly approximate totals are4780,7469,13278 for candidate shares0.5,0.2,0.1. The formula is derived from the variance of independent proportions; no exact power guarantee is claimed.
- Newly specified counts960/2400 versus1048/2400 give difference0.0366667, standard error0.0142301, approximate95% interval[0.0087762,0.0645571] and pooled-null p0.0100263. A separate cheaper candidate948/2400 gives p0.723394 but a one-sided lower bound−0.0282369, failing the stated noninferiority margin−0.02. Lack of a significant difference is explicitly distinguished from equivalence.
- The repeated-look example counts all1048576 fair binary paths of length20. A fixed look rejects21700 paths; looks4/8/12/16/20 at nominal0.05 reject68504; the five looks at0.01 reject11102. Dynamic programming produces exact fractions; a separate full bitstring enumeration reproduced every count. The discreteness of the fixed test and the conservative union-bound correction are explained. This is not a copied sequential method or external simulation.
- Counts2900/1900 versus planned2400/2400 give Pearson208.333333; the asymptotic tail is only a discrepancy signal, not a diagnosis of assignment failure.
- New five-document lists A=`quartz,cedar,reed,linen,plum`, B=`linen,quartz,spruce,reed,amber` and illustrative tie choices produce picksB/A/A/B and slate`linen,quartz,cedar,spruce`. A stipulated click oncedar creditsA. This is an original fixed trace of the cited general team-draft mechanism, with no source ranking instance, diagram or experimental result used.
- An original two-group mixture has overall success40% versus65% while the candidate is five points worse within both groups. Equal-group standardization gives−0.05 rather than the naive+0.25. It is explicitly not a valid randomized experiment; it illustrates population/filtering confounding.

No real users, production data, external dataset, network service, model or experimental assignment is used. Normal approximations are named as approximations; exact path counts are named as exact finite enumeration. The bandit section is conceptual and makes no simulation claim.

## Source evidence and assets

Read Google SRE's canary chapter and verified primary author names, NIST two-proportion test and interval definitions including coverage warnings, Microsoft's primary SRM abstract, Johari's primary author abstract, Cornell-hosted team-draft section5.2 and Thompson-sampling primary abstract/authors. The unsuccessful request to the old Microsoft controlled-experiment guide URL and timed-out Stanford PDF were not used as verified full-text evidence. That guide is not a replacement reference.

Retired after scanning for remaining imports:

- `src/components/figures/rolling-out-models/RolloutRamp.astro`
- `src/components/figures/rolling-out-models/TrafficSplits.astro`
- `src/components/figures/rolling-out-models/TeamDraft.astro`

New notes import no teaching components or images. Their Markdown tables/math and hash-covered source/output are the direct teaching assets. Shared unchanged renderer/runtime remains outside this scoped review.

## Executed checks and remaining stage

The full script generated saved outputs and a fresh execution reproduced them byte for byte. Independently enumerating every twenty-bit path confirmed all three stopping counts. All24 mathematical spans match between locales, prior explicit anchors remain and both final MDX bodies compile with strict KaTeX and local heading processing. The first auxiliary enumeration attempted a newer Python `int.bit_count` unavailable on the local interpreter; a compatible separate popcount table replaced it, and the exhaustive checks then passed. The published fixture itself does not require that newer method.

No heavy build, browser check, real experiment, bandit runtime or production deployment is claimed. The independent peer pass is recorded below; coordinator and final integrated publication checks remain separate.

## Independent review

A second agent read all EN/RU bodies, complete scripts, saved results, provenance reports and old examples to check the replacement boundary. Fresh stdout matched the saved JSON. Independent calculations verified the polynomial/Fraction gradient, per-phase ring source-contribution sets, pipeline dependencies, checkpoint finite differences; the separate rollout pass exhaustively counted all 2^20 paths and checked planning totals 4780/7469/13278, intervals, pooled test, noninferiority, SRM, balanced draft trace and mixture reversal. All 49 distributed and 24 rollout math spans and inline code agree across locales.

Primary comparison covered PyTorch 2.15 DDP/FSDP/checkpoint, NCCL 2.32.3, ZeRO v3 Section 4, GPipe v5 Section 2; SRE canary, NIST test/CI, primary SRM/Johari/Thompson abstracts and team-draft Section 5.2. The fixtures and results differ from the source examples; conceptual credit remains. Abstract-only evidence was not promoted to full-text inspection. Final rollout descriptions and the RU covariance qualifier were reread after correction. No remaining blocker was found within this full file-level technical/bilingual/source-comparison scope; this is not legal certification, runtime testing or production validation.
