export type Occupation = {
  occupation_code: string;
  occupation_title: string;
  description: string;
  skills: string[];
  knowledge: string[];
  tasks: string[];
  interests: string[];
  source: string;
};

export type Opportunity = {
  opportunity_id: string;
  company: string;
  title: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  career_paths: string[];
  sector?: string;
  location?: string;
  mode?: string;
  commitment?: string;
  openings?: number;
  booth?: string;
  /** True for opportunities submitted through the Industry tab on this device. */
  submitted?: boolean;
  submitted_at?: string;
};

/** One entry in the MIT major / minor dropdowns. */
export type Course = { code: string; title: string };

export type StudentProfile = {
  name: string;
  /** Course title, chosen from the MIT majors list (e.g. "Computer Science and Engineering"). */
  major: string;
  /** Optional second course title, chosen from the MIT minors list. */
  minor: string;
  /**
   * Free-text programme of study. Superseded by `major`/`minor`, and kept only so profiles
   * saved before the dropdowns existed still load and still produce a ranking.
   */
  degree?: string;
  courses: string[];
  skills: string[];
  projects: string[];
  interests: string[];
  aspiration: string;
};

export type RetrievedDoc = {
  id: string;
  type: "occupation" | "opportunity";
  title: string;
  text: string;
  retrieval_score: number;
};

export type RankedOpportunity = {
  opportunity: Opportunity;
  score: number;
  required_fit: number;
  preferred_fit: number;
  occupation_fit: number;
  career_alignment: number;
  /** The O*NET occupation this opportunity's career paths map onto. */
  linked_occupation: { code: string; title: string; similarity: number } | null;
  gaps: string[];
};

/**
 * Records that a student passed the access step and what they agreed to.
 *
 * PLACEHOLDER: nothing here verifies identity. See src/app/user/AccessGate.tsx.
 */
export type Account = {
  email: string;
  verifiedAt: string;
  /** Consent to TOE processing the profile in order to produce a ranking. Required. */
  consentProcessing: boolean;
  /** Consent to anonymised ratings being used in research output. Optional. */
  consentResearch: boolean;
};

/** A student's rating of one AI explanation, collected as survey data. */
export type ExplanationRating = {
  id: string;
  /** Which ranking the explanation described, so ratings can be tied to an output. */
  topOpportunityId: string;
  /** 1-5: how well the explanation matched the student's own sense of the fit. */
  score: number;
  comment: string;
  ratedAt: string;
};

export const EMPTY_PROFILE: StudentProfile = {
  name: "",
  major: "",
  minor: "",
  courses: [],
  skills: [],
  projects: [],
  interests: [],
  aspiration: "",
};
