# NLP renewal: corpora-and-evaluation

Date: 2026-11-13. Author/scoped reviewer: Codex xufana_scope. Scope: complete English/Russian replacement, all examples, tables, formulas, links and the relevant portions of the shared executable fixture. This is a bounded source/body/asset review, not legal certification or approval of other topics.

## Replacement boundary and curriculum

Only pre-takedown YAML and heading/anchor metadata were extracted from first-party revision `cd446dc`; fenced code and prose were excluded from the retained metadata. No withdrawn note body, notebook, dataset, output, figure or question was used to draft these replacements. IDs, section/order, prerequisites and old anchors are retained; descriptions and full bodies are new. Historic AG-News-named anchors, where present, are compatibility IDs only and do not describe the new section's material. English/Russian generated heading IDs match and every prior anchor remains. There are no local figure imports or unreviewed transitive assets.

All messages, frequency tables, labels, query inputs, coefficients, experiment configuration, instructional exposition, code and result tables were authored for the Fedor Pakhurov project with Codex assistance. No guarantee of exclusive copyright is asserted. The equipment-library situation is fictional; no user messages, scraped corpus, named benchmark data, model weights or third-party implementation is distributed. General definitions and named methods retain precise conceptual credit.

## Source selection

Hugging Face course revision `8b893f0ede6c781045692a7f892f25a0c92b4805` has Apache-2.0 in its exact root LICENSE (SHA256 `c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4`), with no additional LICENSE/NOTICE paths in the inspected tree. Only the selected text files listed below were inspected for this use. They contain external media and linked model/data examples; all such assets are excluded. Repository eligibility is not a grant over those external materials. The course is a commercially eligible background source, but our use is factual reference rather than adapting its prose, code, worked examples or illustrations. Therefore no copied Apache-covered material is being redistributed and no new Apache notice is attached to our original files. This decision does not approve future copying from those files.

Other sources are reference-only as specified below. Their public availability is not treated as an adaptation grant. YSDA candidate material is not used in this batch because no such asset is required for these independently specified examples.

