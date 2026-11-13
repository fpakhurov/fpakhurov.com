# Discrete distributions: complete example and source renewal

Reviewed 2026-11-13 by Codex `takedown_routing`. Scope: the complete current English and Russian `probability/discrete-distributions` notes, their two figures and dependency closure, new standard-library generation/verification code and saved outputs. This is a bounded decision about these files and uses, not approval of the probability course or a legal guarantee.

## Replacement and retained curriculum

Both bodies were newly composed around explicit fictional sensor and device-selection mechanisms. All thirteen original section anchors, topic identity, order, prerequisites and course membership remain. The historical Bortkiewicz aggregate, old horse-kick figure, associated fitted outputs, old coin/click/dice/card worked examples and old inline code are removed from this topic. This removal does not assert that historical facts themselves infringe copyright; the new lesson no longer needs unresolved historical-edition or reproduction evidence.

The new examples were specified for Fedor Pakhurov's project with Codex assistance. No user-supplied measurements, external dataset, old benchmark observations, paper code, third-party diagram or pretrained model were inputs. No claim of exclusive copyright in AI-assisted material is made. General distribution identities are scientific facts; the source references below support them without licensing an adaptation of their expression.

The new learning route covers random variables/PMF/CDF, Bernoulli/categorical, binomial, geometric stopping and memorylessness, a direct binomial-to-Poisson limit, finite-population hypergeometric counting and concrete failures of model assumptions. The old blanket claim that independent test examples suffice for binomial correctness is replaced by the fixed-classifier/common-population setting. The old claim that heterogeneous probabilities always widen spread is replaced by explicit underdispersion and dependence counterexamples.

## Original computations

- Two sensors with probabilities 1/4 and 1/2: exact PMF `(3/8, 1/2, 1/8)` and CDF at one `7/8`.
- Twelve independent reports with probability 1/5: probability of exactly three `0.23622320128`; at least four `0.20543105024`. Tail boundaries are explicit.
- Geometric waiting with p=1/5: five-trial tail `1024/3125 = 0.32768`. The first successful trial is counted; p=0 and impossible conditioning histories at p=1 are addressed.
- Poisson approximation with mean 1.2: exact binomial masses for n=12, 48, 192 and full aggregated tails. Zero probabilities are `0.282430`, `0.296634`, `0.300062`; Poisson gives `0.301194`.
- Forty-eight independent sensors with p=1/40 versus twelve independent activation groups of four, each with p=1/40. Both model means are 1.2; variances are 1.17 and 4.68. Direct exact-Fraction moment sums independently verify these values. Zero probabilities are approximately 0.296634 and 0.737998.
- Two newly generated 512-window fixtures use Python `Random` seeds 2026111305 and 2026111308. Each latent activation consumes one fresh `random()` value; no external input is read. Saved JSON contains all 1,024 generated counts, not only summary numbers. Histogram buckets 0–5 and 6+ are `[152,191,113,42,12,1,1]` and `[368,0,0,0,121,0,23]`. Empirical means and variances are identified as finite-run quantities, not the theoretical moments.
- Uniformly selecting six devices from eighteen, five marked: every one of 18,564 subsets is enumerated to check the full hypergeometric PMF independently of its combination formula. Exactly two has probability `275/714`; the binomial substitute gives approximately 0.314898.
- Independent heterogeneous p=(0.1,0.9), equal p=(0.5,0.5), and identical shared fair indicators give exact variances 0.18, 0.5 and 1. The text separates unequal probabilities from dependence.

The Poisson comparison is specified at mean 1.2, not fitted after observing either synthetic sample. A histogram match is explicitly not evidence establishing physical independence. The simulation illustrates a constructed mechanism; it is not an experiment on real hardware.

## Figures and direct dependencies

`PoissonLimit.astro` is newly composed as a probability matrix with an aggregated tail, replacing the previous three-panel chart. New `CountMechanisms.astro` plots the two saved synthetic histograms on the same scale against specified Poisson expected counts. `countData.ts` is generated deterministically from the verifier's results. Both figures include textual SVG descriptions, wide/narrow variants and render-time arithmetic checks. Captions describe parameters and tail handling in fewer than fifty English words.

