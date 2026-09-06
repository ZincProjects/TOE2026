/**
 * Parity harness: runs the TypeScript RAG port in "legacy" mode against the original
 * demo corpus and prints the results as JSON, so they can be diffed against the output
 * of the scikit-learn implementation in the Streamlit app (see parity.py).
 *
 * Usage: npx tsx scripts/parity.mts <path-to-TOE-RAG/data>
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { RagEngine } from "../src/lib/rag/engine";
import type { Occupation, Opportunity, StudentProfile } from "../src/lib/types";

const dataDir = process.argv[2];
if (!dataDir) {
  console.error("usage: tsx scripts/parity.mts <path-to-TOE-RAG/data>");
  process.exit(2);
}

const read = <T,>(name: string): T =>
  JSON.parse(readFileSync(join(dataDir, name), "utf8")) as T;

const occupations = read<Occupation[]>("onet_demo.json");
const opportunities = read<Opportunity[]>("opportunities.json");
const students = read<StudentProfile[]>("students.json");

const engine = new RagEngine(occupations, opportunities);

const output = students.map((student) => {
  const { ranked, retrieved } = engine.rank(student, {
    topK: 6,
    occupationFitMode: "legacy",
  });
  return {
    student: student.name,
    retrieved: retrieved.map((r) => ({ id: r.id, score: round(r.retrieval_score) })),
    ranked: ranked.map((r) => ({
      id: r.opportunity.opportunity_id,
      score: round(r.score),
      required_fit: round(r.required_fit),
      preferred_fit: round(r.preferred_fit),
      occupation_fit: round(r.occupation_fit),
      career_alignment: round(r.career_alignment),
      gaps: r.gaps,
    })),
  };
});

function round(x: number): number {
  return Math.round(x * 1e9) / 1e9;
}

console.log(JSON.stringify(output, null, 1));
