import { ENGLISH_STOP_WORDS } from "./stopwords";

/**
 * Port of sklearn.feature_extraction.text.TfidfVectorizer as configured in the
 * original Streamlit app: TfidfVectorizer(stop_words="english", ngram_range=(1, 2)).
 *
 * sklearn defaults that matter here and are reproduced below:
 *   - lowercase=True
 *   - token_pattern=r"(?u)\b\w\w+\b"  (tokens of 2+ word characters)
 *   - stop words are removed *before* n-grams are generated
 *   - smooth_idf=True  ->  idf(t) = ln((1 + n) / (1 + df(t))) + 1
 *   - sublinear_tf=False, norm="l2"
 */

// \w in Python's `re` with the re.UNICODE flag covers letters, digits and underscore.
const TOKEN_PATTERN = /[\p{L}\p{N}_][\p{L}\p{N}_]+/gu;

export function tokenize(text: string): string[] {
  return text.toLowerCase().match(TOKEN_PATTERN) ?? [];
}

/** Unigrams + bigrams, matching ngram_range=(1, 2) applied after stop-word removal. */
export function analyze(text: string): string[] {
  const words = tokenize(text).filter((w) => !ENGLISH_STOP_WORDS.has(w));
  const grams: string[] = [...words];
  for (let i = 0; i + 1 < words.length; i++) grams.push(`${words[i]} ${words[i + 1]}`);
  return grams;
}

/** An L2-normalised sparse row: term index -> weight. */
export type SparseVector = Map<number, number>;

export class TfidfVectorizer {
  readonly vocabulary: Map<string, number> = new Map();
  readonly idf: number[] = [];

  /** Fits the vocabulary and idf weights, then returns the transformed documents. */
  fitTransform(documents: readonly string[]): SparseVector[] {
    const n = documents.length;
    const counted = documents.map((doc) => {
      const counts = new Map<string, number>();
      for (const gram of analyze(doc)) counts.set(gram, (counts.get(gram) ?? 0) + 1);
      return counts;
    });

    // sklearn sorts the vocabulary alphabetically when assigning column indices.
    const documentFrequency = new Map<string, number>();
    for (const counts of counted) {
      for (const gram of counts.keys()) {
        documentFrequency.set(gram, (documentFrequency.get(gram) ?? 0) + 1);
      }
    }
    for (const gram of [...documentFrequency.keys()].sort()) {
      this.vocabulary.set(gram, this.vocabulary.size);
    }
    this.idf.length = this.vocabulary.size;
    for (const [gram, index] of this.vocabulary) {
      const df = documentFrequency.get(gram) ?? 0;
      this.idf[index] = Math.log((1 + n) / (1 + df)) + 1;
    }

    return counted.map((counts) => this.weigh(counts));
  }

  /** Transforms unseen text against the fitted vocabulary; unknown terms are dropped. */
  transform(text: string): SparseVector {
    const counts = new Map<string, number>();
    for (const gram of analyze(text)) {
      if (this.vocabulary.has(gram)) counts.set(gram, (counts.get(gram) ?? 0) + 1);
    }
    return this.weigh(counts);
  }

  private weigh(counts: Map<string, number>): SparseVector {
    const vector: SparseVector = new Map();
    for (const [gram, tf] of counts) {
      const index = this.vocabulary.get(gram);
      if (index === undefined) continue;
      vector.set(index, tf * this.idf[index]);
    }
    return l2Normalize(vector);
  }
}

function l2Normalize(vector: SparseVector): SparseVector {
  let sumOfSquares = 0;
  for (const value of vector.values()) sumOfSquares += value * value;
  if (sumOfSquares === 0) return vector;
  const norm = Math.sqrt(sumOfSquares);
  for (const [index, value] of vector) vector.set(index, value / norm);
  return vector;
}

/** Cosine similarity. Both inputs are already L2-normalised, so this is a dot product. */
export function cosineSimilarity(a: SparseVector, b: SparseVector): number {
  // Iterate the sparser side so the cost tracks the smaller vector.
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  let dot = 0;
  for (const [index, value] of small) {
    const other = large.get(index);
    if (other !== undefined) dot += value * other;
  }
  return dot;
}
