# BIASED Retrieval Lab v1

An original, small retrieval exercise prepared for Fedor Pakhurov with AI
assistance on 13 November 2026. It contains 14 fictional support documents and
10 original queries, each with the exact ID of one relevant document. Both
Russian and English text were written for this exercise. No third-party course
notebook, corpus, private messages or real support tickets were used.

The documents describe an invented learning workspace. Their limits, deadlines
and support procedures are fictional and are not BIASED School service terms.
The corpus and queries were written together to expose specific failure modes;
this is not a held-out benchmark or a representative sample of users.

## Files

- `dataset.json`: stable document/query IDs, original texts and relevance labels.
- `results.json`: query-level lexical-baseline ranks, top-three scores and
  aggregate metrics, with the SHA-256 of the evaluated dataset bytes.
- `LICENSE`: rights statement. No open-source/Creative Commons license is granted.
- The accompanying `retrieval-example.py` is in the repository's `scripts/`
  directory and is also available next to these files on the notes website.
- `nlp-retrieval-lab.ipynb`, in `content/notebooks/`, embeds the complete dataset
  and the same scoring functions. Its six code cells have saved executed outputs
  and self-checks. It runs on Python's standard library without downloading files.

## Reproduce

From the BIASED repository root:

```sh
python3 scripts/retrieval-example.py --output content/datasets/biased-retrieval-lab-v1/results.json
```

For a downloaded copy, put the script and dataset in the same directory:

```sh
python3 retrieval-example.py --dataset dataset.json --output results.json
```

Python's standard library is sufficient; the script does not download models or
data. It lowercases Unicode word tokens without stemming or stopword removal.
BM25 uses `k1=1.2`, `b=0.75` and the positive IDF
`log(1 + (N-df+0.5)/(df+0.5))`. Each distinct query term contributes once.
All documents are scored; only positive-score documents are returned, with
equal scores ordered by document ID. Relevance is checked by exact ID, never
by approximate text matching. MRR uses the first relevant result in the full
returned list; Hit@1 and Hit@3 use the respective cutoffs.

The checked-in run returns the relevant document first for eight queries and
never returns it for `q07` and `q08`, in both languages. Thus Hit@1, Hit@3 and
MRR are all 0.8. The Russian `q08` retrieves irrelevant documents sharing the
preposition "в"; it still misses `d05`. Increasing k cannot restore a document
whose lexical score is zero under this return policy.

No learned dense retriever or reranker was run. The lesson's small vectors are
explicitly hand-chosen arithmetic illustrations, not model outputs. The
baseline results cannot establish that a neural method would improve accuracy.

## Conceptual references

These sources explain algorithms; their text, data and code are not included:

- Robertson and Zaragoza (2009), *The Probabilistic Relevance Framework: BM25
  and Beyond*, https://doi.org/10.1561/1500000019.
- Karpukhin et al. (2020), *Dense Passage Retrieval for Open-Domain Question
  Answering*, https://aclanthology.org/2020.emnlp-main.550/.
- Nogueira and Cho (2019), *Passage Re-ranking with BERT*,
  https://arxiv.org/abs/1901.04085.

Using these primary references does not imply their authors endorse this lab.
