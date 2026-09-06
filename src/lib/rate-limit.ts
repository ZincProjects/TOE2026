/**
 * A small fixed-window rate limiter.
 *
 * State lives in the memory of one serverless instance, so under Vercel's autoscaling this
 * throttles abuse rather than enforcing a global quota. That is the right trade-off here:
 * the route spends the caller's own DeepSeek key, so the limit exists to blunt scripted
 * hammering, not to meter billing. Swap in a shared store (Vercel KV, Upstash) if this
 * ever needs to be authoritative.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;
/** Bounds memory if a single instance sees many distinct callers. */
const MAX_TRACKED_KEYS = 5_000;

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

export function rateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();

  // Opportunistically drop expired windows so the map does not grow without bound.
  if (windows.size > MAX_TRACKED_KEYS) {
    for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k);
    if (windows.size > MAX_TRACKED_KEYS) windows.clear();
  }

  const existing = windows.get(key);
  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (existing.count >= MAX_REQUESTS) return { allowed: false, remaining: 0 };

  existing.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - existing.count };
}
