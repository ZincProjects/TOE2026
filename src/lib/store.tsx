"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { EMPTY_PROFILE, type Opportunity, type StudentProfile } from "./types";
import { parseProfile, parseSubmittedOpportunities } from "./schemas";
import { BASE_OPPORTUNITIES } from "./data";

const PROFILE_KEY = "toe.profile.v1";
const OPPORTUNITIES_KEY = "toe.submitted-opportunities.v1";
/**
 * The DeepSeek key lives in sessionStorage, never localStorage: it is scoped to the
 * one tab and is discarded when that tab closes. It is never written to a cookie,
 * a URL, or any server-side store.
 */
const KEY_STORAGE = "toe.deepseek-key.v1";

type State = {
  hydrated: boolean;
  profile: StudentProfile;
  submitted: Opportunity[];
  deepseekKey: string;
};

/**
 * Browser storage is an external system, so it is modelled as one: a module-level
 * snapshot plus subscribers, read through useSyncExternalStore. Reading it during the
 * first client render would disagree with the server-rendered markup, so the server
 * snapshot is empty and hydration happens once, after the first subscriber commits.
 */
const SERVER_SNAPSHOT: State = {
  hydrated: false,
  profile: EMPTY_PROFILE,
  submitted: [],
  deepseekKey: "",
};

let snapshot: State = SERVER_SNAPSHOT;
let hydrationStarted = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function patch(next: Partial<State>) {
  snapshot = { ...snapshot, ...next };
  emit();
}

function readLocal<T>(key: string, parse: (raw: unknown) => T, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return parse(JSON.parse(raw));
  } catch {
    // Corrupt or unreadable storage (private mode, cleared data) falls back to defaults.
    return fallback;
  }
}

function persist(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Quota or blocked storage: the in-memory snapshot is still correct for this session. */
  }
}

function hydrate() {
  let deepseekKey = "";
  try {
    deepseekKey = window.sessionStorage.getItem(KEY_STORAGE) ?? "";
  } catch {
    /* sessionStorage can throw when site data is blocked; the key stays in memory. */
  }
  patch({
    hydrated: true,
    profile: readLocal(PROFILE_KEY, parseProfile, EMPTY_PROFILE),
    submitted: readLocal(OPPORTUNITIES_KEY, parseSubmittedOpportunities, []),
    deepseekKey,
  });
}

/** Keeps two tabs of the same app in step when either writes a profile or an opportunity. */
function onStorageEvent(event: StorageEvent) {
  if (event.key === PROFILE_KEY) {
    patch({ profile: readLocal(PROFILE_KEY, parseProfile, EMPTY_PROFILE) });
  } else if (event.key === OPPORTUNITIES_KEY) {
    patch({ submitted: readLocal(OPPORTUNITIES_KEY, parseSubmittedOpportunities, []) });
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!hydrationStarted) {
    hydrationStarted = true;
    window.addEventListener("storage", onStorageEvent);
    hydrate();
  }
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => snapshot;
const getServerSnapshot = () => SERVER_SNAPSHOT;

export function useStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setProfile = useCallback((profile: StudentProfile) => {
    patch({ profile });
    persist(PROFILE_KEY, profile);
  }, []);

  const clearProfile = useCallback(() => {
    patch({ profile: EMPTY_PROFILE });
    try {
      window.localStorage.removeItem(PROFILE_KEY);
    } catch {
      /* Nothing to do if storage is unavailable. */
    }
  }, []);

  const addOpportunity = useCallback((opportunity: Opportunity) => {
    const submitted = [opportunity, ...snapshot.submitted];
    patch({ submitted });
    persist(OPPORTUNITIES_KEY, submitted);
  }, []);

  const removeOpportunity = useCallback((id: string) => {
    const submitted = snapshot.submitted.filter((o) => o.opportunity_id !== id);
    patch({ submitted });
    persist(OPPORTUNITIES_KEY, submitted);
  }, []);

  const setDeepseekKey = useCallback((deepseekKey: string) => {
    patch({ deepseekKey });
    try {
      if (deepseekKey) window.sessionStorage.setItem(KEY_STORAGE, deepseekKey);
      else window.sessionStorage.removeItem(KEY_STORAGE);
    } catch {
      /* Key remains in memory for this page only. */
    }
  }, []);

  const opportunities = useMemo(
    () => [...state.submitted, ...BASE_OPPORTUNITIES],
    [state.submitted],
  );

  /** True once the profile holds enough signal to produce a ranking. */
  const profileReady = useMemo(() => {
    const p = state.profile;
    return Boolean(
      p.degree.trim() ||
        p.aspiration.trim() ||
        p.skills.length ||
        p.courses.length ||
        p.interests.length,
    );
  }, [state.profile]);

  return {
    hydrated: state.hydrated,
    profile: state.profile,
    submitted: state.submitted,
    deepseekKey: state.deepseekKey,
    opportunities,
    profileReady,
    setProfile,
    clearProfile,
    addOpportunity,
    removeOpportunity,
    setDeepseekKey,
  };
}
