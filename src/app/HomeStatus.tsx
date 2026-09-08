"use client";

import { ButtonLink } from "@/components/ui";
import { ArrowRightIcon, CheckIcon } from "@/components/icons";
import { useStore } from "@/lib/store";

/**
 * A short "you are here" strip on the home page. It only renders once local state has
 * hydrated, so the server-rendered markup does not disagree with the client.
 */
export function HomeStatus() {
  const { hydrated, profile, profileReady } = useStore();
  if (!hydrated || !profileReady) return null;

  const name = profile.name.trim();

  return (
    <div
      className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl
                 border border-sage/25 bg-sage-tint/70 px-5 py-4"
    >
      <p className="flex items-center gap-2.5 text-sm text-ink">
        <CheckIcon className="h-4 w-4 shrink-0 text-sage" />
        <span>
          {name ? `${name}, your` : "Your"} profile is saved on this device
          {profile.aspiration ? (
            <>
              {" "}
              — aiming for <span className="font-semibold">{profile.aspiration}</span>
            </>
          ) : null}
          .
        </span>
      </p>
      <ButtonLink href="/results" size="small">
        View matches
        <ArrowRightIcon className="h-3.5 w-3.5" />
      </ButtonLink>
    </div>
  );
}
