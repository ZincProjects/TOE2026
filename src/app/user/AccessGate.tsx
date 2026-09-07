"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Card } from "@/components/ui";
import { AlertIcon, CheckIcon } from "@/components/icons";
import { inputClass } from "@/components/ui";
import { useStore } from "@/lib/store";
import { LIMITS } from "@/lib/schemas";

/**
 * ============================ PLACEHOLDER - NOT REAL AUTHENTICATION ============================
 *
 * This gate exists so the sign-in and consent step can be designed, reviewed and wired into the
 * rest of the app. It does NOT verify that anyone is who they say they are: it checks the shape
 * of an email address and records the answer in this browser. Anyone can type any @mit.edu
 * address, and clearing site data resets it.
 *
 * Before the fair this must be replaced with real institutional sign-in (MIT Touchstone / OIDC),
 * with the session established server-side. The consent copy below is placeholder text and has
 * NOT been reviewed — it needs to be written by whoever owns the privacy notice, and the
 * research-consent wording will need COUHES review before ratings can be used in a publication.
 *
 * The component boundary is deliberately narrow so the swap is contained: real auth needs to
 * produce the same `Account` object and call `setAccount`.
 * ==============================================================================================
 */

const MIT_EMAIL = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)*mit\.edu$/;

export function AccessGate() {
  const { setAccount } = useStore();
  const [email, setEmail] = useState("");
  const [consentProcessing, setConsentProcessing] = useState(false);
  const [consentResearch, setConsentResearch] = useState(false);
  const [error, setError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  // The gate replaces the whole page, so move focus to it rather than leaving focus adrift.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const submit = () => {
    const value = email.trim();
    if (!MIT_EMAIL.test(value)) {
      setError("Enter your MIT email address (ending in @mit.edu).");
      return;
    }
    if (!consentProcessing) {
      setError("You need to agree to the first item before continuing.");
      return;
    }
    setError("");
    setAccount({
      email: value,
      verifiedAt: new Date().toISOString(),
      consentProcessing,
      consentResearch,
    });
  };

  return (
    <div className="py-8 sm:py-12">
      <Card className="mx-auto max-w-xl">
        <p className="text-xs font-semibold tracking-[0.16em] text-rust uppercase">
          Student access
        </p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mt-3 font-display text-2xl leading-tight font-semibold text-ink sm:text-3xl"
        >
          Sign in to build your profile
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          TOE is open to enrolled MIT students. Signing in keeps the profile data accurate, which
          is what makes the rankings — and the research behind them — meaningful.
        </p>

        {/* Standing notice: this must not be mistaken for a working access control. */}
        <p className="mt-5 flex items-start gap-2 rounded-xl bg-amber-tint px-4 py-3 text-xs leading-relaxed text-amber">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <span className="font-semibold">Placeholder step.</span> Identity is not verified yet
            and the wording below is draft text. MIT Touchstone sign-in and the reviewed privacy
            and consent notices are still to be added.
          </span>
        </p>

        <div className="mt-6">
          <label htmlFor="mit-email" className="block text-sm font-semibold text-ink">
            MIT email address
          </label>
          <p className="mt-1 text-xs text-ink-soft">
            Used to keep one profile per student. It is stored on this device only and is never
            sent with your ranking or to DeepSeek.
          </p>
          <input
            id="mit-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="kerberos@mit.edu"
            maxLength={LIMITS.shortText}
            className={`${inputClass} mt-2`}
          />
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-ink">Before you continue</legend>
          <div className="mt-3 space-y-3">
            <Consent
              id="consent-processing"
              checked={consentProcessing}
              onChange={(v) => {
                setConsentProcessing(v);
                setError("");
              }}
              required
            >
              I agree to TOE using the profile I enter to generate opportunity recommendations for
              me.{" "}
              <span className="text-ink-faint">
                [Placeholder — replace with the approved processing notice: what is collected, the
                lawful basis, retention period, and who to contact.]
              </span>
            </Consent>

            <Consent
              id="consent-research"
              checked={consentResearch}
              onChange={setConsentResearch}
            >
              I agree to my ratings of the AI explanations being analysed anonymously and included
              in published research about TOE.{" "}
              <span className="text-ink-faint">
                [Placeholder — replace with the approved research-participation and withdrawal
                notice. Optional: you can use TOE either way.]
              </span>
            </Consent>
          </div>
        </fieldset>

        {error ? (
          <p role="alert" className="mt-4 text-xs font-medium text-rust-deep">
            {error}
          </p>
        ) : null}

        <Button onClick={submit} className="mt-6 w-full sm:w-auto">
          <CheckIcon className="h-4 w-4" />
          Continue to my profile
        </Button>

        <p className="mt-4 text-xs leading-relaxed text-ink-faint">
          Full privacy notice and terms to be linked here.
        </p>
      </Card>
    </div>
  );
}

function Consent({
  id,
  checked,
  onChange,
  required,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-cream/50 p-3.5"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-rust)]"
      />
      <span className="text-xs leading-relaxed text-ink-soft">
        {children}
        {required ? <span className="ml-1 font-semibold text-rust-deep">Required.</span> : null}
      </span>
    </label>
  );
}
