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

export type StudentProfile = {
  name: string;
  degree: string;
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

export const EMPTY_PROFILE: StudentProfile = {
  name: "",
  degree: "",
  courses: [],
  skills: [],
  projects: [],
  interests: [],
  aspiration: "",
};
