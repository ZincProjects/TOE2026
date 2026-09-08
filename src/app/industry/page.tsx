"use client";

import { useMemo, useState } from "react";
import { ChevronIcon, PinIcon, PlusIcon, SearchIcon } from "@/components/icons";
import { Badge, Button, Card, EmptyState, PageHeader, Section, inputClass } from "@/components/ui";
import { OpportunityForm } from "./OpportunityForm";
import { useStore } from "@/lib/store";
import type { Opportunity } from "@/lib/types";

const ALL = "All sectors";

export default function IndustryPage() {
  const { hydrated, opportunities, submitted, removeOpportunity } = useStore();
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState(ALL);
  const [formOpen, setFormOpen] = useState(false);

  const sectors = useMemo(
    () => [ALL, ...new Set(opportunities.map((o) => o.sector).filter(Boolean) as string[])].sort(
      (a, b) => (a === ALL ? -1 : b === ALL ? 1 : a.localeCompare(b)),
    ),
    [opportunities],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return opportunities.filter((o) => {
      if (sector !== ALL && o.sector !== sector) return false;
      if (!q) return true;
      return [o.company, o.title, o.description, ...o.required_skills, ...o.preferred_skills]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [opportunities, query, sector]);

  // Group by company so the catalogue reads as an exhibitor list, not a flat job board.
  const companies = useMemo(() => {
    const map = new Map<string, Opportunity[]>();
    for (const o of filtered) {
      const list = map.get(o.company) ?? [];
      list.push(o);
      map.set(o.company, list);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <>
      <PageHeader
        eyebrow="Industry"
        title="Who is on the floor"
        lede="Every company exhibiting at Career Fair 2026 and the roles they are recruiting for. Companies can add a new opportunity at any time — it is scored against student profiles straight away."
      />

      {/* Search + post */}
      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies, roles or skills"
            aria-label="Search opportunities"
            className={`${inputClass} pl-10`}
          />
        </div>
        <Button onClick={() => setFormOpen(true)} className="shrink-0">
          <PlusIcon className="h-4 w-4" />
          Post an opportunity
        </Button>
      </Card>

      {/* Sector rail */}
      <div className="no-scrollbar mt-4 -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
        {sectors.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSector(s)}
            aria-pressed={sector === s}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors
                        ${
                          sector === s
                            ? "border-rust bg-rust text-paper"
                            : "border-line bg-paper text-ink-soft hover:border-rust hover:text-rust"
                        }`}
          >
            {s}
          </button>
        ))}
      </div>

      {formOpen ? (
        <div className="mt-6">
          <OpportunityForm onDone={() => setFormOpen(false)} />
        </div>
      ) : null}

      {hydrated && submitted.length > 0 ? (
        <Section
          title="Posted from this device"
          description="Saved in your browser for this demo. Clearing site data removes them."
        >
          <ul className="grid gap-3 lg:grid-cols-2">
            {submitted.map((o) => (
              <OpportunityCard
                key={o.opportunity_id}
                opportunity={o}
                onRemove={() => removeOpportunity(o.opportunity_id)}
              />
            ))}
          </ul>
        </Section>
      ) : null}

      <Section
        title="Exhibitor catalogue"
        description={`${filtered.length} ${filtered.length === 1 ? "role" : "roles"} across ${
          companies.length
        } ${companies.length === 1 ? "company" : "companies"}.`}
      >
        {companies.length === 0 ? (
          <EmptyState
            title="Nothing matches that search"
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setSector(ALL);
                }}
              >
                Reset filters
              </Button>
            }
          >
            Try a broader term, or clear the sector filter to see the full exhibitor list.
          </EmptyState>
        ) : (
          <div className="space-y-4">
            {companies.map(([company, roles]) => (
              <div key={company}>
                <h3 className="mb-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-display text-lg font-semibold text-ink">
                  {company}
                  <span className="text-xs font-medium text-ink-faint">
                    {roles.length} {roles.length === 1 ? "role" : "roles"}
                    {roles[0].location ? ` · ${roles[0].location}` : ""}
                  </span>
                </h3>
                <ul className="grid gap-3 lg:grid-cols-2">
                  {roles.map((o) => (
                    <OpportunityCard key={o.opportunity_id} opportunity={o} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

function OpportunityCard({
  opportunity: o,
  onRemove,
}: {
  opportunity: Opportunity;
  onRemove?: () => void;
}) {
  return (
    <Card as="li" className="flex min-w-0 flex-col">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-display text-base leading-snug font-semibold text-ink">{o.title}</h4>
          <p className="mt-0.5 text-sm text-ink-soft">{o.company}</p>
        </div>
        {o.booth ? (
          <Badge tone="rust" className="shrink-0">
            <PinIcon className="h-3.5 w-3.5" />
            {o.booth}
          </Badge>
        ) : null}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{o.description}</p>

      <div className="mt-3.5 flex flex-wrap gap-1.5">
        {o.required_skills.map((s) => (
          <Badge key={s} tone="rust">
            {s}
          </Badge>
        ))}
        {o.preferred_skills.map((s) => (
          <Badge key={s}>{s}</Badge>
        ))}
      </div>

      <details className="group mt-3.5 border-t border-line pt-3">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold text-ink-soft">
          <ChevronIcon className="h-3.5 w-3.5 transition-transform group-open:rotate-90" />
          Details
        </summary>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
          {[
            ["Sector", o.sector],
            ["Location", o.location],
            ["Working mode", o.mode],
            ["Commitment", o.commitment],
            ["Openings", o.openings != null ? String(o.openings) : undefined],
            ["Leads to", o.career_paths.join(", ")],
          ]
            .filter(([, v]) => Boolean(v))
            .map(([label, v]) => (
              <div key={label as string}>
                <dt className="text-ink-faint">{label}</dt>
                <dd className="mt-0.5 font-medium text-ink">{v}</dd>
              </div>
            ))}
        </dl>
      </details>

      {onRemove ? (
        <div className="mt-3 flex justify-end">
          <Button variant="ghost" onClick={onRemove} size="small">
            Remove
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
