import { z } from "zod";
import { EMPTY_PROFILE, type Opportunity, type StudentProfile } from "./types";
import { stripControlChars } from "./sanitize";

/**
 * Every field is length-bounded. These caps do double duty: they keep a pasted wall of
 * text out of the LLM prompt, and they bound the work any single request can ask the
 * server to do.
 */
export const LIMITS = {
  shortText: 120,
  longText: 400,
  listItems: 40,
  contextChars: 24_000,
} as const;

/** Strips control characters, which have no place in a profile and can confuse prompts. */
const clean = (max: number) =>
  z
    .string()
    .max(max)
    .transform((s) => stripControlChars(s).trim());

const stringList = (max: number) =>
  z.array(clean(max)).max(LIMITS.listItems).transform((xs) => xs.filter(Boolean));

export const profileSchema = z.object({
  name: clean(LIMITS.shortText),
  degree: clean(LIMITS.shortText),
  courses: stringList(LIMITS.shortText),
  skills: stringList(LIMITS.shortText),
  projects: stringList(LIMITS.longText),
  interests: stringList(LIMITS.shortText),
  aspiration: clean(LIMITS.shortText),
});

export const opportunitySchema = z.object({
  opportunity_id: clean(64),
  company: clean(LIMITS.shortText),
  title: clean(LIMITS.shortText),
  description: clean(LIMITS.longText),
  required_skills: stringList(LIMITS.shortText),
  preferred_skills: stringList(LIMITS.shortText),
  career_paths: stringList(LIMITS.shortText),
  sector: clean(LIMITS.shortText).optional(),
  location: clean(LIMITS.shortText).optional(),
  mode: clean(LIMITS.shortText).optional(),
  commitment: clean(LIMITS.shortText).optional(),
  openings: z.number().int().min(0).max(9999).optional(),
  booth: clean(32).optional(),
  submitted: z.boolean().optional(),
  submitted_at: clean(40).optional(),
});

/** Shape the "post an opportunity" form must satisfy before it can be saved. */
export const opportunityFormSchema = z.object({
  company: clean(LIMITS.shortText).pipe(z.string().min(2, "Company name is required")),
  title: clean(LIMITS.shortText).pipe(z.string().min(2, "Role title is required")),
  description: clean(LIMITS.longText).pipe(
    z.string().min(20, "Give students at least a sentence or two about the role"),
  ),
  required_skills: stringList(LIMITS.shortText).pipe(
    z.array(z.string()).min(1, "Add at least one required skill"),
  ),
  preferred_skills: stringList(LIMITS.shortText),
  career_paths: stringList(LIMITS.shortText).pipe(
    z.array(z.string()).min(1, "Add at least one career path this role leads to"),
  ),
  sector: clean(LIMITS.shortText),
  location: clean(LIMITS.shortText),
  mode: clean(LIMITS.shortText),
  commitment: clean(LIMITS.shortText),
  openings: z.number().int().min(0).max(9999),
  booth: clean(32),
});

export type OpportunityFormValues = z.input<typeof opportunityFormSchema>;

/** Request body accepted by POST /api/explain. */
export const explainRequestSchema = z.object({
  apiKey: z.string().min(8).max(200),
  model: z
    .string()
    .max(60)
    // Model names are echoed to DeepSeek; keep them to a conservative character set.
    .regex(/^[a-zA-Z0-9._-]+$/, "Invalid model name")
    .optional(),
  context: z.string().min(1).max(LIMITS.contextChars),
});

export function parseProfile(raw: unknown): StudentProfile {
  const result = profileSchema.safeParse(raw);
  return result.success ? result.data : EMPTY_PROFILE;
}

export function parseSubmittedOpportunities(raw: unknown): Opportunity[] {
  const result = z.array(opportunitySchema).max(200).safeParse(raw);
  return result.success ? (result.data as Opportunity[]) : [];
}
