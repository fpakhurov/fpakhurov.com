# FP68 hosted figure and caption peer

Reviewed hosted head `6f0d70db8d96c87819464fd949078d85f71d8f5e` against the exact artifact files pinned in coverage.json. Personally inspected all 13 phone figure sheets (52 images), all 8 probability desktop sheets (32 images), and all 7 caption sheets (26 closeups): 110 originals. NLP desktop and support-sheet coverage belongs to the other named reviewers, not this report.

All probability axes, labels, curves, tables, panel spacing and dedicated captions are readable in both locales/themes. LLN Monte Carlo tick margins and estimator sampling-distribution vertical spacing remain corrected. No new mathematical or numerical figure finding arose. Dedicated caption captures show full final lines; the cropped lower lines in tall full-figure screenshots are a capture boundary, not source clipping.

Bounded findings sent to coordinator: keep CLT legend swatch-label pairs together; replace MLE caption left/right with first/second panel; diagnose the skip link visible over the CLT phone crop. No keyboard-focus assertion existed in this capture, so the initial focus hypothesis was unproven. Source review by sequence_peer points instead to the fixed top:-5rem hidden link entering an oversized captureBeyondViewport region. Corrected capture will record focus/top geometry, hide the link only in the isolated crop, and add an actual keyboard assertion. Do not disable the skip link in the product.

The saved results have no overflow at390/1440, no KaTeX or font errors, and only RU estimators320 fails in both themes via hidden absolute MathML descendants. Installed KaTeX CSS and CSS2 overflow-clipping rules support the diagnosis: absolute descendants can escape an intervening clip when their containing block is outside it. The reviewed one-property `.prose .katex-display { position: relative }` change makes the existing display scroller the containing block. It preserves MathML, overflow assertions and normal-flow visible layout. This is source approval; the corrective hosted320 run is still required.

No source/candidate edits, browser, build, install or Actions operation was performed by this reviewer. Contact sheets were generated serially with installed Sharp, concurrency1/cache disabled and a192MiB Node heap.

## Bounded correction source closure

Read back the three exact current source changes pinned in source-correction-closure.json. CLT now groups each nonshrinking decorative swatch with its label in inline-flex/nowrap; the two pairs can wrap between groups. MLE uses first/second panel in both locales. Data, mathematical expressions, axes and curve coordinates are unchanged. These close the requested source deltas; fresh hosted screenshots and320 overflow checks remain coordinator gates.
