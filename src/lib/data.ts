import baseOccupations from "@/data/occupations.json";
import baseOpportunities from "@/data/opportunities.json";
import type { Occupation, Opportunity } from "./types";

/**
 * The static catalogue. This module carries no "use client" directive so both server
 * components (the home page) and client components can import the same arrays.
 */
export const OCCUPATIONS = baseOccupations as Occupation[];
export const BASE_OPPORTUNITIES = baseOpportunities as Opportunity[];
