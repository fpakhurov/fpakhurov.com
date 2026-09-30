# Transcription and figure guide

Conventions for turning the handwritten seminar scan (`gen-models-seminars.pdf`, 44 pages) into English MDX notes with vector figures. Page numbers are **1-based PDF pages**.

## 1. Sources

- **Scan:** `source-material/generative-models/gen-models-seminars.pdf`. Read it page by page (the PDF reader needs a page range). It mixes handwriting, printed slides and pasted screenshots (StatQuest, Normalized Nerd, 3Blue1Brown-style slides, a Russian ChatGPT answer). All of it is source material.
- **Course notebooks:** the seminars also showed notebooks from [HSE-LAMBDA/DeepGenerativeModels](https://github.com/HSE-LAMBDA/DeepGenerativeModels). Short handwritten remarks often refer to them: helper names, the dataset, the architecture, what a plot shows. Use a notebook to *resolve* such a remark, for example what `plot_2d_dots` does or what “LS loss” means. Cite the notebook path in the Source section. Never invent notebook details that you did not read.

| Scan pages | Likely notebook |
| --- | --- |
| 1, 13 | `seminars/00_Autoencoders/autoencoders.ipynb` |
| 2–12, 19–20 | `seminars/01_metrics-and-distances/distances.ipynb` |
| 14–19 | `seminars/01_metrics-and-distances/metrics.ipynb` |
| 21–25 | `seminars/02_GAN/GANs.ipynb`, `seminars/03_WGAN/WGAN.ipynb` |
| 25–31 | `seminars/06_Variational-Autoencoders/VAE.ipynb` |
| 31–37 | `seminars/09_Normalizing-Flows/nf.ipynb`, `nflib/` |
| 38–44 | `seminars/10_Diffusion-Models/02_DPM_Models.ipynb` |

## 2. What a transcription is

An edited, faithful, English article, not an OCR dump and not a rewrite from general knowledge.

1. **Coverage.** Every technical item in the page range must appear: each formula, derivation step, worked number, sketch, list item, Q&A answer and warning. Reorder and merge repetitions for readability, but do not drop content because it is informal or marked “skip” (those marks were for the live seminar).
2. **Drop only logistics:** dates, course codes (DSBA, ADD, АДД), “see GPT”, “show …”, “finish watching”, reminders and the joke on page 4.
3. **Translate** Russian passages into English. Keep a Russian term in parentheses only when it adds meaning.
4. **Pasted slides and screenshots** are re-expressed in your own words, with formulas re-typeset in KaTeX. Do not copy long passages verbatim.
5. **Formalize** descriptions into equations when the handwriting states the idea in words, and mark that in the Source section.
6. **Correct** errors in the scan in the main text, and list each correction in the Source section (“the scan writes X; the correct expression is Y because …”). Recompute every number, for example with `python3` (numpy is not installed; the `math` module is enough).
7. **Additions** go into the text when they help, such as a missing condition, a standard name or a short intuition. Mark substantial ones with an `Editorial note` callout or list them in the Source section. Keep the seminar's voice and its order of ideas.
8. **Uncertain readings:** choose the most plausible reading, and state it in the Source section if it matters.

## 3. Note format

Location: `src/content/notes/generative-models/<slug>.mdx`.

```mdx
---
title: Inception Score            # must match the topic name in src/utils/courses.ts
description: One sentence.
course: generative-models
section: Evaluation               # course section label
order: 5                          # global reading order
status: published
tags: [lowercase, hyphenated]
prerequisites: [Human-readable, Topics]
---

import SomeFigure from '../../../components/figures/<slug>/SomeFigure.astro';

Intro paragraph (what problem this solves and where it sits in the course).

## Section heading
...

## Source
Pages, notebooks used, corrections, editorial additions, uncertain readings.
```

- Math: `$inline$` and `$$display$$` (remark-math + KaTeX). Use `\mathbb{E}`, `\mathcal{N}`, `D_{\mathrm{KL}}(P\,\|\,Q)`, `\operatorname{...}`. Keep one notation per note and state it.
- Callouts: `<aside class="callout"><strong>Label.</strong> Text.</aside>`. Use at most 2–3 per note; prefer plain prose.
- Link to sibling notes with `/notes/generative-models/<slug>`.
- MDX pitfalls: `{`, `}`, `<` in prose must be inside math or code. Escape stray braces. No HTML comments; use `{/* comment */}`.
- Tables are fine for worked numbers.

## 4. Figures

The notes should be **visual**. Reproduce every informative sketch from the scan: diagrams, plotted curves, architectures, before/after pictures and annotated formulas. Add figures where a picture explains the mechanism better than text. Use arrows with labels generously: curved callout arrows from a label to the thing it names, as in the handwriting.

### Files

- One component per figure: `src/components/figures/<note-slug>/<PascalName>.astro`.
- Wrap each figure in the shared `Figure` component:

```astro
---
import Figure from '../Figure.astro';
import { plot, area, scale, curve, gaussian, sigmoid, normals, seeded, polyline } from '../geometry';
// compute coordinates here; generate curves from the real functions, never eyeball them
---
<Figure id="note-slug-short-name" title="Sentence-case title" caption="What to notice." origin="redrawn" pages="31">
  <svg class="fig-medium" viewBox="0 0 600 340" role="img" aria-labelledby="ID-t ID-d">
    <title id="ID-t">…</title>
    <desc id="ID-d">Full text description for screen readers.</desc>
    …
  </svg>
</Figure>
```

- `origin`: `redrawn` for a faithful redraw of a scan sketch, `expanded` for a sketch made more precise or informative, `illustrative` for a new figure. `pages` is the scan page(s).
- Every `id` inside SVG must be unique on the page. Prefix it with the figure id.
- Do **not** edit shared files: `global.css`, `Figure.astro`, `FigureDefs.astro`, `geometry.ts`, layouts, `courses.ts`. If you need something they lack, compute it inside your component or use inline SVG attributes with the CSS variables below.

### SVG vocabulary (defined in `global.css`)

| Purpose | Classes |
| --- | --- |
| Strokes | `f-line` (1.7px ink), `f-thin` (1.1px), `f-axis` (muted), `f-grid` (hairline) |
| Stroke modifiers | `f-blue`, `f-red`, `f-green`, `f-amber`, `f-muted`, `f-bold`, `f-dash`, `f-dot` |
| Boxes | `f-box` (paper fill, ink stroke), `f-box-soft` (tinted, hairline) |
| Fills | `f-fill-blue/red/green/amber` (16% tint), `f-solid-blue/red/green/muted`, `f-fill-ink`, `f-fill-paper` |
| Text | default 15px sans; `f-math` (serif italic 18px, for symbols), `f-label`, `f-title` (bold), `f-note` (muted 13.5px), `f-small` (12.5px), `f-upright` |
| Text colour | `f-t-blue`, `f-t-red`, `f-t-green`, `f-t-amber`, `f-t-muted` |
| Readability | `f-halo` adds a paper-coloured outline behind text that crosses lines |
| Arrowheads | `marker-end="url(#f-arrow)"`, also `#f-arrow-blue`, `#f-arrow-red`, `#f-arrow-green`, `#f-arrow-muted`. Use `marker-start` for double arrows |

Colour tokens available to inline attributes: `var(--ink)`, `var(--muted)`, `var(--line)`, `var(--paper)`, `var(--paper-strong)`, `var(--fig-blue)`, `var(--fig-red)`, `var(--fig-green)`, `var(--fig-amber)`. Never hard-code hex colours: figures must work in light **and** dark mode.

**Colour semantics, kept consistent across notes:**

- blue: the model, Q, the generator's distribution, or learned quantities;
- red: the data, P, “real”, or warnings and annotations the scan wrote in red;
- green: a third series, such as optimal or target values;
- amber: highlighted terms;
- ink: structure.

### Layout rules

- The content column is 720px wide. Choose a viewBox width of 480–680 and size text for it: labels 15px and math 18px at viewBox scale.
- `class="fig-compact"` caps the SVG at 480px and `fig-medium` at 600px. Use them for simple plots so the text does not balloon.
- Wide diagrams with many labels (pipelines, architectures) need a **narrow variant**: put two SVGs inside `Figure`, one with `class="fig-wide"` and one with `class="fig-narrow"`. The narrow one is vertically stacked with a viewBox width of about 360. The narrow variant appears when the figure is under 520px wide.
- Keep at least about 6px between text and lines. Nothing may overlap or be clipped.
- **Mathematical content must be computed:** densities, activation curves, schedules, Jacobian examples, KL values and so on. Use deterministic randomness (`normals(n, seed)`) for scatter plots.
- Symbols in SVG text use Unicode (μ σ Σ θ φ ε β ᾱ ∇ ‖ ∑ ∏ ∫ ≈ ≤ → ⊙ ⁻¹ ², x₀ x₁ xₜ). For subscripts without a Unicode character, use `<tspan dy="5" font-size="13">T</tspan><tspan dy="-5">…</tspan>`. Do not use `baseline-shift`.
- Use the handwritten annotations from the scan as labels, translated and cleaned up.

### Visual QA (required)

The dev server runs at `http://localhost:4400`. Do not start or stop it, and do not run `astro build` or `astro check`. The route `/figure-preview/generative-models/<slug>` renders only the figures of a note. Take screenshots with:

`$SHOOT` is a headless-Chrome screenshot script (`shoot.sh <slug> <out.png> [width] [light|dark] [height]`); its path is given in the task.

```bash
$SHOOT <slug> /tmp/<slug>-light.png 820 light 2400   # desktop, light
$SHOOT <slug> /tmp/<slug>-dark.png 820 dark 2400     # desktop, dark
$SHOOT <slug> /tmp/<slug>-narrow.png 500 light 3000  # narrowest window headless Chrome allows
```

Open the PNGs with the Read tool and inspect every figure. Increase the height argument if figures are cut off at the bottom, or split the check. Fix overlaps, clipping, illegible text, wrong arrows and curves that do not match their formula. Iterate until clean.

If the page returns 404 or a screenshot fails, first check `curl -s -o /dev/null -w '%{http_code}' http://localhost:4400/notes/generative-models/<slug>`. Another note being edited concurrently can briefly break the content collection. Wait a few seconds and retry. If the error is in your file, fix it.

## 5. Scope boundaries

Stay inside your assigned files. Other agents are writing other notes at the same time. Do not read or copy notes from any other branch or working copy. This transcription must be independent.
