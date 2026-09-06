"use client";

import { useMemo, useState } from "react";
import {
  AlertIcon,
  ArrowRightIcon,
  ChevronIcon,
  PinIcon,
  SparkIcon,
} from "@/components/icons";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  EmptyState,
  Field,
  PageHeader,
  ScoreBar,
  Section,
  inputClass,
} from "@/components/ui";
import { useStore } from "@/lib/store";
import { OCCUPATIONS } from "@/lib/data";
import { RagEngine, WEIGHTS } from "@/lib/rag/engine";
import { buildContext, buildPrompt } from "@/lib/rag/context";
import type { RankedOpportunity } from "@/lib/types";

const EVIDENCE_COUNT = 6;

export default function ResultsPage() {
  const { hydrated, profile, profileReady, opportunities, deepseekKey, setDeepseekKey } =
    useStore();

  const [explanation, setExplanation] = useState("");
  const [explainError, setExplainError] = useState("");
  const [explaining, setExplaining] = useState(false);

  // The whole pipeline runs here, in the browser: the profile never leaves the device.
  const result = useMemo(() => {
    if (!hydrated || !profileReady) return null;
    const engine = new RagEngine(OCCUPATIONS, opportunities);
    return engine.rank(profile, { topK: EVIDENCE_COUNT });
  }, [hydrated, profileReady, profile, opportunities]);

  const context = useMemo(
    () => (result ? buildContext(profile, result.ranked.slice(0, 5), result.retrieved) : ""),
    [result, profile],
  );

  if (!hydrated) {
    return (
      <>
        <PageHeader eyebrow="Your matches" title="Ranked opportunities" />
        <Card className="animate-pulse text-sm text-ink-faint">Scoring opportunities…</Card>
      </>
    );
  }

  if (!profileReady || !result) {
    return (
      <>
        <PageHeader eyebrow="Your matches" title="Ranked opportunities" />
        <EmptyState
          title="No profile yet"
          action={
            <ButtonLink href="/user">
              Fill in your profile
              <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
          }
        >
          TOE needs something to match against. Add your degree, skills or a career aspiration on
          the User tab and your ranking appears here immediately.
        </EmptyState>
      </>
    );
  }

  const { ranked, retrieved } = result;
  const top = ranked[0];

  const explain = async () => {
    setExplaining(true);
    setExplainError("");
    setExplanation("");
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: deepseekKey.trim(), context }),
      });
      const data: unknown = await response.json();
      const payload = data as { text?: string; error?: string };
      if (!response.ok) {
        setExplainError(payload.error ?? "The explanation service could not be reached.");
      } else {
        setExplanation(payload.text ?? "DeepSeek returned an empty response.");
      }
    } catch {
      setExplainError("Network error — the explanation service could not be reached.");
    } finally {
      setExplaining(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Your matches"
        title="Ranked opportunities"
        lede={
          <>
            {ranked.length} roles scored against{" "}
            {profile.name.trim() ? `${profile.name}'s` : "your"} profile. Ranking is computed on
            this device from O*NET evidence — no model decides the order.
          </>
        }
      />

      {/* Headline result */}
      <Card className="border-rust/25 bg-rust-tint/45">
        <p className="text-xs font-semibold tracking-[0.16em] text-rust uppercase">Best match</p>
        <h2 className="mt-2 font-display text-2xl leading-tight font-semibold text-ink sm:text-3xl">
          {top.opportunity.title}
        </h2>
        <p className="mt-1 text-sm font-medium text-ink-soft">{top.opportunity.company}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="font-display text-4xl font-semibold text-rust tabular-nums">
            {Math.round(top.score * 100)}%
          </span>
          <span className="text-sm text-ink-soft">overall match</span>
          {top.opportunity.booth ? (
            <Badge tone="rust" className="ml-auto">
              <PinIcon className="h-3.5 w-3.5" />
              Booth {top.opportunity.booth}
            </Badge>
          ) : null}
        </div>
      </Card>

      <Section
        title="All matches"
        description={`Weighted from required skills (${pct(WEIGHTS.required)}), preferred skills (${pct(
          WEIGHTS.preferred,
        )}), occupation fit (${pct(WEIGHTS.occupation)}) and career alignment (${pct(
          WEIGHTS.career,
        )}).`}
      >
        <ol className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          {ranked.map((item, index) => (
            <ResultCard key={item.opportunity.opportunity_id} rank={index + 1} item={item} />
          ))}
        </ol>
      </Section>

      <Section
        title="Retrieved evidence"
        description="The documents TF-IDF retrieval surfaced for your profile, with their cosine similarity scores."
      >
        <ul className="grid gap-2">
          {retrieved.map((doc) => (
            // min-w-0 stops the grid item sizing to its content, which is what lets the
            // long document title actually truncate instead of widening the page.
            <li key={doc.id} className="min-w-0">
              <details className="card group p-4">
                <summary className="flex cursor-pointer list-none items-center gap-3">
                  <Badge tone={doc.type === "occupation" ? "sage" : "rust"}>
                    {doc.type === "occupation" ? "O*NET" : "Opportunity"}
                  </Badge>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                    {doc.title}
                  </span>
                  <span className="font-display text-xs text-ink-soft tabular-nums">
                    {doc.retrieval_score.toFixed(3)}
                  </span>
                  <ChevronIcon className="h-4 w-4 shrink-0 text-ink-faint transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed text-ink-soft">
                  {doc.text}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="AI explanation"
        description="Optional. DeepSeek describes the ranking in plain language from the evidence above — it never changes the order."
      >
        <Card>
          <Field
            label="Your DeepSeek API key"
            hint="Held in this browser tab only, discarded when the tab closes, and never stored on our side. It is forwarded once per request to api.deepseek.com."
            htmlFor="deepseek-key"
          >
            <div className="flex flex-wrap gap-2">
              <input
                id="deepseek-key"
                type="password"
                value={deepseekKey}
                onChange={(e) => setDeepseekKey(e.target.value)}
                placeholder="sk-…"
                autoComplete="off"
                spellCheck={false}
                className={`${inputClass} flex-1 font-mono`}
              />
              {deepseekKey ? (
                <Button variant="ghost" onClick={() => setDeepseekKey("")} className="px-4 py-2">
                  Clear key
                </Button>
              ) : null}
            </div>
          </Field>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button onClick={explain} disabled={explaining || deepseekKey.trim().length < 8}>
              <SparkIcon className="h-4 w-4" />
              {explaining ? "Generating…" : "Generate explanation"}
            </Button>
            <span className="text-xs text-ink-faint">
              {deepseekKey.trim().length < 8
                ? "Add a key to enable."
                : "Sends the evidence block, not your raw profile fields."}
            </span>
          </div>

          {explainError ? (
            <p
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl bg-amber-tint px-4 py-3 text-sm text-amber"
            >
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {explainError} Your ranking above is unaffected — it does not depend on DeepSeek.
              </span>
            </p>
          ) : null}

          {explanation ? (
            <div className="mt-4 border-t border-line pt-4">
              {explanation.split(/\n{2,}/).map((para, i) => (
                <p key={i} className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-ink">
                  {para}
                </p>
              ))}
            </div>
          ) : null}

          <details className="group mt-5 border-t border-line pt-4">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-ink-soft">
              <ChevronIcon className="h-3.5 w-3.5 transition-transform group-open:rotate-90" />
              View the exact grounding context
            </summary>
            <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-cream-deep p-4 text-[0.7rem] leading-relaxed whitespace-pre-wrap text-ink-soft">
              {buildPrompt(context)}
            </pre>
          </details>
        </Card>
      </Section>
    </>
  );
}

function ResultCard({ rank, item }: { rank: number; item: RankedOpportunity }) {
  const o = item.opportunity;
  return (
    <Card as="li" className="flex min-w-0 flex-col">
      <div className="flex items-start gap-3">
        <span className="font-display text-lg font-semibold text-rust/45 tabular-nums">
          {String(rank).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg leading-snug font-semibold text-ink">{o.title}</h3>
          <p className="mt-0.5 text-sm text-ink-soft">{o.company}</p>
        </div>
        <span className="font-display text-2xl font-semibold text-rust tabular-nums">
          {Math.round(item.score * 100)}%
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{o.description}</p>

      <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3">
        <ScoreBar label="Required skills" value={item.required_fit} />
        <ScoreBar label="Preferred skills" value={item.preferred_fit} tone="sage" />
        <ScoreBar label="Occupation fit" value={item.occupation_fit} tone="sage" />
        <ScoreBar label="Career alignment" value={item.career_alignment} />
      </div>

      {item.linked_occupation ? (
        <p className="mt-3.5 text-xs leading-relaxed text-ink-faint">
          Mapped to O*NET{" "}
          <span className="font-medium text-ink-soft">{item.linked_occupation.title}</span> (
          {item.linked_occupation.code})
        </p>
      ) : null}

      {item.gaps.length ? (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-tint px-3 py-2.5 text-xs leading-relaxed text-amber">
          <AlertIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Skill gaps: <span className="font-semibold">{item.gaps.join(", ")}</span>
          </span>
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3.5">
        {o.booth ? (
          <Badge tone="rust">
            <PinIcon className="h-3.5 w-3.5" />
            Booth {o.booth}
          </Badge>
        ) : null}
        {o.sector ? <Badge>{o.sector}</Badge> : null}
        {o.mode ? <Badge>{o.mode}</Badge> : null}
        {o.submitted ? <Badge tone="sage">Newly posted</Badge> : null}
      </div>
    </Card>
  );
}

function pct(weight: number): string {
  return `${Math.round(weight * 100)}%`;
}
