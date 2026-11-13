"""Evaluate the original BIASED retrieval lab with a small lexical baseline.

Python standard library only. No models, corpora, network access or code from
external course notebooks. Full BM25 scores are computed for every document.
"""

import argparse
from collections import Counter
import hashlib
import json
import math
from pathlib import Path
import re


def tokens(text):
    return re.findall(r"[^\W_]+", text.casefold(), flags=re.UNICODE)


def rank(query, documents, locale, k1=1.2, b=0.75):
    counts = {doc["id"]: Counter(tokens(doc["text"][locale])) for doc in documents}
    lengths = {doc_id: sum(terms.values()) for doc_id, terms in counts.items()}
    mean_length = sum(lengths.values()) / len(documents)
    document_frequency = Counter(term for terms in counts.values() for term in terms)
    query_terms = set(tokens(query))
    scored = []
    for doc_id, terms in counts.items():
        score = 0.0
        for term in sorted(query_terms):
            tf = terms[term]
            df = document_frequency[term]
            idf = math.log(1 + (len(documents) - df + 0.5) / (df + 0.5))
            denominator = tf + k1 * (1 - b + b * lengths[doc_id] / mean_length)
            score += idf * tf * (k1 + 1) / denominator
        # Zero-score documents have no lexical evidence and are not returned.
        if score > 0:
            scored.append((doc_id, score))
    return sorted(scored, key=lambda item: (-item[1], item[0]))


def evaluate(dataset, locale):
    documents = dataset["documents"]
    document_ids = [doc["id"] for doc in documents]
    query_ids = [query["id"] for query in dataset["queries"]]
    if len(document_ids) != len(set(document_ids)) or len(query_ids) != len(set(query_ids)):
        raise ValueError("Document and query IDs must be unique")
    if not documents or not dataset["queries"]:
        raise ValueError("Documents and queries cannot be empty")
    rows = []
    for query in dataset["queries"]:
        relevant = set(query["relevant_ids"])
        if not relevant or not relevant.issubset(document_ids):
            raise ValueError("Each query must name existing relevant document IDs")
        ranking = rank(query["text"][locale], documents, locale)
        first = next((i for i, (doc_id, _) in enumerate(ranking, 1) if doc_id in relevant), None)
        rows.append({
            "query_id": query["id"],
            "relevant_ids": query["relevant_ids"],
            "first_relevant_rank": first,
            "top3": [{"id": doc_id, "score": round(score, 6)} for doc_id, score in ranking[:3]],
        })
    size = len(rows)
    return {
        "queries": rows,
        "metrics": {
            "hit_at_1": sum(row["first_relevant_rank"] == 1 for row in rows) / size,
            "hit_at_3": sum(row["first_relevant_rank"] is not None and row["first_relevant_rank"] <= 3 for row in rows) / size,
            "mrr": sum(1 / row["first_relevant_rank"] if row["first_relevant_rank"] else 0 for row in rows) / size,
        },
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    default = Path(__file__).resolve().parent.parent / "content/datasets/biased-retrieval-lab-v1/dataset.json"
    parser.add_argument("--dataset", type=Path, default=default)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    raw = args.dataset.read_bytes()
    dataset = json.loads(raw)
    result = {
        "dataset_id": dataset["id"],
        "dataset_sha256": hashlib.sha256(raw).hexdigest(),
        "method": "BM25, positive log(1+(N-df+0.5)/(df+0.5)) IDF, k1=1.2, b=0.75; Unicode lowercase word tokens; unique query terms; no stemming, stopwords or learned model; positive scores only; ties by document ID",
        "document_count": len(dataset["documents"]),
        "query_count": len(dataset["queries"]),
        "locales": {locale: evaluate(dataset, locale) for locale in ["en", "ru"]},
        "limitations": "Hand-authored demonstration cases, not a held-out benchmark. No dense retrieval was run. Scores do not estimate performance on real user traffic.",
    }
    rendered = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered, end="")


if __name__ == "__main__":
    main()
