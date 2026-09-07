import baseOccupations from "@/data/occupations.json";
import baseOpportunities from "@/data/opportunities.json";
import mitCourses from "@/data/mit-courses.json";
import type { Course, Occupation, Opportunity } from "./types";

/**
 * The static catalogue. This module carries no "use client" directive so both server
 * components (the home page) and client components can import the same arrays.
 */
export const OCCUPATIONS = baseOccupations as Occupation[];
export const BASE_OPPORTUNITIES = baseOpportunities as Opportunity[];

/**
 * MIT majors and minors for the profile dropdowns. Choosing from a fixed list rather than
 * free text is what keeps the data comparable -- otherwise the same course arrives as
 * "6-3", "Course 6-3", "CS" and "computer science" across different students.
 *
 * The profile stores the course *title*, not the number: TF-IDF retrieval matches on words,
 * and "6-3" has nothing in common with an O*NET occupation description. The number is still
 * shown in the dropdown label for recognition, and is recoverable from this list.
 */
export const MAJORS = mitCourses.majors as Course[];
export const MINORS = mitCourses.minors as Course[];
