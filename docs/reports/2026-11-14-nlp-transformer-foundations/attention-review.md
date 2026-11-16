# attention: complete candidate review

Reviewed 2026-11-14 by Codex xufana_scope. This outside-served candidate has complete author review and two independent scoped reviews. Coordinator actual-page and publication checks remain pending. It is not a published BIASED source and is not an all-course rights determination.

## Material and clean-input boundary

Content-dependent Q/K/V retrieval, full backward paths, masks, scaling conditions, equivariance, multi-head composition and cost.

Both complete English and Russian bodies were newly authored for the Fedor Pakhurov project with Codex assistance. Only existing topic identity, prerequisites and heading metadata were retained from revision cd446dc8d2f68249eb62ff3598b202d8d5854315. Old descriptions and dataset tags were discarded before authoring. No withdrawn body, notebook, prose, code, figure, input data, query, example or output was used as rewriting input. No exclusive copyright guarantee is asserted.

No inherited attention figure, head visualization or notebook remains; all table values come from the new script. The old heading IDs remain only as stable navigation metadata.

## Claims and reproducible calculations

New 3x2 states and three independently chosen 2x2 projections give first output (0.790241025005,-0.409522656183) and half-sum-square loss 1.35204778003927. All 18 input/projection derivatives are checked by centered differences, maximum errors 2.11e-10 unmasked and 3.78e-10 causal. One simultaneous step 0.02 lowers loss to 1.10961488996158. Changing the final input changes the first unmasked output but leaves its causal counterpart exactly unchanged. The permutation [2,0,1] reorders unmasked outputs to 1.11e-16. Empty allowed-key sets fail explicitly; forbidden large logits never enter the softmax maximum. Exhaustive independent-sign enumeration yields dot-product variance4 versus16 for perfectly shared coordinates. Independent two-head projections/concatenation/output projection, hypothetical144 weights/24 biases and150 score entries are all saved.

The arrays are mathematical inputs, not embeddings from the motivating message. No trained-model attention visualization or external corpus is used. Equivariance excludes an unchanged causal mask. Variance scaling states its independence assumptions. Attention weights alone are not represented as causal explanations.

The shared standard-library script records all explicit arrays, labels, intermediate values and diagnostic results in results.json. A fresh Python3.9.7 run is byte-identical to the saved JSON. Floating-point last digits can differ in another interpreter/environment; this is not an external-model or hosted-notebook run. The author check uses numerical differentiation of independently implemented forward losses as a sanity check; the separate independent peer calculations below have also passed.

## Recorded sources

- Attention Is All You Need. https://arxiv.org/abs/1706.03762v7. Checked: Sections 3.1-3.5, section 4 and section 5.4 selected primary paragraphs freshly read 2026-11-14; no figures or empirical tables reused. Use: reference only. Paper perpetual arXiv license and special restricted figure/table grant are not default commercial teaching reuse permission. Scientific mechanisms only; original numerical cases/derivations.
- PyTorch normalization, Transformer and attention contracts. https://github.com/pytorch/pytorch/tree/1d8e8560dc4c9182cba96c81c36e096fc2a063c1. Checked: normalization.py LayerNorm lines98-149 and RMSNorm lines348-390; transformer.py boolean-mask paragraph lines196-202 and norm_first branches lines944-958; functional.py scaled_dot_product_attention mask semantics lines6531-6541 and6590-6604; selected file headers, root LICENSE and NOTICE. Use: reference only. Root BSD-3-Clause grant and separate historical/third-party NOTICE read; the 23866-entry nontruncated tree has only root LICENSE/NOTICE on selected ancestors. Selected file headers contain no license override. Mathematical/API contracts referenced only. Neither implementation/docstrings/example arrays nor historical third-party components are redistributed. Root library permission is not clearance for separate datasets, models or other teaching assets.

Exact primary code revisions, SHA256 and Git-blob identities, ancestor-license findings, author names and scope decisions are in source-evidence.json. PyTorch and Google BERT source files are privately cached review inputs, excluded from this release manifest. No upstream implementation or docstring is adapted. The scientific papers are credited factual references, not grants to reproduce their expression. New examples and explanatory text are original work for the project; no citation was simply removed to relabel an old example.

## Bilingual and asset closure

The EN/RU pair has 20 identical retained anchors and 40 literal matching math spans, including 9 display formulas. Both versions contain 1 original tables. Both full narratives were author-reviewed for definitions, assumptions, limitations, parameter distinctions and numerical values. The scoped checker compiles real MDX with GFM, heading IDs and strict KaTeX; all ten candidates pass. Batch-local anchor targets are checked separately from the pending full-site link check.

No external figure, image, screenshot, audio, dataset, model weights, tokenizer asset or notebook is imported. There are no copied third-party teaching assets requiring new distribution notices in this candidate. The unchanged first-party heading helper is a verifier dependency, explicitly pinned; existing installed MDX/KaTeX runtime packages remain application dependencies, not learner-facing copied teaching content.

## Review and release limits

Both independent scoped reviews passed; no browser, full-site build, CI, restoration or production validation is claimed here. The coordinator must run rights:test, rights:check, normal build/content/links and actual-page checks before atomically restoring publication holds. After publication BIASED must use exact published note/review hashes, not this draft package. Other course topics and unresolved historic assets remain outside this complete five-topic candidate review.

## Independent coordinator review

Codex root read all ten full EN/RU bodies, the complete 338-line fixture, scoped checker, helper, source evidence and reports. Fresh 192 MiB checks passed ten MDX notes, 76 anchors, 140 paired math spans, 33 displays and ten tables per locale, and exact Python3.9.7 stdout. A separate no-author-import scalar/complex-step oracle compared265 quantities (maximum gap3.56e-15), including36 attention derivatives, both norm placements, six normalization derivatives, complete independently coded500/600-step head fits and48 endpoint head derivatives, positional rotations, MT losses and exact selection/search arithmetic. Ten cached source files matched SHA256/Git blobs. Selected primary passages across Vaswani/Ba/Zhang-Sennrich/Su/Devlin and selected implementation contracts/licenses were freshly checked; root did not claim a full NOTICE, whole-tree or universal source audit. Full review: durable transformer-root-peer.md in renewal-verification. All coordinated terminology, row-vector, formatting, RMS evidence and held-GPT handoff corrections were read back. No remaining scoped finding; browser/build/CI/publication remain separate.

## Separate independent topical review

Codex takedown_routing independently read all six complete attention/transformers/BERT bodies, shared fixture/checker/helper, three reports/records and source evidence. Thirty record entries matched; fresh shared checker and Python3.9.7 stdout passed. A separately coded scalar/complex-step oracle checked90 derivative coordinates, all343 nonempty three-row masks, all six permutations, sign variances4/16, two heads, pre/post blocks, LN/RMS and both complete classifier-training trajectories using a different parameter order; maximum discrepancy below2e-15. Exact counts/corruption/loss-mask arithmetic passed. Selected four primary papers and exact BERT/PyTorch contracts/licenses were read; ten cached SHA/blob matches and four fresh remote hashes matched. Row-vector convention, RU tying wording and RMS epsilon attribution findings were corrected and read back. Durable complete scope: transformer-three-peer/peer-review.md. No new exhaustive remote-tree/full-source audit, browser/build/CI/production or whole-course clearance claimed.
