# NLP source review, 2026-11-13

The previous course mixed independently explained theory with source-notebook runs and examples. Removing a citation cannot establish independence. The affected note bodies, descriptions, imported examples and results have therefore been removed from current source and set to `needs-review` in both locales. They are excluded from published route generation. No statement here certifies licensing of the remaining courses.

The original semantic-search material was replaced in both locales with a newly authored fictional retrieval corpus and a reproducible standard-library baseline. The new text has no imported legacy figures, notebook-cell narrative, old dataset or benchmark results. Its primary references explain BM25 and learned retrieval; no third-party course text or implementation was copied. Downloads are in `public/data/biased-retrieval-lab-v1` and include provenance and a rights statement.

The previous AG News accuracy claim in `ml/logistic-regression` and its Russian translation was also removed. This cross-course claim came from the withdrawn NLP example. Other numeric coincidences in unrelated probability and agent examples were not treated as evidence of derivation.

## Per-topic disposition

| Topic | Action | Source evidence / remaining review |
| --- | --- | --- |
| `attention-before-transformers` | withdrawn-pending-source-review | `week04_lstm_attention_transformer.ipynb` |
| `attention` | withdrawn-pending-source-review | `week04_lstm_attention_transformer.ipynb`; `week05_transformer.ipynb` |
| `bag-of-words-and-tf-idf` | withdrawn-pending-source-review | `week01_word_embeddings.ipynb` |
| `bert` | withdrawn-pending-source-review | `week06_BERT.ipynb` |
| `cnn-text-classification` | withdrawn-pending-source-review | `week02_NN_text_classification.ipynb` |
| `corpora-and-evaluation` | withdrawn-pending-source-review | `week01_word_embeddings.ipynb`; `week04_lstm_attention_transformer.ipynb`; `week06_BERT.ipynb`; `week07_nlp_tasks.ipynb` |
| `efficient-transformers` | withdrawn-pending-source-review | No direct disputed-repository citation; withheld because independence of this connected course narrative has not been established. |
| `evolution-of-pretrained-models` | withdrawn-pending-source-review | No direct disputed-repository citation; withheld because independence of this connected course narrative has not been established. |
| `fasttext` | withdrawn-pending-source-review | `data` |
| `fine-tuning` | withdrawn-pending-source-review | `week10_PEFT.ipynb` |
| `glove` | withdrawn-pending-source-review | `week01_word_embeddings.ipynb` |
| `gpt` | withdrawn-pending-source-review | `week08_modern_LLM.ipynb`; `week10_PEFT.ipynb`; `week11_pt0_Decoding_and_Sampling.ipynb` |
| `instruction-tuning` | withdrawn-pending-source-review | `week08_modern_LLM.ipynb` |
| `llm-evaluation` | withdrawn-pending-source-review | `week09_RAG.ipynb`; `week11_pt1_Evaluation_with_Harness.ipynb`; `week11_pt2_LLM_as_a_Judge.ipynb` |
| `lstm-and-gru` | withdrawn-pending-source-review | `week02_NN_text_classification.ipynb`; `week04_lstm_attention_transformer.ipynb` |
| `model-families` | withdrawn-pending-source-review | `hse_seminar_7_part_2_summ.ipynb`; `week06_BERT.ipynb`; `week08_modern_LLM.ipynb` |
| `n-gram-language-models` | withdrawn-pending-source-review | `week03_lm.ipynb` |
| `named-entity-recognition` | withdrawn-pending-source-review | `week07_nlp_tasks.ipynb` |
| `natural-language-processing` | withdrawn-pending-source-review | No direct disputed-repository citation; withheld because independence of this connected course narrative has not been established. |
| `peft` | withdrawn-pending-source-review | `week10_PEFT.ipynb`; `week12_pt0_Torch_and_ONNX_Quantization_+_PEFT.ipynb`; `week12_pt1_Distillation_and_GPTQ_Quantization.ipynb` |
| `positional-encoding` | withdrawn-pending-source-review | `week04_lstm_attention_transformer.ipynb`; `week05_transformer.ipynb`; `week08_modern_LLM.ipynb` |
| `pretraining-data` | withdrawn-pending-source-review | No direct disputed-repository citation; withheld because independence of this connected course narrative has not been established. |
| `quantization` | withdrawn-pending-source-review | `week12_pt0_Torch_and_ONNX_Quantization_+_PEFT.ipynb`; `week12_pt1_Distillation_and_GPTQ_Quantization.ipynb` |
| `question-answering` | withdrawn-pending-source-review | `week07_nlp_tasks.ipynb` |
| `rag` | withdrawn-pending-source-review | `week09_RAG.ipynb` |
| `recurrent-networks` | withdrawn-pending-source-review | `week02_NN_text_classification.ipynb`; `week03_lm.ipynb` |
| `scaling-laws` | withdrawn-pending-source-review | No direct disputed-repository citation; withheld because independence of this connected course narrative has not been established. |
| `semantic-search` | rewrite-original-lab | `week09_RAG.ipynb` |
| `sentence-similarity` | withdrawn-pending-source-review | `week01_word_embeddings.ipynb` |
| `seq2seq` | withdrawn-pending-source-review | `week04_lstm_attention_transformer.ipynb` |
| `summarization` | withdrawn-pending-source-review | `hse_seminar_7_part_2_summ.ipynb`; `week07_nlp_tasks.ipynb` |
| `text-as-data` | withdrawn-pending-source-review | `week01_word_embeddings.ipynb` |
| `text-classification` | withdrawn-pending-source-review | `week09_RAG.ipynb` |
| `text-diffusion` | withdrawn-pending-source-review | `hse_seminar_14_agents_and_diffusion.ipynb` |
| `tokenization` | withdrawn-pending-source-review | `week03_lm.ipynb`; `week04_lstm_attention_transformer.ipynb`; `week05_transformer.ipynb`; `week07_nlp_tasks.ipynb` |
| `tools-and-agents` | withdrawn-pending-source-review | `hse_seminar_14_agents_and_diffusion.ipynb` |
| `transfer-learning` | withdrawn-pending-source-review | `week06_BERT.ipynb` |
| `transformer-machine-translation` | withdrawn-pending-source-review | `week04_lstm_attention_transformer.ipynb` |
| `transformers` | withdrawn-pending-source-review | `week04_lstm_attention_transformer.ipynb`; `week05_transformer.ipynb` |
| `word-embeddings` | withdrawn-pending-source-review | `week01_word_embeddings.ipynb` |
| `word2vec` | withdrawn-pending-source-review | `week01_word_embeddings.ipynb`; `week02_NN_text_classification.ipynb` |

