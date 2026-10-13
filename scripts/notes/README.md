# Note tooling

Helpers used when writing, reviewing and translating course notes (see `docs/course-writing.md` and `docs/glossary-ru.md`). They need Python 3 and, for the page checks and screenshots, the dev server on http://localhost:4400 (`npx astro dev --port 4400`).

- `ru_parity.py <course> <slug>`: compares an English note with its Russian translation: display and inline math (words inside `\text{}` may differ), figures in the same order, code apart from comments.
- `page_check.py <course> <slug> [en|ru]`: checks a rendered note on the dev server: heading ids equal across languages, KaTeX errors, duplicate ids, in-page anchors, links and anchors to other notes, leftover Latin words in Russian prose.
- `figshots.py <course> <slug> [en|ru]`: screenshots every figure of a note at wide light, wide dark and narrow widths into `scripts/notes/shots/` (git-ignored). Inspect, then delete.
- `loc_figure.py <file.astro> <pairs.json>`: adds the page-language switch to a figure and replaces strings with `ru ? '…' : '…'`.
