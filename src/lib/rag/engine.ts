import { TfidfVectorizer, cosineSimilarity, type SparseVector } from "./tfidf";
import type {
  Occupation,
  Opportunity,
  RankedOpportunity,
  RetrievedDoc,
  StudentProfile,
} from "../types";

/** Scoring weights, unchanged from the original Streamlit `score_opportunity`. */
export const WEIGHTS = { required: 0.35, preferred: 0.15, occupation: 0.3, career: 0.2 } as const;

/**
 * How the 30%-weighted "occupation fit" term is computed.
 *
 * "legacy" reproduces the original Python exactly: the retrieval score of the single
 * best-retrieved occupation. That value does not depend on the opportunity being scored,
 * so it is identical for every candidate and cannot affect the ranking -- it only shifts
 * every score by the same constant.
 *
 * "per-opportunity" (default) links each opportunity to the O*NET occupation it actually
 * maps onto, then asks how well the student matches that occupation.
 */
export type OccupationFitMode = "legacy" | "per-opportunity";

/**
 * Cosine similarity that counts as a full occupation match.
 *
 * TF-IDF cosine between a short student query and a short occupation document is small in
 * absolute terms -- a strong match here sits around 0.2-0.3, not near 1.0. Feeding that raw
 * number into a weighted sum alongside three ratios that genuinely span 0..1 would leave the
 * 30% term contributing at most ~0.06. Dividing by a fixed reference puts it on the same
 * footing as the other components without normalising against the student's own best match,
 * which would guarantee that some opportunity always scored 100% on this axis.
 */
export const OCCUPATION_FIT_REFERENCE = 0.3;

type CorpusDoc = {
  id: string;
  type: "occupation" | "opportunity";
  title: string;
  text: string;
  vector: SparseVector;
};

export function occupationText(x: Occupation): string {
  return [
    x.occupation_title,
    x.description ?? "",
    "Skills: " + (x.skills ?? []).join(", "),
    "Tasks: " + (x.tasks ?? []).join("; "),
    "Interests: " + (x.interests ?? []).join(", "),
  ].join(" ");
}

export function opportunityText(x: Opportunity): string {
  return [
    x.company,
    x.title,
    x.description ?? "",
    "Required skills: " + (x.required_skills ?? []).join(", "),
    "Preferred skills: " + (x.preferred_skills ?? []).join(", "),
    "Career paths: " + (x.career_paths ?? []).join(", "),
  ].join(" ");
}

/**
 * The programme-of-study terms fed into retrieval. Course titles are used rather than MIT
 * course numbers because TF-IDF matches on words -- "6-3" shares nothing with an O*NET
 * occupation description, but "Computer Science and Engineering" does. `degree` is the
 * fallback for profiles saved before the major/minor dropdowns existed, and is what the
 * scikit-learn parity fixtures use.
 */
export function programmeTerms(s: StudentProfile): string[] {
  const terms = [s.major, s.minor].filter((t): t is string => Boolean(t && t.trim()));
  if (terms.length) return terms;
  return s.degree?.trim() ? [s.degree] : [];
}

export function profileToQuery(s: StudentProfile): string {
  return [
    ...programmeTerms(s),
    ...(s.courses ?? []),
    ...(s.skills ?? []),
    ...(s.projects ?? []),
    ...(s.interests ?? []),
    s.aspiration ?? "",
  ].join(" ");
}

