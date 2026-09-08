/**
 * Deployment configuration that is safe to expose to the browser.
 */

/**
 * ===================== PASTE THE FEEDBACK GOOGLE FORM LINK HERE =====================
 *
 * The floating "Give feedback" button on the Results tab opens this URL in a new tab.
 * While it is empty the button does not render at all, so students are never shown a
 * link that goes nowhere.
 *
 * Either paste the form's share URL below, or set NEXT_PUBLIC_FEEDBACK_FORM_URL in the
 * Vercel project (the environment variable wins). Use the "Send > link" URL from Google
 * Forms, which looks like:
 *
 *   https://docs.google.com/forms/d/e/1FAIpQLSc.../viewform
 * ====================================================================================
 */
const FEEDBACK_FORM_URL_FALLBACK = "https://forms.gle/qyLogZBQAXP4RvXa8";

/**
 * Returns the feedback form URL, or null when none is configured or the configured value
 * is not a plain http(s) URL.
 *
 * The value can be set by whoever deploys the app, so it is parsed rather than trusted:
 * this is what stops a stray `javascript:` or `data:` value from becoming a live link in
 * the page.
 */
export function getFeedbackFormUrl(): string | null {
  const raw = (process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL || FEEDBACK_FORM_URL_FALLBACK).trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}
