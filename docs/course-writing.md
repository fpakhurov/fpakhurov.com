# Writing course notes

How the Generative Models notes were written and reviewed, as a guide for the next course or the next pass. The notes on the site are the official course notes: they stand on their own and never refer to the private material they were written from.

## 1. Source material stays private

- Handwritten scans, photos and lecture recordings never enter this repository. The repository is public, and git history keeps every file that was ever committed. Keep originals in a local folder outside the working copy; `.gitignore` blocks common scan formats under `source-material/`.
- The notes do not mention the source: no "the scan", "page 12", "the slide", "the seminar asked", "uncertain reading", "transcribed from". If a reading of the source is unclear, resolve it with the literature or the notebook, or leave the point out.
- Errors in the source are not listed as corrections. The note states the correct version, explained well enough that a reader who saw the wrong one would understand why.

## 2. Voice

- Neutral or first person plural: "we sample", "the bound becomes". No first person singular, no classroom framing ("this week", "the presenter", "homework").
- Short declarative sentences, one idea each. Define a symbol before its first use, and keep one notation per concept across the whole course (variance as the second argument of $\mathcal N$; $P$ the data, $Q$ the model; $f: z \to x$ for flows).
- Name the conclusion and then justify it. Every "therefore" needs the step that makes it true.

## 3. Storyline

- The course is one story. The order lives in two places that must agree: the `order` field of each note and the section map in `src/utils/courses.ts`. The build checks that every published note is listed, that every listed note exists, that a note's `section` matches the section it is listed under (anchored cross-references are exempt), and that every anchor named in the map exists on the built page.
  - Generative Models: Gaussians → entropy and KL → fitting with KL → training background → autoencoders → VAE → GAN → WGAN → IS → FID → LPIPS → flows → flow architectures → DDPM forward → DDPM objective.
  - NLP: text as data → tokenization → corpora and evaluation → bag of words and TF-IDF → n-gram LMs → word embeddings → Word2Vec → CNNs → RNNs → LSTM/GRU → seq2seq → attention → self-attention → Transformer → positions → Transformer MT → BERT → GPT → model families → transfer learning → fine-tuning → PEFT → instruction tuning → quantization → classification → NER → QA → summarization → semantic search → RAG → tools and agents → LLM evaluation → text diffusion. Planned topics (GloVe, FastText, sentence-pair similarity) stay as plain strings in the map until they have source material.
- Each NLP note follows one storyline: problem → baseline → where it fails → key idea → mechanism and formulas (with shapes) → worked example → results → what changed against the baseline → limitations → what to remember → next. Blocks used: `Key idea` callout, **Worked example**, **What changed**, **Limitations**, **What you should remember**, **Notebook**, **Next**. No quizzes.
- Every number quoted from a notebook is a saved output of that notebook; when a run was interrupted or an output was not saved, the note says so instead of quoting a number. Numbers that only illustrate a formula are labelled as toy examples.
- Each note opens from where the previous one ended (one paragraph: what problem is left, what this note does about it) and closes with a **Next** section that names the problem the next note solves.
- Every topic has exactly one home. Theory and practice can be split (entropy note: the quantities; fitting note: what they do in training), but the same derivation is never written twice. Cross-link instead, with anchors: `/notes/generative-models/vae#where-the-elbo-comes-from`.
- Heading slugs are part of the interface: the course map and other notes link to them. Changing a heading means updating every link to it; the link check below catches misses.

## 4. Structure of a note

1. Frontmatter: `title`, `description` (one sentence, what the note covers), `course`, `section` (must match a section in `courses.ts`), `order`, `status`, `tags`, `prerequisites`.
2. Opening paragraph that connects to the previous note.
3. **Notation** paragraph when the note introduces symbols.
4. Body sections, each built around one question. Prefer "Why not just …?" or "Where the bound comes from" over generic headings.
5. Callouts (`<aside class="callout"><strong>Title.</strong> …</aside>`) for side derivations, caveats and takeaways. Give each a real title; never "Editorial note".
6. **Notebook**: what the accompanying notebook does, cell by cell (see section 7).
7. **Next**: one paragraph that hands over to the next note.
8. **References**: full entries with links.

## 5. Mathematical standard

