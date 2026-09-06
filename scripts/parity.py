"""Reference output from the original scikit-learn RAG engine, for parity testing.

Usage: python scripts/parity.py <path-to-TOE-RAG>
"""
import json
import sys
from pathlib import Path

repo = Path(sys.argv[1]).resolve()
sys.path.insert(0, str(repo))

from rag_engine import (  # noqa: E402
    load_corpus,
    Retriever,
    profile_to_query,
    score_opportunity,
)

students, docs = load_corpus()
retriever = Retriever(docs)


def rnd(x):
    return round(float(x), 9)


output = []
for student in students:
    query = profile_to_query(student)
    retrieved = retriever.search(query, 6)
    occ_hits = [r for r in retrieved if r["type"] == "occupation"]
    opps = [d["metadata"] for d in docs if d["type"] == "opportunity"]
    ranked = sorted(
        [score_opportunity(student, o, occ_hits) for o in opps],
        key=lambda x: x["score"],
        reverse=True,
    )
    output.append(
        {
            "student": student["name"],
            "retrieved": [
                {"id": r["id"], "score": rnd(r["retrieval_score"])} for r in retrieved
            ],
            "ranked": [
                {
                    "id": r["opportunity"]["opportunity_id"],
                    "score": rnd(r["score"]),
                    "required_fit": rnd(r["required_fit"]),
                    "preferred_fit": rnd(r["preferred_fit"]),
                    "occupation_fit": rnd(r["occupation_fit"]),
                    "career_alignment": rnd(r["career_alignment"]),
                    "gaps": r["gaps"],
                }
                for r in ranked
            ],
        }
    )

print(json.dumps(output, indent=1))