`HorseKicks.astro` is deleted after scanning for imports and links. There were no inbound links to its figure ID. The existing `Figure.astro` wrapper, `lang.ts` locale helper and `remark-heading-ids.mjs` heading plugin used by the verifier were read in full and are included by exact hash; they contain generic project rendering, not external media. The general website stylesheet/runtime is unchanged and outside this topic-specific ownership review.

## Checked primary references and use boundary

Read through the web tool on 2026-11-13:

1. NIST/SEMATECH *e-Handbook of Statistical Methods*, sections 1.3.6.1, 1.3.6.6.18 and 1.3.6.6.19: PMF requirements, binomial common probability/formula, Poisson formula and moments. Our derivations, sensor inputs, layouts and generated results do not reproduce the handbook's examples or plots.
2. The SciPy community, 1.18.0 manual, `geom` Notes: support starts at one and 0<p≤1; `hypergeom` Notes: parameter roles, PMF and support. No SciPy implementation, documentation code, animal-selection example or rendered plot is reused. The executable example does not import SciPy.
3. Python Software Foundation, Python 3.15.2 documentation, `random` and Notes on reproducibility: separate seeded `Random` instances, uniform `random()` values and compatible-seeder sequence guarantees. No documentation example is adapted. Python is a runtime dependency, not a source of external observations.

These are factual references. No repository license badge or public accessibility was treated as a reusable-material grant. The bibliography names only the sources actually checked for this composition. The mathematical identities are also directly derived or linked to their conceptual home in the current text.

## Verification performed

- `python3 scripts/notes/discrete-distributions-renewal.py`: exact fraction assertions, subset enumeration, fixture replay and byte-identical figure-data/result comparison pass on CPython 3.9.7 and 3.14.7. `math.fsum` prevents the Python float-summation implementation change from altering the recorded tail at the last bit.
- `node scripts/notes/check-discrete-distributions-renewal.mjs --render`: both inline examples replay with exact displayed stdout; 133 mathematical spans per locale agree in order and parse under strict KaTeX; both MDX bodies compile; actual Astro figures render in EN and RU with wide/narrow SVGs and no invalid numeric attributes.
- Standalone rendering uses the installed Astro compiler and container. Build-only module metadata is omitted from this preview harness; the actual component factories, wrapper, locale helper, figure data and project CSS are used. This is not a replacement for the full production build.
- Headless Chromium 156.0.8078.4 rendered EN/RU at viewport widths 390 and 1000, in light and dark themes. All eight configurations have two visible SVGs, no page overflow and no text outside SVG viewboxes. Wide/dark and narrow/light screenshots were visually inspected, as were earlier complementary light/dark views. Saved evidence is `discrete-distributions-visual-checks.json`. This checks the figures, not every full-note page element or a deployed site.
- All thirteen original section anchors remain in both locales. The generated content contains no retired historical counts or references. `git diff --check` passed.

Independent review by Codex course_licenses passed after reading the complete EN/RU bodies, both figure sources and the full numerical verifier. A fresh Python replay and `node scripts/notes/check-discrete-distributions-renewal.mjs --render` passed. Separate exact-Fraction Bernoulli convolution checked the PMF, both twelve-report probabilities, the two theoretical means/variances, all saved-array moments, binomial zero probabilities for n=12/48/192 and the hypergeometric ratio 275/714. The reviewer also read the primary NIST Binomial/Poisson and SciPy geom/hypergeom sections. The independent calculation did not implement a second random stream or a second exhaustive subset enumerator; these are covered by fresh execution of the original verifier. The single finding, distinguishing the first figure's 3+ bucket from the second figure's 6+ bucket, is fixed in both locales. The reviewer did not claim screenshot, CI or production checks.

Coordinator narrative/source review and integrated publication checks remain separate. No full-site build, CI or deployment is claimed here.

## Adjacent-note maintenance boundary

The only changes to `continuous-distributions` EN/RU replace the stale horse-kick reference in the existing “named distribution is a model” bullet with a link to the new independent/grouped count subsection. The remaining continuous note, examples, source relationships, figures and adjacent statements have not received a complete review in this batch. Its separate maintenance record cannot qualify it as a reviewed BIASED upstream source.
