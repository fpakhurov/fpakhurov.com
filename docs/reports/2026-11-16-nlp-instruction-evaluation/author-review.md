# Instruction tuning and LLM evaluation: scoped author review

2026-11-16. Author: Codex pretraining_author for the Fedor Pakhurov project.

The two held topics now have complete replacement English/Russian explanations, eight original figures, two exact figure-data fixtures and one small standard-library companion. This report completes the author’s review of this package. Root and gan_author are performing independent complete reviews; neither peer completion nor publication is certified here.

## Composition and source boundary

The original PLAN was written before the selected primary passages were read. Its SHA-256 is `6e817d2790f74c875abe3a94b8f94822ab0d420bb71eb3e7dab25a532e072779`; the exact plan is retained in this report directory. It fixes the symbolic assistant sequences, probabilities, three-outcome preference examples, twelve JSON addition fixtures, six discordant pairs, rank list, agreement table, judge-order decisions and synthetic latency list.

The initial current-stub projection at `2b6ea072ef065d5c7287c3508dec592eb5771b89` contained no teaching body or original graph. Root explicitly authorized historical identity recovery from `cd446dc8d2f68249eb62ff3598b202d8d5854315`. The extractor projected only title/course/section/order/status/tags/prerequisites, heading IDs outside fences and import binding names. It did not display or retain descriptions, heading prose, old teaching text, code, numeric results, import paths or figure implementations. The complete 19/14 anchor lists, title/order/section and prerequisite graph are preserved in both languages. Old imports are replaced by newly written components.

All selected sources are factual references, not imported teaching assets. `source-evidence.json` gives exact raw/extracted snapshot hashes, source notices and bounded reading locators for ten references (nine scientific source passages plus historical bibliography). The 27 raw PDF/HTML/text/API snapshots remain private under the scratch `sources/` directory and are excluded from the release manifest. Some source examples/code were visible alongside selected two-column PDF passages; they were not reused. No external dataset, notebook, code, figure, model weights, training run or benchmark result enters the package.

Cohen’s restricted 1960 full text was not read. SAGE publisher metadata and the saved Crossref record establish its historical bibliographic attribution. The technical definition was checked against Cohen’s own fully read 1986 Citation Classic commentary hosted by the University of Pennsylvania. The note and evidence distinguish those scopes explicitly. The new agreement table was specified in the earlier plan, not adapted from Cohen’s example.

Three existing first-party helpers are unchanged, byte-pinned to the stated FP revision and fully read. The author checker adapts the project’s prior first-party scoped rendering workflow with fresh fixture-specific checks; its source lineage is recorded. Installed parser/runtime packages are used without importing their source into teaching material.

## Technical and bilingual review

All four complete bodies, the eight component implementations, companion calculations and source passages have been read. The instruction route connects output contracts, template boundaries, target shifting and loss reduction to reward comparison, the finite KL optimum and DPO. The worked counterexample explicitly compares with the reference distribution, demonstrating that an improved relative preference need not increase absolute chosen mass.

The evaluation route names the task and population, provides every authored candidate output, distinguishes formatting from arithmetic, and preserves paired outcomes. The exact randomization result is conditioned on the stated exchangeability assumption. The text separates retrieval from generation, judge consistency from correctness, marginal chance agreement from accuracy, and synthetic latency arithmetic from service measurement. The nearest-rank domain is nonempty samples with probability in (0, 1].

Fresh strict checks pass on the final teaching bytes:

- Instruction: 53 math spans, 8 display blocks, 19 preserved headings, 2 tables and 4 figures per locale.
- Evaluation: 42 math spans, 7 display blocks, 14 preserved headings, 4 tables and 4 figures per locale.
- Exact ordered bilingual math and anchor parity; strict KaTeX and MDX; no active links to other held topics; existing linked anchors checked.
- Exact full stdout replay of the stdlib companion against `results.json`; two figure JSON files match its corresponding objects exactly.
- The finite reward identity/optimum is checked on 1176 positive probability vectors. Three DPO derivatives are checked with finite differences. All 64 paired sign assignments and all 15 two-candidate subsets are enumerated.
- All nine Astro components including the wrapper pass the production compiler transform and a separate convert-to-TSX/TypeScript syntax parse. The compiler-rs package does not implement convertToTSX, so the existing installed legacy Astro compiler performs that conversion.
- Actual scoped Astro container rendering yields 8 SVGs per locale. Each locale passes 87 numeric checks, 440 coordinate-attribute bounds and 4 paired judge-identity checks, with 24 unique accessible IDs.
- Trailing whitespace is checked across the explicit release manifest.

The body text discloses that all probabilities, candidate answers, judge labels and latencies are constructed. Nothing here measures LLM capability, human preference or production capacity.

## Peer findings resolved before freeze

Gan’s provisional reading identified an ambiguous reference baseline, two Russian wording issues and the nearest-rank domain. Both instruction locales now explicitly compare the second policy with q. The loss-weighting caption now states that the probabilities are unchanged across reductions, avoiding an interpretation that all token probabilities equal each other. The evaluation translation says equally probable assignments and a coherent answer; both locales state the quantile domain. Author rereading also replaced a rounded MRR equality with an approximation sign, made zero-based token indexing explicit, split long formulas, and strengthened the token-shift assertions. These changes were checked before the frozen manifest was emitted. A later peer locator check corrected Dror’s test-family section from 3.3 to 3.2 in both citations and source records; the selected passage and technical content are unchanged.

## Reproduction and remaining gates

From the installed FP checkout, run the outside checker serially with Node heap 192 MiB:

```sh
node --max-old-space-size=192 /Users/fedorpakhurov/code/_work/fp-nlp-instruction-evaluation-drafts/scripts/notes/check-instruction-evaluation.mjs /Users/fedorpakhurov/code/_work/fp-nlp-instruction-evaluation-drafts --render-dir=/Users/fedorpakhurov/code/_work/renewal-verification/instruction-evaluation-author
```

`checks.json` is the saved scoped result. Rendered HTML and the temporary bundled component module remain outside the release. There was no package installation, browser run, full site build, CI run, push, deployment or release-directory mutation by this author. Source-responsive SVG layout and coordinate checks are not a browser visual review. Root owns both independent review closure and integrated rights/content/build, hosted visual review, publication and exact live verification. BIASED may derive these topics only after those FP gates complete at a pinned live revision. Other held topics remain outside this package.
