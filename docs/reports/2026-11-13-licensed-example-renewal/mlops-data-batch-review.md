# MLOps renewal: pipeline and data-quality pair

Reviewed 2026-11-13. Scope is `data-pipelines` and `data-quality-and-versioning`, both English and Russian, their complete new bodies, inline code and original shared fixture. The next six MLOps topics and the remaining systems courses are not approved by this record.

## Substantive change

Both full teaching bodies have been replaced by newly authored preview-service cases. Existing curriculum frontmatter, prerequisites, order and explicit section anchors are preserved. The new English bodies contain approximately 2,217 and 2,025 words before frontmatter; the corresponding Russian bodies explain the same processes and limitations. The old long practical listings and book/course-specific illustrations are not retained under a shortened bibliography.

The cases were authored for Fedor Pakhurov's project with Codex assistance during this task. This does not claim that the user personally supplied the values. Primary documentation is used for specific API/mechanism references; its examples, schemas, screenshots and source code are not reproduced. Per-source scope is recorded in the two complete records:

- `content-rights/reviews/mlops-data-pipelines-renewal.json`
- `content-rights/reviews/mlops-data-quality-and-versioning-renewal.json`

### Data pipelines

An original five-delivery log has distinct event and observation hours. Cutoff 30 contains one day-zero event; cutoff 36 contains two. One event is a repeated delivery and contributes no extra card. A conflicting payload for the same ID fails rather than silently changing meaning. Reversing the input list preserves the selected snapshot after the specified ordering step.

The fixture actually creates temporary files, verifies that the old destination remains readable while a revised file is staged, calls same-filesystem `os.replace`, then repeats publication and verifies identical bytes. It does not claim crash durability, cross-file atomicity or a distributed transaction. The note explicitly separates successful atomic rename from those properties.

The original maximum-event-hour-minus-four watermark heuristic marks e2 and the duplicated e1 as late; it is not presented as Beam's implementation. The text explains why an early window result needs revision semantics, why allowed lateness differs from a wall-clock sleep, and how a label's availability differs from feature availability. Backfill, retries, publication coordination and resource limits are developed through the same case.

### Data quality and versioning

Eight original rows produce five rejected rows and six reasons. Both rows sharing c07 are rejected; one of them also has an unsupported format. The publication gate rejects the batch rather than silently filtering it. The text distinguishes record checks, batch relationships, schema inference and reviewed requirements.

A separate fictional format-count calculation uses a fixed PNG probability 0.75 and 40 independent trials with 20 observed PNG records. Its L-infinity discrepancy is 0.25. The independently calculated one-sided probability is approximately 0.000572431107176; the text states the fixed-reference, independent-record and predeclared-direction assumptions, and does not turn a discrepancy into a universal p-value or product-quality conclusion.

A standalone inline SHA-256 example demonstrates that sorted unique-ID JSON normalizes row order but detects a change from 0.8 to 0.81. It does not claim general semantic canonicalization or anonymization. The discussion connects immutable content to parser/schema/validator revision, observation cutoff and lineage.

## Direct assets and dependencies

Removed after scanning for remaining imports:

- `src/components/figures/data-pipelines/PipelineDag.astro`
- `src/components/figures/data-quality-and-versioning/ValidationGates.astro`

Replacement notes import no teaching component or image. Mechanism tables and mathematics are authored in the notes. Exact bytes of `scripts/notes/mlops-data-cases.py` and `docs/reports/2026-11-13-licensed-example-renewal/mlops-data-results.json` are covered by both full records. The program uses only the Python standard library and temporary local files. No external dataset, model, production record or service connection is used.

Unchanged shared site rendering is outside this topic review. General software notices remain the responsibility of the separate runtime/assets audit.

## Primary evidence

Read official Airflow 3.4.0 backfill semantics, Beam watermarks/late data/event-time triggers, Python 3.15.2 `os.replace`, Dagster 1.13.30 asset abstraction, Prefect v3 flow/task description, TFDV statistics/schema/drift-skew sections, DVC internal cache description, lakeFS commits/branches/concurrency description, and Python JSON/hashlib API definitions. Current documentation was observed on 2026-11-13; only the explicitly cited concepts were used. No repository-wide software license was treated as clearance for an external dataset or diagram.

The documentation excerpts are not bundled with the site. The notes use independently written explanations and code, so the source records classify them as `reference`, alongside `original` entries for the new material. This does not authorize later copying of documentation assets under the same record.

## Executed verification

1. `python3 scripts/notes/mlops-data-cases.py --output docs/reports/2026-11-13-licensed-example-renewal/mlops-data-results.json` completed and saved actual outputs.
2. The canonical-hash inline Python blocks are byte-identical between locales and execute to the three displayed hash prefixes. Every mathematical span in each pair matches.
3. All existing explicit anchors remain. Final four MDX bodies compiled using `@mdx-js/mdx`, local heading processing, `remarkMath` and strict `rehypeKatex`.
4. Source imports were scanned before retiring the two unused components. No replacement imports their helpers indirectly.

No full build, browser inspection, deployed scheduler, real dataset validation or production performance check is claimed. Independent coordinator review and final integrated source gate/build remain publication steps.

## Independent adversarial review follow-up

Peer inspection found that the first implementation checked duplicate event payloads after selecting a day. A conflicting event ID crossing day partitions could therefore escape detection. The selector now deduplicates all deliveries visible at the observation cutoff before partition selection; same-day and cross-day conflict assertions exercise both requested days. A future conflict remains invisible before its observed timestamp.

The validator now checks nonempty string IDs, handles omitted fields with per-row reasons, excludes Boolean contrast as well as Boolean width, rejects nonfinite/out-of-range values, and reports non-dictionary records without terminating the batch. Focused adversarial assertions exercise those cases, including unhashable IDs and very large integers. Both locale contracts now state that boundary explicitly. These are fixes prompted by independent inspection, not claims about a production validation system.

After the fixes, a fresh execution reproduces the original saved teaching JSON byte for byte. Both per-topic records have updated source/body hashes. Independent peer recheck passed after the fixes: complete EN/RU/data/code read, byte-identical fresh replay, both-order and inclusive-cutoff cross-partition conflict tests, schema adversarial cases, and an independent exact-Fraction binomial calculation. No remaining blocker was found within that technical/data/bilingual scope; it is not a separate all-course rights approval.
