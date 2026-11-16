# FP68 independent visual and capture review

Reviewer: sequence_peer. Date: 2026-11-16. Existing CI artifact head: `6f0d70db8d96c87819464fd949078d85f71d8f5e`. No local browser, build, installation or Actions invocation.

## Visual scope and findings

Visually inspected every `support-01.png` through `support-10.png`, plus `probability-central-limit-theorem-figure-1-390.png`, under `fp-pr68-browser/sheets`. Exact eleven file hashes are in `fp68-visual-second-viewed.json`. Support sheets cover narrow headers, pagination, text and horizontally scrolling table endpoints. The inspected heading words and pager content remain legible; table endpoints expose final columns. The joint-distributions eyebrow and continuous-distributions breadcrumb are tight against crop edges, but existing text-range geometry does not establish a new escaped-text defect. This is a bounded visual review, not full WCAG or screen-reader certification.

The CLT first figure has a skip-link pill over its first panel in all four 390px states. Its Russian legend also separates a dashed swatch from its label across lines; group each swatch with its label as one wrapping flex item. Root owns that figure correction. Numeric positions, axes and theme contrast otherwise look coherent in this sheet.

The original results record 48 views and two 320px overflow findings: RU estimators in light/dark. Recorded overflowing elements are hidden native MathML descendants of the shrinkage equation, reaching x=344.359375 from a 320px viewport. The other recorded narrow checks pass.

## Source diagnosis

Read the full capture script, BaseLayout, relevant global CSS, installed KaTeX MathML CSS, and the first CLT figure source. The skip link is fixed with a negative top offset, revealed by focus. Neither the script nor layout proves it was focused during the original crop. A tall element screenshot can capture fixed off-viewport content; therefore the overlay is a capture-artifact hypothesis, not a demonstrated keyboard-focus bug. The corrective capture now records focus and computed positioning before each isolated screenshot so this distinction is inspectable.

Root's CSS change adds only `position: relative` to the existing scrollable `.prose .katex-display`. Source review supports it: it contains absolutely positioned accessible MathML within the equation's existing clipping/scroll boundary. It keeps semantic nodes and does not use display:none, aria-hidden, or global page overflow hiding. This conclusion is source inference; actual 320px behavior awaits corrective CI. A future same-job semantic-node presence check can supplement geometry, but does not replace assistive-technology testing.

## Authorized script correction

Only `scripts/check-renewal-browser.mjs` was edited by this reviewer. Isolated header, pager, figure, caption and table crops temporarily hide `.site-header` and `.skip-link`; full-page/top screenshots retain the real UI. Each isolated capture records activeElement, skip-link focus/focus-visible, computed top and bounds before suppression. Keyboard behavior is checked once for each available locale/theme at 390px: Tab must visibly focus the link inside the viewport; Enter must navigate to #content; the next Tab must focus an element within main. Focus and scroll are then reset without an additional navigation. Existing route selection, math, fonts, overflow, heading, caption, table scrolling and artifact gates remain intact. No new workflow or job was introduced.

Final script SHA256: `1f00b1fb6e702c30bd2ff42a036cbc76392ac852c42bc9ed94e18fd83b720ba1`.
Reviewed global CSS SHA256: `c10428b5fa2259f8dc9980d83baa6a36094a11263610e49b5032c4c6d0aa9c84`.

Validation: `node --check scripts/check-renewal-browser.mjs`, `git diff --check -- scripts/check-renewal-browser.mjs`, and the five existing lightweight browser-route selector tests all pass. The new keyboard/capture runtime assertions have not been run locally and must pass in the existing corrective browser CI. No source-rights clearance or publication claim follows from this visual/script review.
