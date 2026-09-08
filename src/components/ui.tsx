import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
}) {
  return (
    <header className="pt-8 pb-6 sm:pt-12 lg:pt-16">
      <p className="text-xs font-semibold tracking-[0.18em] text-rust uppercase">{eyebrow}</p>
      <h1 className="mt-3 font-display text-3xl leading-[1.1] font-semibold text-ink sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      {lede ? (
        <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft sm:text-base">
          {lede}
        </p>
      ) : null}
    </header>
  );
}

export function Section({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="mt-8 sm:mt-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink sm:text-2xl">{title}</h2>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Card({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
}) {
  return <Tag className={`card p-5 sm:p-6 ${className}`}>{children}</Tag>;
}

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

/**
 * Border *width* is in the base and only the colour varies, so every variant has the same
 * box and buttons sitting side by side line up exactly. (Putting `border-transparent` in the
 * base instead would collide with the bordered variants, since Tailwind does not resolve
 * conflicting utilities by source order.)
 */
const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-rust text-paper hover:bg-rust-deep disabled:hover:bg-rust",
  secondary: "border-line bg-paper text-ink hover:border-rust hover:text-rust",
  ghost: "border-transparent text-ink-soft hover:text-rust hover:bg-rust-tint",
  danger: "border-rust-tint bg-paper text-rust-deep hover:bg-rust-tint",
};

/**
 * Padding lives in the size map rather than the base string: Tailwind does not resolve
 * conflicting utilities by source order, so a `px-4` passed through `className` would not
 * reliably beat a `px-5` baked into the base.
 */
type ButtonSize = "default" | "compact" | "small";

const BUTTON_SIZES: Record<ButtonSize, string> = {
  default: "px-5 py-3",
  compact: "px-3.5 py-2.5",
  small: "px-3 py-1.5 text-xs",
};

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border " +
  "text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55";

export function Button({
  variant = "primary",
  size = "default",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      {...props}
      className={`${BUTTON_BASE} ${BUTTON_SIZES[size]} ${BUTTON_STYLES[variant]} ${className}`}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "default",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <Link
      {...props}
      className={`${BUTTON_BASE} ${BUTTON_SIZES[size]} ${BUTTON_STYLES[variant]} ${className}`}
    />
  );
}

type Tone = "rust" | "sage" | "amber" | "neutral";

const TONE_STYLES: Record<Tone, string> = {
  rust: "bg-rust-tint text-rust-deep",
  sage: "bg-sage-tint text-sage",
  amber: "bg-amber-tint text-amber",
  neutral: "bg-sand text-ink-soft",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1
                  text-xs font-medium ${TONE_STYLES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** A labelled percentage bar used for the four match sub-scores. */
export function ScoreBar({
  label,
  value,
  tone = "rust",
}: {
  label: string;
  value: number;
  tone?: Tone;
}) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  const fill = { rust: "bg-rust", sage: "bg-sage", amber: "bg-amber", neutral: "bg-ink-faint" }[
    tone
  ];
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-ink-soft">{label}</span>
        <span className="font-display text-sm font-semibold text-ink tabular-nums">{percent}%</span>
      </div>
      <div
        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sand"
        role="img"
        aria-label={`${label}: ${percent} percent`}
      >
        <div className={`h-full rounded-full ${fill}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Card className="text-center">
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">{children}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </Card>
  );
}

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      {hint ? <p className="mt-1 text-xs leading-relaxed text-ink-soft">{hint}</p> : null}
      <div className="mt-2">{children}</div>
      {error ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-rust-deep">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm text-ink " +
  "placeholder:text-ink-faint focus:border-rust focus:outline-none";
