import { NextResponse } from "next/server";
import { explainRequestSchema } from "@/lib/schemas";
import { SYSTEM_PROMPT, buildPrompt } from "@/lib/rag/context";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
/** Never cached: every response is specific to one request body. */
export const dynamic = "force-dynamic";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const DEFAULT_MODEL = "deepseek-chat";
const UPSTREAM_TIMEOUT_MS = 45_000;
const MAX_BODY_BYTES = 64 * 1024;

const json = (body: unknown, status: number) =>
  NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });

/**
 * Proxies one explanation request to DeepSeek using the caller's own API key.
 *
 * The key is read from the request body, forwarded once, and never logged, cached or
 * persisted. Going through the server rather than calling DeepSeek from the browser
 * keeps the upstream response under our own CSP and avoids relying on their CORS policy.
 */
export async function POST(request: Request) {
  const limit = rateLimit(clientKey(request));
  if (!limit.allowed) {
    return json(
      { error: "Too many explanation requests. Wait a moment and try again." },
      429,
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return json({ error: "Request too large." }, 413);
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json({ error: "Malformed request body." }, 400);
  }

  const parsed = explainRequestSchema.safeParse(raw);
  if (!parsed.success) {
    // Deliberately generic: validation detail would describe the shape of the key field.
    return json({ error: "Invalid request." }, 400);
  }
  const { apiKey, model, context } = parsed.data;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(DEEPSEEK_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || DEFAULT_MODEL,
        temperature: 0.3,
        max_tokens: 700,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildPrompt(context) },
        ],
      }),
    });

    if (!upstream.ok) {
      // Map upstream failures to a safe message; the upstream body may echo the key back.
      const message =
        upstream.status === 401 || upstream.status === 403
          ? "DeepSeek rejected that API key."
          : upstream.status === 429
            ? "DeepSeek is rate-limiting this key. Try again shortly."
            : `DeepSeek returned an error (${upstream.status}).`;
      return json({ error: message }, 502);
    }

    const data = (await upstream.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return json({ error: "DeepSeek returned an empty response." }, 502);

    return json({ text }, 200);
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    return json(
      { error: aborted ? "DeepSeek timed out." : "Could not reach DeepSeek." },
      504,
    );
  } finally {
    clearTimeout(timeout);
  }
}

/** Best-effort caller identity for rate limiting, from the proxy headers Vercel sets. */
function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return ip;
}