## Separate MLOps source review

The following notes reference `xufana/llm-system-engineering` (2026), a different source from the 2025 NLP notebooks. The follow-up audit identified explicit adaptation of a template in `ml-system-design` and of a five-step procedure in `cost-and-efficiency`. Both note bodies, imported figures and practice invitations have been removed, and both locales are held as `needs-review`. This is a precaution pending rights review, not a finding of infringement.

| Topic | Action | Evidence / remaining review |
| --- | --- | --- |
| `ml-system-design` | Withdrawn pending rights review | The note explicitly followed the source's design-document template. |
| `cost-and-efficiency` | Withdrawn pending rights review | The note explicitly framed a procedure from the source. |
| `what-mlops-is` | Available; review pending | Citation found; no clearance claim. |
| `serving-models` | Available; review pending | Citation found; no clearance claim. |
| `testing-ml-systems` | Available; review pending | Citation found; no clearance claim. |
| `monitoring-and-drift` | Available; review pending | Citation found; no clearance claim. |
| `llmops` | Available; review pending | Citation found; no clearance claim. |
| `llm-inference-systems` | Available; review pending | Citation found; no clearance claim. |

A citation alone is neither proof of copying nor proof of permission. The six remaining notes have not been declared license-cleared by this change. The publication-hold registry now contains 42 topics, or 84 localized note routes.

## Publication checks

- Both localized note files must remain `needs-review` for every withdrawn ID.
- Generated output must not contain their note routes, notebook-derived prose or practice invitations.
- Internal links to withdrawn notes resolve to the course index, rather than an unpublished document.
- The source-notebook IDs, old corpus fingerprints and recorded metrics must not remain in published NLP content.
- The new corpus uses invented documents and explicit relevance IDs; it must not reuse old posts, golden passages, query formulations, or notebook outputs.

## Local validation

- `npm run build`: 671 static pages; Astro reported 0 errors, 0 warnings and 35 existing hints.
- The built-output withdrawal check passed for all 40 IDs in both locales: their 80 note routes are absent, published links do not target them, and the new NLP content has no blocked source fingerprints.
- Both rendered retrieval notes have no KaTeX errors or duplicate IDs; all rendered dataset, provenance, rights, results and script downloads resolve in the build output.
- Re-running the downloaded Python script reproduced `results.json` byte for byte. The evaluated dataset hash and both locales' Hit@1, Hit@3 and MRR of 0.8 were checked.
- The self-contained notebook was copied with saved execution outputs. Its final download sentence was added after the local build had captured the note source; the normal CI build must render that final small addition before publication. No second concurrent local build was run.
- After that build, two additional MLOps publication holds and the archived NVIDIA CUDA 13.0 guide reference were added. Source withdrawal checks, practice-catalog validation and whitespace checks were rerun. A complete CI build must validate the final 42-topic state before publication; the earlier 671-page build is not evidence for these later edits.
