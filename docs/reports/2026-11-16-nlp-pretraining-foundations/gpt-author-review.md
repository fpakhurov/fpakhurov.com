# GPT foundations complete author review

Date: 2026-11-16. Reviewer: Codex pretraining_author for Fedor Pakhurov project, with AI assistance accurately recorded. Full scoped author review complete; two independent peers, integration gates, browser review and publication remain pending.

Replaced both complete note bodies from independently checked primary references. Only curriculum metadata and stable anchor identity were consulted from the withdrawn version. The existing title/course/section/order/status/tags/prerequisites and 13 anchor IDs are preserved; the former Notebook anchor now labels a self-contained Code section. No withdrawn notebook, dataset, phrase, example or measured output was consulted or carried over.

Reviewed the chain-rule objective, scored-token denominator, shifted targets, causal non-leakage across layers, tied output shapes, recurrent-versus-parallel-training distinction, exact biased-linear/normalization parameter counts, positive-temperature and threshold-crossing nucleus definitions, cache payload assumptions, and speculative correction guarantee. Historical observations are limited to the checked GPT reports; there is no claim about undisclosed later GPT architecture or a trained model's performance.

Original cases: three newly composed command documents with 12 transitions; MLE bigram training NLL 0.31825708414740644 and perplexity 1.3747296369986026; hypothetical decoder counts 446/834; explicit four weights and correct nucleus renormalization; identity-projection causal attention and equality of full/cached last output; standard-MHA payload of 256 bytes in a deliberately tiny configuration. Exact fresh stdout is gpt-results.json. Finite checks support only these examples, not benchmark or deployment performance.

Both full language bodies were authored and checked together. Fresh serial Node with a 192 MiB heap cap passed strict MDX/GFM/KaTeX, 55 identical paired math spans/8 displays/13 stable headings/one table, identical executable code and two exact saved inline outputs. Python 3.9.7 fixture replay is byte-identical. All new content is text, math, an original inline table, code and outputs; there are no figure/image/model/corpus/notebook assets or remote runtime downloads.

Primary selected passages were read from official GPT-1/GPT-2 reports, GPT-3 v4, Holtzman v2, and Leviathan ICML paper Algorithm 1/Appendix A.1. Full pinned GPT-2 model/sample code, README and Modified MIT license were read for reference. The archived sampler is not the implementation basis for the original nucleus calculation. Exact primary snapshots and hashes are in gpt-source-evidence.json; cached originals remain outside release. No library/repository/paper license is asserted to clear weights, data or generated outputs.

No local full build, browser, CI, production, full-course audit or legal certification is claimed. Public restoration must await the independent peer and publication pipeline; BIASED must wait for the published, live-verified FP revision.

Parent review fixes: cache worked example now states all three input rows, identity projections, score scaling and perturbed last row; cache width is explicit separately for keys and values. Removed the optional GQA sentence to keep source scope bounded. Fresh paired checks rerun after these changes.
