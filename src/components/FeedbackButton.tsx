import { ChatIcon, ExternalLinkIcon } from "./icons";
import { getFeedbackFormUrl } from "@/lib/config";

/**
 * A standing prompt to fill in the feedback form, shown once a student has their results.
 *
 * It is deliberately permanent -- there is no dismiss control -- because the feedback it
 * collects is the point of running TOE at the fair. It sits above the bottom tab dock
 * (`--dock-height`) so it never covers the tabs.
 *
 * Renders nothing when no form URL is configured, so a broken link is never shown.
 */
export function FeedbackButton({ side = "right" }: { side?: "left" | "right" }) {
  const url = getFeedbackFormUrl();
  if (!url) return null;

  return (
    <div
      className={`fixed z-30 ${side === "right" ? "right-4 sm:right-6" : "left-4 sm:left-6"}`}
      // Clears the tab dock on every breakpoint.
      style={{ bottom: "calc(var(--dock-height) + 0.75rem)" }}
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-rust-deep/20 bg-rust
                   py-3 pr-4 pl-3.5 text-sm font-semibold text-paper shadow-[0_6px_20px_rgba(42,37,32,0.22)]
                   transition-colors hover:bg-rust-deep"
      >
        <ChatIcon className="h-4 w-4" />
        Give feedback
        <ExternalLinkIcon className="h-3.5 w-3.5 opacity-70" />
        <span className="sr-only">(opens the feedback form in a new tab)</span>
      </a>
    </div>
  );
}
