"use client";

import { ChatIcon, CloseIcon, ExternalLinkIcon } from "./icons";
import { getFeedbackFormUrl } from "@/lib/config";
import { useStore } from "@/lib/store";

/**
 * A floating prompt to fill in the feedback form, shown once a student has their results.
 *
 * It sits above the bottom tab dock (`--dock-height`) so it never covers the tabs, and can
 * be dismissed -- a nudge that cannot be closed just gets in the way of the rankings it is
 * asking about. Dismissal is remembered so it does not nag on every visit.
 *
 * Renders nothing when no form URL is configured, so a broken link is never shown.
 */
export function FeedbackButton({ side = "right" }: { side?: "left" | "right" }) {
  const url = getFeedbackFormUrl();
  const { hydrated, feedbackDismissed, dismissFeedback } = useStore();

  // Held back until storage has been read, so the prompt never flashes in and out for a
  // student who already dismissed it.
  if (!url || !hydrated || feedbackDismissed) return null;

  const dismiss = dismissFeedback;

  return (
    <div
      className={`fixed z-30 flex items-center gap-1.5 ${
        side === "right" ? "right-4 sm:right-6" : "left-4 sm:left-6"
      }`}
      // Clears the tab dock on every breakpoint.
      style={{ bottom: "calc(var(--dock-height) + 0.75rem)" }}
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={dismiss}
        className="inline-flex items-center gap-2 rounded-full border border-rust-deep/20 bg-rust
                   py-3 pr-4 pl-3.5 text-sm font-semibold text-paper shadow-[0_6px_20px_rgba(42,37,32,0.22)]
                   transition-colors hover:bg-rust-deep"
      >
        <ChatIcon className="h-4 w-4" />
        Give feedback
        <ExternalLinkIcon className="h-3.5 w-3.5 opacity-70" />
        <span className="sr-only">(opens the feedback form in a new tab)</span>
      </a>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss the feedback prompt"
        className="rounded-full border border-line bg-paper p-2 text-ink-faint
                   shadow-[0_4px_14px_rgba(42,37,32,0.16)] transition-colors
                   hover:bg-rust-tint hover:text-rust-deep"
      >
        <CloseIcon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
