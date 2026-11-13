# NLP sequence replacement: attention-before-transformers

Reviewed: 2026-11-14. Complete author pass by Codex xufana_scope. Independent scoped peer review passed; coordinator release checks remain pending. This is an outside-served candidate, not a published source for BIASED.

## Material boundary

Both complete EN/RU bodies are new. The preserved curriculum ID, prerequisites, section/order and 12 heading anchors came only from structural metadata. Source-specific old heading identifiers remain compatibility anchors with new visible titles. Prior descriptions and benchmark tags were removed before drafting. Withdrawn prose, notebooks, data, examples, results and figures were not used as rewrite input; no citation was merely removed while retaining a derivative. The code, input strings/vectors/labels and all numerical outputs are newly specified for this project with Codex assistance. This authorship statement does not promise exclusive copyright.

## Technical verification

Chosen query(.6,-.2), three 2D states yield dot weights .440905498395/.198111610867/.360982890737 and context(.801888389133,.559094501605). Independent additive score coefficients give recorded alternative weights. Invalid score99 is excluded exactly; all-false mask explicitly rejected. Squared context loss .193790346707 has analytic softmax, query and both key/value state paths; all 8 derivative coordinates checked by centered differences (max error 5.4e-12). Exact rational four-vector example yields same(.5,.5)context under two different positive weights, without claiming one fixed scorer produces both.

Fresh execution in Python3.9.7 reproduces the saved JSON byte for byte. All10 bilingual files compile through MDX plus strict KaTeX serially under a 256 MiB Node heap cap. This topic has 53 exactly matching EN/RU math spans and identical heading IDs. Both RNN inline Python blocks execute and match their displayed stdout. Full source text and translations were read during the author pass; prose is self-contained, with mechanism, derivation, worked outcomes and limits. No training-quality score is transplanted from another example.

## Sources actually used

- Dzmitry Bahdanau; Kyunghyun Cho; Yoshua Bengio. [Neural Machine Translation by Jointly Learning to Align and Translate](https://arxiv.org/abs/1409.0473v7). Revision: ICLR 2015; arXiv version 7, 2016. Checked scope: Sections 3.1-3.2 and appendix A.1.2; selected decoder equations in A.2.2. Use: reference only. Read the named primary passages for scientific definitions and mechanism only. No source prose, figure, code, input strings, dataset, weights or empirical result is reproduced or translated. New independently specified numerical cases and derivations support the explanation. Public access is not treated as reuse permission. No paper alignment, sentence pair, ablation or Transformer result is retained. New coefficients and isolated squared-error gradient objective are explicitly not that trained model.

- Minh-Thang Luong; Hieu Pham; Christopher D. Manning. [Effective Approaches to Attention-based Neural Machine Translation](https://aclanthology.org/D15-1166/). Revision: EMNLP 2015, D15-1166. Checked scope: Sections 2 and 3.1, current-state global attention and dot/general/concat scores. Use: reference only. Read the named primary passages for scientific definitions and mechanism only. No source prose, figure, code, input strings, dataset, weights or empirical result is reproduced or translated. New independently specified numerical cases and derivations support the explanation. Public access is not treated as reuse permission.

## Assets and notices

No external corpus, image, diagram, audio, model, pretrained embedding, dataset or notebook is included or fetched. Tables are newly authored from the recorded fixture. The standalone Python uses the standard library and is independently implemented; it does not translate a framework implementation. The existing first-party heading helper is included unchanged as a verifier dependency, with its own exact hash. Existing application dependencies remain under their separate operational notices.

The PyTorch source selection was checked per file: the pinned root BSD-3-Clause license and full NOTICE were read, selected ancestor license paths inspected using a nontruncated tree, and four remote blobs freshly hash-verified. Its NOTICE contains historical Caffe/Caffe2 and separately scoped third-party terms; this is not blanket clearance for those assets. The files support mathematical/API references only. No new redistribution of those implementations or documentation expression occurs. Scientific paper citations are not reuse grants; no paper figure, distinctive example, result table, wording or code is imported. Historical LSTM abstract-only coverage is explicitly limited in the evidence record.

## Limits and release status

This complete author review concerns the exact listed files and stated use. It is not legal certification, paper-wide permission or clearance for other course topics. Strict parsing, source hashes and arithmetic checks do not prove ownership. The canonical served paths remain withdrawn until the coordinator atomically restores the reviewed package and hold metadata. No browser, full-site build, CI, deployment or production check is claimed here. The coordinator must run rights:check, normal checks and actual-page review before publication; BIASED must use the eventual published revision.

## Independent peer review

Codex takedown_routing independently read all ten complete EN/RU bodies, the fixture, checker and helper, five reports and review records. Its fresh check passed 10 MDX files, 64 anchors, 221 identical bilingual math spans and two inline executions; Python 3.9.7 stdout matched exactly. A separate oracle evaluated 55 complex-step derivatives (maximum gap 1.12e-16), independently fitted the two-row CNN head, recomputed decoder states and NLL with 50-digit Decimal arithmetic, and checked GRU/search/BLEU/count/finite-capacity calculations with exact arithmetic. Selected primary passages and four pinned PyTorch blobs were checked; historical LSTM/Gers coverage remained abstract/metadata only. Three findings were corrected and read back: RNN recoverability qualification, Russian complementary-gate wording, and the Kim channel-section locator. No remaining scoped blocker was found.

The exact bounded evidence and independent numerical implementation are preserved in [the peer report](nlp-sequence-peer/peer-review.md). The packaged oracle changes only the absolute draft-root path to a portable repository-relative path; fresh author replay reproduces the peer JSON exactly. The peer did not perform browser, full-site build, CI, publication, withdrawn-body comparison or exhaustive originality searches. Its selected-source comparison does not replace the recorded author review or establish a blanket rights guarantee.
