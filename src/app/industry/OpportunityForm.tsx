"use client";

import { useState } from "react";
import { ChipInput } from "@/components/ChipInput";
import { CheckIcon, CloseIcon } from "@/components/icons";
import { Button, Card, Field, inputClass } from "@/components/ui";
import { LIMITS, opportunityFormSchema, type OpportunityFormValues } from "@/lib/schemas";
import { useStore } from "@/lib/store";

const EMPTY: OpportunityFormValues = {
  company: "",
  title: "",
  description: "",
  required_skills: [],
  preferred_skills: [],
  career_paths: [],
  sector: "",
  location: "",
  mode: "On-site",
  commitment: "Internship · 6 months",
  openings: 1,
  booth: "",
};

const MODES = ["On-site", "Hybrid", "Remote"];

/** Lets an exhibitor add a role to the catalogue. Demo-only: it is saved in this browser. */
export function OpportunityForm({ onDone }: { onDone: () => void }) {
  const { addOpportunity } = useStore();
  const [values, setValues] = useState<OpportunityFormValues>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const set = <K extends keyof OpportunityFormValues>(key: K, next: OpportunityFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: next }));

  const submit = () => {
    const parsed = opportunityFormSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    addOpportunity({
      ...parsed.data,
      opportunity_id: `SUB-${Date.now().toString(36).toUpperCase()}`,
      submitted: true,
      submitted_at: new Date().toISOString(),
    });
    setDone(true);
  };

  if (done) {
    return (
      <Card className="border-sage/30 bg-sage-tint/60">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
          <CheckIcon className="h-5 w-5 text-sage" />
          Opportunity posted
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          <span className="font-medium text-ink">{values.title}</span> at{" "}
          <span className="font-medium text-ink">{values.company}</span> is now in the catalogue and
          is being scored against student profiles. For this demo it is stored in your browser
          rather than on a server.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              setValues(EMPTY);
              setDone(false);
            }}
          >
            Post another
          </Button>
          <Button variant="ghost" onClick={onDone}>
            Done
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-ink">Post an opportunity</h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            Required skills and career paths are what the matching engine scores against, so be
            specific with both.
          </p>
        </div>
        <button
          type="button"
          onClick={onDone}
          aria-label="Close form"
          className="rounded-full p-2 text-ink-faint transition-colors hover:bg-rust-tint hover:text-rust-deep"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      <form
        className="mt-6 grid gap-5 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Field label="Company" error={errors.company} htmlFor="f-company">
          <input
            id="f-company"
            value={values.company}
            onChange={(e) => set("company", e.target.value)}
            maxLength={LIMITS.shortText}
            placeholder="Acme Robotics"
            className={inputClass}
          />
        </Field>

        <Field label="Role title" error={errors.title} htmlFor="f-title">
          <input
            id="f-title"
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            maxLength={LIMITS.shortText}
            placeholder="Machine Learning Intern"
            className={inputClass}
          />
        </Field>

        <div className="sm:col-span-2">
          <Field
            label="Description"
            hint="A sentence or two on what the student would actually do."
            error={errors.description}
            htmlFor="f-description"
          >
            <textarea
              id="f-description"
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              maxLength={LIMITS.longText}
              placeholder="Build and evaluate models for real-time defect detection on the production line."
              className={`${inputClass} resize-y`}
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field
            label="Required skills"
            hint="Scored at 35% of the match. Students missing these are shown a skill gap."
            error={errors.required_skills}
            htmlFor="f-required"
          >
            <ChipInput
              id="f-required"
              values={values.required_skills}
              onChange={(next) => set("required_skills", next)}
              placeholder="Python, PyTorch…"
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label="Preferred skills" hint="Scored at 15%." htmlFor="f-preferred">
            <ChipInput
              id="f-preferred"
              values={values.preferred_skills}
              onChange={(next) => set("preferred_skills", next)}
              placeholder="Computer Vision, Docker…"
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field
            label="Career paths this role leads to"
            hint="Matched against each student's stated aspiration, worth 20%."
            error={errors.career_paths}
            htmlFor="f-paths"
          >
            <ChipInput
              id="f-paths"
              values={values.career_paths}
              onChange={(next) => set("career_paths", next)}
              placeholder="Machine Learning Engineer…"
            />
          </Field>
        </div>

        <Field label="Sector" htmlFor="f-sector">
          <input
            id="f-sector"
            value={values.sector}
            onChange={(e) => set("sector", e.target.value)}
            maxLength={LIMITS.shortText}
            placeholder="Robotics & Automation"
            className={inputClass}
          />
        </Field>

        <Field label="Location" htmlFor="f-location">
          <input
            id="f-location"
            value={values.location}
            onChange={(e) => set("location", e.target.value)}
            maxLength={LIMITS.shortText}
            placeholder="one-north"
            className={inputClass}
          />
        </Field>

        <Field label="Working mode" htmlFor="f-mode">
          <select
            id="f-mode"
            value={values.mode}
            onChange={(e) => set("mode", e.target.value)}
            className={inputClass}
          >
            {MODES.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Field>

        <Field label="Commitment" htmlFor="f-commitment">
          <input
            id="f-commitment"
            value={values.commitment}
            onChange={(e) => set("commitment", e.target.value)}
            maxLength={LIMITS.shortText}
            className={inputClass}
          />
        </Field>

        <Field label="Openings" htmlFor="f-openings">
          <input
            id="f-openings"
            type="number"
            min={0}
            max={9999}
            value={values.openings}
            onChange={(e) => set("openings", Number(e.target.value) || 0)}
            className={inputClass}
          />
        </Field>

        <Field label="Booth" hint="Optional — helps students find you." htmlFor="f-booth">
          <input
            id="f-booth"
            value={values.booth}
            onChange={(e) => set("booth", e.target.value)}
            maxLength={32}
            placeholder="E12"
            className={inputClass}
          />
        </Field>

        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <Button type="submit">Post opportunity</Button>
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
