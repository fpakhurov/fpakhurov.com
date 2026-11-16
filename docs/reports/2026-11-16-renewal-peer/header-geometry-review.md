# Narrow header geometry follow-up review

2026-11-16. Codex sequence_peer. Read complete scripts/check-renewal-browser.mjs and the diff of fbb8dc973193324e20b9532261ad2c10284ee757 in the FP release checkout. PASS for this bounded diagnostic change.

The changed-note route selector and existing 390/1440 light/dark page, math, font, held-link, heading and figure/table gates are preserved. Changed localized notes add a320px text-range check across their entire note header, with1.5px horizontal tolerance, plus page-overflow reporting. The viewport returns to390 before the existing figure/table screenshots. Additional joint/continuous routes are checked only at320 for header geometry in both locales, with RU crops, and are skipped if already in the changed route set. Prior route response checks remain explicit.

New geometry failures accumulate before the final assertion. The finally block persists results, supplemental routes and failure diagnostics even on failure, then closes browser/server. The change does not add a workflow, build, publication path or CSS patch. It uses the existing browser job and leaves its other assertions intact. A failure in an older prerequisite assertion can still stop early; no claim is made that every possible existing gate failure is aggregated. Geometry findings in EN have numeric diagnostics while RU has the dedicated crop, consistent with the existing screenshot policy.

Read-only review only. Parent already reports syntax and five selector unit tests passed; I did not rerun them or launch a browser/build/CI. No source-side CSS change is justified before the first integrated artifact provides actual geometry evidence.
