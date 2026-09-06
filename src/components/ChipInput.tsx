"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { CloseIcon, PlusIcon } from "./icons";
import { inputClass } from "./ui";
import { LIMITS } from "@/lib/schemas";

/**
 * Tag-style input for the list fields on a student profile (skills, courses, interests).
 * Entries commit on Enter or comma; Backspace on an empty box removes the last one.
 */
export function ChipInput({
  id,
  values,
  onChange,
  placeholder,
  suggestions = [],
}: {
  id?: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  suggestions?: readonly string[];
}) {
  const [draft, setDraft] = useState("");
  const fallbackId = useId();
  const inputId = id ?? fallbackId;

  const add = (raw: string) => {
    const value = raw.trim().slice(0, LIMITS.shortText);
    if (!value) return;
    const exists = values.some((v) => v.toLowerCase() === value.toLowerCase());
    if (exists || values.length >= LIMITS.listItems) {
      setDraft("");
      return;
    }
    onChange([...values, value]);
    setDraft("");
  };

  const remove = (index: number) => onChange(values.filter((_, i) => i !== index));

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add(draft);
    } else if (event.key === "Backspace" && !draft && values.length) {
      remove(values.length - 1);
    }
  };

  const unused = suggestions.filter(
    (s) => !values.some((v) => v.toLowerCase() === s.toLowerCase()),
  );

  return (
    <div>
      <div className="flex gap-2">
        <input
          id={inputId}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => add(draft)}
          placeholder={placeholder}
          maxLength={LIMITS.shortText}
          autoComplete="off"
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => add(draft)}
          disabled={!draft.trim()}
          aria-label="Add"
          className="shrink-0 rounded-xl border border-line bg-paper px-3 text-ink-soft
                     transition-colors hover:border-rust hover:text-rust
                     disabled:opacity-45 disabled:hover:border-line disabled:hover:text-ink-soft"
        >
          <PlusIcon className="h-4 w-4" />
        </button>
      </div>

      {values.length > 0 ? (
        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {values.map((value, index) => (
            <li key={`${value}-${index}`}>
              <span
                className="inline-flex items-center gap-1 rounded-full bg-rust-tint
                           py-1 pr-1 pl-3 text-xs font-medium text-rust-deep"
              >
                {value}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={`Remove ${value}`}
                  className="rounded-full p-1 transition-colors hover:bg-rust hover:text-paper"
                >
                  <CloseIcon className="h-3 w-3" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {unused.length > 0 ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-ink-faint">Suggestions</span>
          {unused.slice(0, 6).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => add(suggestion)}
              className="rounded-full border border-line px-2.5 py-1 text-xs text-ink-soft
                         transition-colors hover:border-rust hover:text-rust"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Multi-line variant for project descriptions, where entries are sentences. */
export function ListInput({
  id,
  values,
  onChange,
  placeholder,
}: {
  id?: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const fallbackId = useId();
  const inputId = id ?? fallbackId;

  const add = () => {
    const value = draft.trim().slice(0, LIMITS.longText);
    if (!value || values.length >= LIMITS.listItems) return;
    onChange([...values, value]);
    setDraft("");
  };

  return (
    <div>
      <textarea
        id={inputId}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        rows={2}
        maxLength={LIMITS.longText}
        className={`${inputClass} resize-y`}
      />
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim()}
          className="inline-flex items-center gap-1.5 rounded-full border border-line
                     px-3.5 py-1.5 text-xs font-semibold text-ink-soft transition-colors
                     hover:border-rust hover:text-rust disabled:opacity-45"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Add project
        </button>
      </div>

      {values.length > 0 ? (
        <ul className="mt-1 space-y-2">
          {values.map((value, index) => (
            <li
              key={`${value}-${index}`}
              className="flex items-start gap-2 rounded-xl border border-line bg-cream/60 p-3"
            >
              <p className="flex-1 text-sm leading-relaxed text-ink">{value}</p>
              <button
                type="button"
                onClick={() => onChange(values.filter((_, i) => i !== index))}
                aria-label={`Remove project ${index + 1}`}
                className="rounded-full p-1 text-ink-faint transition-colors
                           hover:bg-rust-tint hover:text-rust-deep"
              >
                <CloseIcon className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
