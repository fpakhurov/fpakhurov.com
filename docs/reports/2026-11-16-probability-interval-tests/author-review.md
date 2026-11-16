# Full author review: confidence intervals and hypothesis tests

Date: 2026-11-16. Reviewer: Codex sequence_peer, author. Scope: two complete replacement notes in both languages, four replacement figures, all new code/results, primary reading scopes, source decisions and exact per-file provenance. This is an author-scoped review; two independent full peer closures and publication gates remain separate.

## Curriculum and teaching

All four bodies were read completely. Existing titles, course, section, order17/18, status, tags, prerequisites and all23 heading anchors are preserved per locale. Descriptions are new and specific. The causal path is sampling coverage to pivots and score inversion, finite bootstrap to its support failure, paired uncertainty, then decision calibration, repeated looks, multiplicity and design-respecting randomization. Each note states assumptions, gives original worked numerical cases, distinguishes exact and approximate guarantees, and hands off to its actual next topic. The test note's next-topic text is plain Markov chains, without an active unreviewed destination link.

Both figures per note are accompanied by worked tables and derivations. This bounded visual count avoids redundant illustrations; each of the four figures performs a different quantitative task. Dense derivations use explicit line breaks. Core explanations remain readable without running code; stdlib snippets are supplementary and have saved literal outputs.

## Technical review and executed evidence

The case script computes normal and Student intervals; all17 binomial interval outcomes and exact coverage; all256 ordered bootstrap resamples; paired loss moments; exact test tails/power; pooled/unpooled A/B estimates; six-look binary path counts; Bonferroni/Holm cutoffs; all20 experimental assignments. All inputs were chosen before primary reading, as recorded in unchanged plan.md.

The94 arithmetic assertions include an independent Simpson integration check of the t4 CDF; exact rational paired moments; exhaustive4096 binary-sequence checks against binomial tails; a separate ten-step convolution recurrence against the one-step peeking DP; all21 randomization p-value superuniformity cutoffs. Replay is read-only by default; regenerating saved JSON requires an explicit --write. Numeric artifacts are generated with Python standard library only, no external data, model, numerical package, stochastic seed or training.

Fresh serial Node192 checks pass:75 and71 identical ordered math spans per locale;13 and14 display blocks;11 and12 historical heading anchors; matching code/imports and exact inline stdout; strict MDX and strict KaTeX. Every figure and shared wrapper passes Astro compilation and TypeScript TSX parse. Actual Astro component rendering checks four figures/six SVG panels per locale, accessible IDs/descriptions, finite output and1108 exact data/coordinate assertions across all interval segments, bootstrap stems, rejection/power bars and repeated-look lines/markers. The cardinality is asserted to prevent silent loss of checked plots. All note/figure trailing whitespace is rejected. These are source and component-render checks, not browser layout measurements.

## Primary sources and scope

Eight exact primary sources were consulted for mathematical mechanisms and assumptions: Neyman1937, Student1908, Wilson1927, Efron1979, Neyman/Pearson1933, Johari/Pekelis/Walsh1512.04922v3, Holm1979 and Hemerik/Goeman1912.02633v2. Exact sections/pages, snapshot hashes, mirror URLs and checked notices are in source-evidence.json. Scan-only relevant Student/Wilson/Holm pages were read directly as images. Source examples, prose, figures, tables, code, empirical results and datasets were not imported. All use is reference-only; no reuse permission is inferred from age, a public PDF, personal notes or a repository-level license.

Student's historical divisor convention is recorded accurately; the note uses modern divisor n−1. The bootstrap reference supports empirical resampling, not an asserted universal finite-sample coverage theorem. Holm's m0=0 case is explicitly separated before division by m0. The randomization derivation assumes a uniform complete assignment and sharp null; equal means alone do not justify arbitrary label shuffling. Reference snapshots and page images stay outside the release.

## Peer findings incorporated before freeze

The preliminary independent peer requested (1) an explicit Holm zero-true-null case, (2) approximate notation for rounded pooled SE with the symbolic Z denominator retained and (3) an accurate bootstrap accessible description distinguishing colored interval bars from the dashed mean line. All three are applied in both locales where appropriate; no numerical fixture or plot coordinate changed. Additional author checks state alpha bounds and the n≥2 Student condition, split long displays, and keep all uncertainty guarantees model-dependent.

## Remaining publication work

The package is not yet published and is not all-course rights clearance. Two independent complete peers, coordinator integration, repository rights/content/build checks, CI mobile/dark/light/keyboard review and exact live publication verification remain required. No local site build, browser, devserver, package install, push or Actions invocation was performed for this author package. BIASED adaptation must use the later exact reviewed and live FP revision, never this unpublished draft.
