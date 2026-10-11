"use client";

import { useEffect, type RefObject } from "react";

/**
 * Inline form error, shown under its field. Give the field aria-invalid and
 * aria-describedby={fieldErrorId(name)} so screen readers read the message with it.
 */
export const fieldErrorId = (name: string) => `${name}-error`;

export function FieldError({ name, message }: { name: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={fieldErrorId(name)} className="mt-1.5 text-xs text-[var(--red)]">
      {message}
    </p>
  );
}

/** Moves focus to the first field marked aria-invalid in the form. Call after rendering errors. */
export function focusFirstInvalid(form: HTMLFormElement | null) {
  requestAnimationFrame(() => {
    const el = form?.querySelector<HTMLElement>('[aria-invalid="true"]');
    el?.focus();
  });
}

/** Props that wire a field to its inline error. */
export function invalidProps(name: string, message?: string) {
  return message ? { "aria-invalid": true as const, "aria-describedby": fieldErrorId(name) } : {};
}

/** Focuses the first invalid field whenever `trigger` changes (e.g. a server action's result). */
export function useFocusFirstInvalid(formRef: RefObject<HTMLFormElement | null>, trigger: unknown) {
  useEffect(() => {
    if (trigger) focusFirstInvalid(formRef.current);
  }, [formRef, trigger]);
}