/** Mirrors `norm()` in rag_engine.py. */
export function norm(x: unknown): string {
  return String(x)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Mirrors `overlap()`: the share of B that A covers. */
export function overlap(a: readonly string[], b: readonly string[]): number {
  const A = new Set(a.map(norm));
  const B = new Set(b.map(norm));
  if (B.size === 0) return 0;
  let hits = 0;
  for (const item of B) if (A.has(item)) hits++;
  return hits / B.size;
}

export class RagEngine {
  private readonly vectorizer = new TfidfVectorizer();
  private readonly docs: CorpusDoc[] = [];
  private readonly occupations: Occupation[];
  private readonly opportunities: Opportunity[];
  /** opportunity_id -> the occupation it maps onto, with their similarity. */
  private readonly occupationLinks = new Map<
    string,
    { occupation: Occupation; similarity: number }
  >();

  constructor(occupations: readonly Occupation[], opportunities: readonly Opportunity[]) {
    this.occupations = [...occupations];
    this.opportunities = [...opportunities];

    // Corpus order matches load_corpus(): occupations first, then opportunities.
    const entries = [
      ...this.occupations.map((x) => ({
        id: "onet:" + x.occupation_code,
        type: "occupation" as const,
        title: x.occupation_title,
        text: occupationText(x),
      })),
      ...this.opportunities.map((x) => ({
        id: "opportunity:" + x.opportunity_id,
        type: "opportunity" as const,
        title: x.company + " — " + x.title,
        text: opportunityText(x),
      })),
    ];

    const vectors = this.vectorizer.fitTransform(entries.map((e) => e.text));
    this.docs = entries.map((e, i) => ({ ...e, vector: vectors[i] }));

    // Precompute, for each opportunity, the occupation its work most resembles.
    const occupationDocs = this.docs.filter((d) => d.type === "occupation");
    for (const opportunity of this.opportunities) {
      const oppDoc = this.docs.find((d) => d.id === "opportunity:" + opportunity.opportunity_id);
      if (!oppDoc) continue;
      let best: { occupation: Occupation; similarity: number } | null = null;
      for (let i = 0; i < occupationDocs.length; i++) {
        const similarity = cosineSimilarity(oppDoc.vector, occupationDocs[i].vector);
        if (!best || similarity > best.similarity) {
          best = { occupation: this.occupations[i], similarity };
        }
      }
      if (best) this.occupationLinks.set(opportunity.opportunity_id, best);
    }
  }

  /** Mirrors `Retriever.search`: top-k documents by cosine similarity. */
  retrieve(query: string, k = 6): RetrievedDoc[] {
    const q = this.vectorizer.transform(query);
    return this.docs
      .map((d) => ({
        id: d.id,
        type: d.type,
        title: d.title,
        text: d.text,
        retrieval_score: cosineSimilarity(q, d.vector),
      }))
      .sort((a, b) => b.retrieval_score - a.retrieval_score)
      .slice(0, Math.max(0, k));
  }

  /** Similarity between the student query and every occupation, keyed by occupation code. */
  private studentOccupationSimilarities(query: string): Map<string, number> {
    const q = this.vectorizer.transform(query);
    const out = new Map<string, number>();
    for (const occupation of this.occupations) {
      const doc = this.docs.find((d) => d.id === "onet:" + occupation.occupation_code);
      out.set(occupation.occupation_code, doc ? cosineSimilarity(q, doc.vector) : 0);
    }
    return out;
  }

  rank(
    student: StudentProfile,
    options: { topK?: number; occupationFitMode?: OccupationFitMode } = {},
  ): { ranked: RankedOpportunity[]; retrieved: RetrievedDoc[]; query: string } {
    const { topK = 6, occupationFitMode = "per-opportunity" } = options;
    const query = profileToQuery(student);
    const retrieved = this.retrieve(query, topK);

    const occupationHits = retrieved.filter((r) => r.type === "occupation");
    const legacyOccupationFit = occupationHits.reduce(
      (best, r) => Math.max(best, r.retrieval_score),
      0,
    );

    const studentOccupationSimilarity = this.studentOccupationSimilarities(query);

    const terms = [
      ...(student.skills ?? []),
      ...(student.courses ?? []),
      ...(student.interests ?? []),
    ];
    const studentSkills = new Set((student.skills ?? []).map(norm));
    const aspiration = norm(student.aspiration ?? "");

    const ranked = this.opportunities.map<RankedOpportunity>((opportunity) => {
      const required_fit = overlap(terms, opportunity.required_skills ?? []);
      const preferred_fit = overlap(terms, opportunity.preferred_skills ?? []);

      const paths = (opportunity.career_paths ?? []).map(norm).join(" ");
      const career_alignment =
        aspiration && aspiration.split(" ").some((t) => t.length > 3 && paths.includes(t))
          ? 1.0
          : 0.35;

      const link = this.occupationLinks.get(opportunity.opportunity_id) ?? null;
      let occupation_fit: number;
      if (occupationFitMode === "legacy") {
        occupation_fit = legacyOccupationFit;
      } else if (link) {
        // How well the student matches the occupation *this* opportunity maps onto.
        const similarity = studentOccupationSimilarity.get(link.occupation.occupation_code) ?? 0;
        occupation_fit = Math.min(1, Math.max(0, similarity / OCCUPATION_FIT_REFERENCE));
      } else {
        occupation_fit = 0;
      }

      const score =
        WEIGHTS.required * required_fit +
        WEIGHTS.preferred * preferred_fit +
        WEIGHTS.occupation * occupation_fit +
        WEIGHTS.career * career_alignment;

      return {
        opportunity,
        score,
        required_fit,
        preferred_fit,
        occupation_fit,
        career_alignment,
        linked_occupation: link
          ? {
              code: link.occupation.occupation_code,
              title: link.occupation.occupation_title,
              similarity: link.similarity,
            }
          : null,
        gaps: (opportunity.required_skills ?? []).filter((x) => !studentSkills.has(norm(x))),
      };
    });

    ranked.sort((a, b) => b.score - a.score);
    return { ranked, retrieved, query };
  }
}
