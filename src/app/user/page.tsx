"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChipInput, ListInput } from "@/components/ChipInput";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import { Button, Card, Field, PageHeader, Section, inputClass } from "@/components/ui";
import { useStore } from "@/lib/store";
import { BASE_OPPORTUNITIES, MAJORS, MINORS, OCCUPATIONS } from "@/lib/data";
import { LIMITS } from "@/lib/schemas";
import { EMPTY_PROFILE, type StudentProfile } from "@/lib/types";
import { AccessGate } from "./AccessGate";

/** Drawn from the live catalogue so suggestions always reflect what employers ask for. */
const SKILL_SUGGESTIONS = [
  ...new Set(BASE_OPPORTUNITIES.flatMap((o) => [...o.required_skills, ...o.preferred_skills])),
].sort();

const ASPIRATION_SUGGESTIONS = [
  ...new Set([
    ...OCCUPATIONS.map((o) => o.occupation_title.replace(/s$/, "")),
    ...BASE_OPPORTUNITIES.flatMap((o) => o.career_paths),
  ]),
].sort();

const INTEREST_SUGGESTIONS = [
  "Artificial Intelligence",
  "Data Analytics",
  "Robotics",
  "Cybersecurity",
  "Sustainability",
  "Product Design",
  "Manufacturing Technology",
  "Financial Markets",
];