- **Cross-validation: evaluating estimator performance**, Scikit-learn developers. [Documentation1.9.1, read2026-11-13](https://scikit-learn.org/1.9/modules/cross_validation.html#cross-validation-iterators-for-grouped-data); Introduction and GroupKFold subsection3.1.2.4.1. Use: reference. Validation/test information flow and non-overlapping groups. Read primary documentation; versioned URL returns200. No Iris/subject numeric example, plot or library code reused. Six-issue/two-copy split fixture newly specified; no model score inferred from group counts.

- **Precision, recall and F-measures**, Scikit-learn developers. [Documentation1.9.1, read2026-11-13](https://scikit-learn.org/1.9/modules/model_evaluation.html#precision-recall-f-measure-metrics); Sections3.4.4.9 and3.4.4.9.2. Use: reference. Binary definitions and macro/micro aggregation. Read primary definitions and explicit macro-vs-harmonic warning. Twelve tickets and all labels/predictions are original; exact Fractions independently determine table metrics, no third-party benchmark.

- **Datasheets for Datasets**, Timnit Gebru; Jamie Morgenstern; Briana Vecchione; Jennifer Wortman Vaughan; Hanna Wallach; Hal Daumé III; Kate Crawford. [arXivv8,2021-12-01](https://arxiv.org/abs/1803.09010v8); Abstract. Use: reference. Motivation/composition/collection/recommended-use documentation. Abstract-level conceptual citation only. Full questionnaire, source example datasheets and paper prose not reproduced; no full-text audit claimed.

## Technical and bilingual verification

Twelve invented tickets give TP3FP2FN1TN6; exact accuracy3/4,precision3/5,recall3/4,F1=2/3,negativeF1=4/5,macro11/15; majoritybaseline2/3. Sixissue/twocopy split has6sharedgroups vs0; strict spanF1=1/2. Labels explicitly fictional contract, no safety policy or significance/generalization claim.

Fresh Python3.9.7 execution in a separate process and working directory reproduced saved JSON byte for byte. No network or external library is used. The saved result includes Unicode database13.0.0. Other runtimes may change Unicode metadata or final floating-point digits; exact identity is scoped to the recorded environment. Displayed prose numbers are rounded from the saved run, while Fraction assertions check discrete counts and rational metrics. The logistic run is actual deterministic local optimization, explicitly training-only.

Both full locales were read in the author pass; all 20 math spans are byte-identical. Both candidates compile with installed MDX, remark-math, the site's explicit-heading plugin, rehypeHeadingIds and strict KaTeX without diagnostics. All 13 heading IDs match between languages, without duplicates. Companion verification JSON pins the current note/fixture/results bytes.

## Review and publication status

Author's complete scoped review is recorded. Independent peer review passed in the bounded scope below; coordinator review and actual-page/browser/full build/CI/publication checks remain outstanding. All candidate files are outside the served repository at `/Users/fedorpakhurov/code/_work/fp-nlp-renewal-drafts`. Prospective `published` frontmatter is inert there; the real held stubs and withdrawal registry remain unchanged. Only the coordinator may restore these files and update holds atomically after reviews. These candidate records cannot be used as an already published BIASED upstream.

No full-site rights gate has been represented as passing these held drafts. That gate must run on the coordinator's final restored snapshot; automated metadata/hash validation cannot certify scientific truth or ownership. No commit, build, deployment or source-author contact was performed by this agent.

## Independent peer review

Independent reviewer Codex course_licenses read all ten full English/Russian bodies, the complete Python fixture, checker and five reports; checked all 35 current file hashes. A fresh Python 3.9.7 process reproduced saved JSON byte for byte. Strict MDX/KaTeX compilation passed all ten notes with 61 preserved anchors and 93 identical bilingual math spans. A separate oracle, without importing the author fixture, recomputed expanded-occurrence BPE, Fraction confusion/F1/span metrics, Unicode counts/offsets, and Decimal45 NLL/perplexity, TF-IDF coordinates/cosines and 400-step logistic parameters/loss/probabilities (agreement below 1e-12). Read-back confirmed the Russian same-word-multiset order example, positive error-cost condition and inspection artifact keys. Primary-source comparison covered the selected Hugging Face text, Sennrich section 3.2/algorithm, SentencePiece sections 2/3.1/3.5, Unicode sections 1.1–1.3/7, Python 3.9 Unicode API, scikit-learn 1.9.1 TF-IDF/log-loss/group metrics, and the Datasheets abstract. Seven fresh raw pinned Hugging Face blobs (six texts and LICENSE) matched SHA256; the nontruncated tree contained only LICENSE and no NOTICE. No copied artifact was identified in this new bounded scope. This was not a browser/full-site/CI/production check, review of other topics, or universal ownership guarantee.

## Coordinator release review

Codex root checked the candidate source/hold transition, review records and dependency boundary, read the complete introductory note and targeted worked-example/output sections, and relied on the independent full bilingual/source/math peer described above for the complete five-topic comparison. Fresh standard-library Python output matched the saved JSON byte for byte. Forty actual Astro views (five topics, both locales, 390/1440 pixels, light/dark) passed page-width, KaTeX, font and withdrawn-link checks. All five Russian mobile opening screens were visually inspected.

The first browser pass found a five-weight inline vector overflowing mobile BoW pages. Both locales now show the same numeric weights in a token/weight table, with spaced plain-text probabilities; the full forty-view rerun passed. This changes the combined math-span count from 93 to 91 without changing the calculations. All 61 historic anchors remain. The 35 other NLP publication holds remain active, and replacement history records these five restored IDs. Production build/link validation and live verification are separate release steps. No BIASED lesson is derived until this upstream revision is published.
