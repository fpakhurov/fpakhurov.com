# Incidents and operational security: replacement review

2026-11-13. Entire EN/RU bodies and old IncidentTimeline replaced; curriculum IDs, prerequisites and17public anchors preserved. The new case, data, verification script and policy-only exercise are original project work with Codex assistance.

## Evidence

- Standard-library script constructs a new fictional permission-removal incident with changing traffic; it does not ingest an external incident or the former checkout example.
- Request counters:4×200 +7×400 +7×300 =5700attempts;4×50 +7×20 =340failures; affected11minutes contain3600attempts. Distinct-user and data-loss claims are explicitly excluded.
- Separately stipulated14day accounting period:500000attempts, only340bad,99.5%objective,2500budget,13.6%spent,99.932%success.
- Detection2min, acknowledgement1min after alert, mitigation11min from onset, verification7complete minute buckets. The probe's alert time is an input, not an asserted burn-rule prediction.
- Original toil estimate:70minutes/week manual less10minutes/week maintenance =1hour/week;9hours setup pays back at9weeks,26week net17hours. No empirical productivity claim.
- Actual Git execution creates and deletes only a fake token in an isolated temporary repository. All inheritedGIT_* environment overrides are removed, global/system config disabled, signing disabled and hooks path empty. No network or real secret used.
- Six policy-only cases operate on a hypothetical verified receipt. Notes explicitly exclude cryptographic verification and production deployment; arbitrary JSON is not authenticated evidence.

## Independent review

`takedown_routing` read both whole notes, script and figure, replayed make_results without overwriting artifacts and compared it with both saved JSONs. It independently checked every displayed result, equations/output parity and17anchors. Live primary checks supported Kubernetes, Sigstore and SLSA statements; SRE concept credit remains without copied incident/template. Its isolation hardening suggestion was implemented and re-executed.

`course_licenses` independently read both whole notes, figure and script, re-executed all cases, compared saved artifacts and checked the named primary sources. It found no remaining material, mathematical, parity or security-claim blocker. Two independent reviews are complete. Final browser/build/release validation is recorded separately; inventory coverage alone is never approval.