export default function UserPage() {
  const router = useRouter();
  const { hydrated, profile, setProfile, clearProfile, account, signOut } = useStore();
  const [draft, setDraft] = useState<StudentProfile | null>(null);
  const [saved, setSaved] = useState(false);

  // The form is seeded from storage once hydration completes, then owned locally.
  const value = draft ?? profile;
  const update = <K extends keyof StudentProfile>(key: K, next: StudentProfile[K]) => {
    setDraft({ ...value, [key]: next });
    setSaved(false);
  };

  const completeness = useMemo(() => {
    const checks = [
      Boolean(value.major.trim() || value.degree?.trim()),
      value.courses.length > 0,
      value.skills.length > 0,
      value.projects.length > 0,
      value.interests.length > 0,
      Boolean(value.aspiration.trim()),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [value]);

  const canRank =
    Boolean(value.major.trim() || value.degree?.trim() || value.aspiration.trim()) ||
    value.skills.length > 0;

  const save = () => {
    setProfile(value);
    setSaved(true);
  };

  const saveAndRank = () => {
    setProfile(value);
    router.push("/results");
  };

  if (!hydrated) {
    return (
      <>
        <PageHeader eyebrow="Your profile" title="Tell TOE about yourself" />
        <Card className="animate-pulse text-sm text-ink-faint">Loading your saved profile…</Card>
      </>
    );
  }

  // Everything below the gate is only reachable once the access step has been completed.
  if (!account) return <AccessGate />;

  return (
    <>
      <PageHeader
        eyebrow="Your profile"
        title="Tell TOE about yourself"
        lede="Everything here stays in this browser. The more you fill in, the more precisely TOE can rank the opportunities on the floor — but your major and a few skills are enough to start."
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sage/25 bg-sage-tint/60 px-4 py-3">
        <p className="text-xs text-ink-soft">
          Signed in as <span className="font-semibold text-ink">{account.email}</span>
          {account.consentResearch ? " · ratings shared for research" : " · ratings not shared"}
        </p>
        <Button variant="ghost" onClick={signOut} size="small">
          Sign out
        </Button>
      </div>

      {/* Completeness meter */}
      <Card className="flex flex-wrap items-center gap-4">
        <div className="min-w-40 flex-1">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-ink">Profile strength</span>
            <span className="font-display text-sm font-semibold text-rust tabular-nums">
              {completeness}%
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand">
            <div
              className="h-full rounded-full bg-rust transition-[width] duration-300"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>
        <p className="w-full text-xs leading-relaxed text-ink-soft sm:w-auto sm:max-w-xs">
          {completeness === 100
            ? "Complete — every signal TOE uses is filled in."
            : "Projects and interests carry real weight in retrieval. Worth the extra minute."}
        </p>
      </Card>

      <Section title="The basics">
        <Card className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" hint="Optional — used only to personalise this app." htmlFor="name">
            <input
              id="name"
              type="text"
              value={value.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Alex Tan"
              maxLength={LIMITS.shortText}
              autoComplete="name"
              className={inputClass}
            />
          </Field>

          <Field
            label="Major"
            hint="Your primary course. Picked from a list so everyone's answers stay comparable."
            htmlFor="major"
          >
            <select
              id="major"
              value={value.major}
              onChange={(e) => update("major", e.target.value)}
              className={inputClass}
            >
              <option value="">Select your major…</option>
              {MAJORS.map((course) => (
                <option key={course.code} value={course.title}>
                  Course {course.code} — {course.title}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Minor" hint="Optional." htmlFor="minor">
            <select
              id="minor"
              value={value.minor}
              onChange={(e) => update("minor", e.target.value)}
              className={inputClass}
            >
              <option value="">No minor</option>
              {MINORS.map((course) => (
                <option key={course.code} value={course.title}>
                  {course.title}
                </option>
              ))}
            </select>
          </Field>

          <div className="sm:col-span-2">
            <Field
              label="Career aspiration"
              hint="The role you are working towards. This drives the 20% career-alignment component of your match."
              htmlFor="aspiration"
            >
              <input
                id="aspiration"
                type="text"
                value={value.aspiration}
                onChange={(e) => update("aspiration", e.target.value)}
                placeholder="Data Scientist"
                maxLength={LIMITS.shortText}
                list="aspiration-options"
                className={inputClass}
              />
              <datalist id="aspiration-options">
                {ASPIRATION_SUGGESTIONS.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
            </Field>
          </div>
        </Card>
      </Section>

      <Section title="What you can do">
        <Card className="grid gap-6">
          <Field
            label="Skills"
            hint="Tools, languages and methods you can use today. Matched directly against employers' required and preferred skills."
            htmlFor="skills"
          >
            <ChipInput
              id="skills"
              values={value.skills}
              onChange={(next) => update("skills", next)}
              placeholder="Python, SQL, CAD…"
              suggestions={SKILL_SUGGESTIONS}
            />
          </Field>

          <Field
            label="Courses"
            hint="Modules you have completed or are taking."
            htmlFor="courses"
          >
            <ChipInput
              id="courses"
              values={value.courses}
              onChange={(next) => update("courses", next)}
              placeholder="Machine Learning, Control Systems…"
            />
          </Field>

          <Field
            label="Interests"
            hint="Fields you want to work in, even if you have no formal training yet."
            htmlFor="interests"
          >
            <ChipInput
              id="interests"
              values={value.interests}
              onChange={(next) => update("interests", next)}
              placeholder="Robotics, Sustainability…"
              suggestions={INTEREST_SUGGESTIONS}
            />
          </Field>
        </Card>
      </Section>

      <Section title="What you have built">
        <Card>
          <Field
            label="Projects"
            hint="One line each. Describe what you built and what you built it with — this text is retrieved verbatim as evidence."
            htmlFor="projects"
          >
            <ListInput
              id="projects"
              values={value.projects}
              onChange={(next) => update("projects", next)}
              placeholder="Predictive maintenance model using Python and machine learning"
            />
          </Field>
        </Card>
      </Section>

      {/* Actions */}
      <div className="sticky bottom-[calc(var(--dock-height)+0.5rem)] z-20 mt-8">
        <div className="card flex flex-wrap items-center gap-2 p-3 shadow-[0_6px_24px_rgba(42,37,32,0.1)] sm:gap-3 sm:p-4">
          <Button onClick={saveAndRank} disabled={!canRank} size="compact">
            See matches
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
          <Button onClick={save} variant="secondary" disabled={!canRank} size="compact">
            {saved ? (
              <>
                <CheckIcon className="h-4 w-4 text-sage" />
                Saved
              </>
            ) : (
              "Save"
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              clearProfile();
              setDraft(EMPTY_PROFILE);
              setSaved(false);
            }}
            size="compact"
          >
            Clear
          </Button>
          {/* Inside the card, so it sits on the card's background rather than over the
              page content the sticky bar is floating above. */}
          {!canRank ? (
            <p className="w-full text-xs text-ink-soft">
              Pick a major, add an aspiration, or add at least one skill to generate matches.
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