- Every equality in a derivation is either an identity the reader knows or is justified in the text (chain rule, linearity of expectation, Jensen, completing the square, change of variables).
- State the conditions under which a formula holds: positive definite rather than semidefinite before inverting $\Sigma$; absolute continuity for a finite KL; small steps for a Gaussian reverse process; one group for the convolution formula.
- Watch the usual slips: variance versus standard deviation ($\sqrt\beta\,\varepsilon$, not $\beta\,\varepsilon$); a density is not a random variable; signs of bounds (an ELBO is a lower bound on $\log p$, its negative an upper bound on the NLL); convex versus concave in Jensen; $\le$ versus $=$ for entropy maxima.
- Recompute every number shown (tables, worked examples, figure annotations) with a script, and keep the numbers consistent between text, tables and figure captions.
- Prefer one worked example with small numbers per key formula. It is the fastest check for the reader and for the reviewer.
- When a notebook or a common simplification deviates from the theory, say so in one sentence and give the correct form (for example, BCE with logits after a sigmoid; a density plot that drops the log-determinant).

## 6. Sources

- Cite the primary paper for every model, loss and named result, plus a textbook or review for background. Cite inline as `([Ho, Jain and Abbeel, 2020](#references))` and list full entries under **References**: authors, linked title (arXiv abstract page or DOI), venue, year, and the section or theorem when a specific result is used.
- Cite only what has been checked. If a claim comes from general knowledge of a codebase or paper that was not re-read, either verify it or soften it.
- Prefer stable links: arXiv `abs/` pages, DOIs, proceedings pages. Open each link once before publishing.

## 7. Notebooks

- Link notebooks at a pinned commit, never at a branch: `https://github.com/HSE-LAMBDA/DeepGenerativeModels/blob/<sha>/seminars/...` for Generative Models and `https://github.com/glkuzi/nlp_dsba/blob/4130e09940ddd363cee9fa3bd51b149466cfc6fb/seminars/...` for NLP. State the convention once per Notebook section: cell numbers count every cell, markdown included, from 1. The NLP repository is private at the time of writing; the links resolve for its collaborators and 404 for others until it is made public.
- Describe what the cells do and which choices they make (datasets, hyperparameters, loss reductions, sampling details), in the note's notation.
- Separate procedure from results. Quote numbers only from saved outputs and say so; if a notebook has no saved outputs, say that it documents procedures.
- Report implementation issues plainly and briefly (a reused tensor, a missing `eval()`, a mislabelled plot). They are useful to readers who run the notebook.

## 8. Figures

- Figures are Astro components in `src/components/figures/<note>/`, wrapped in `Figure.astro` (numbered automatically, with `title` and `caption`). Draw them as SVG computed from the formulas; avoid raster images.
- Use the shared SVG vocabulary (`f-line`, `f-axis`, `f-math`, `f-label`, `f-t-blue`, …) and the `--fig-*` colour tokens so that light and dark themes work without per-figure code.
- Provide a `fig-narrow` variant when the wide layout would shrink text below about 11 px at a 500 px column; otherwise one variant is enough.
- Every SVG has `<title>` and `<desc>` that describe what the figure shows in words.
- The caption explains how to read the figure and states the parameters used; it never describes where the drawing came from. Caption, figure and text must use the same numbers.
- Check each figure in light mode, dark mode and at narrow width: no overlapping labels, no clipped text, arrows pointing at what they label.

## 9. Formatting details

- Long display equations overflow the reading column on narrow screens. Split them with `aligned` or `gathered`, or move conditions into the sentence before the display.
- Tables: keep cells short; wide tables scroll inside their own container, but the page must never scroll horizontally.
- Code blocks: minimal, runnable, in the note's notation, with short comments.

## 10. Quality checks before publishing

Run after every change set:

1. `npm run build` with 0 errors.
2. On every built note page: no `katex-error`, no duplicate `id`, no broken internal link or anchor (including links from the course map and between notes).
3. A text search for banned source words (`scan`, `seminar`, `slide`, `page \d`, `handwrit`, `editorial`, `transcri`) in notes and figure captions, with notebook URLs excluded (their paths contain `seminars/`). Author names such as Pascanu are false positives.
4. `COURSE_LENIENT=1 npm run build` builds a course whose map lists notes that do not exist yet (useful while drafting); the plain `npm run build` is strict and is what is published.
5. Visual check of changed figures in light, dark and narrow layouts.

## 11. Review process

- Draft → two independent reviews → fix. One reviewer checks **fidelity and storyline** (does every claim hold, does the note connect to its neighbours, is anything missing); the other checks **mathematics and figures** (each derivation step, each number, each figure against its caption).
- Reviewers can be wrong. The fixer verifies every finding against the mathematics, the notebook or the paper, applies the valid ones and records why the others were rejected.
- Work through topics one at a time and commit after each. Long multi-agent runs hit usage limits; a sequential run loses at most one topic when interrupted and resumes from cache.

## 12. Working environment

- Each agent runs its own dev server on its own port (for example 4400 for one, 4321 for another) and its own working copy or branch. Merge through git, not by editing the same files at once.
- Screenshots and build outputs fill the disk quickly. Keep them in a scratch directory and delete them after the review.
