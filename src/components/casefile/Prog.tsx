/**
 * The in-progress indicator: a small rotating ring plus three stepping dots,
 * rendered in the stamp's own ink (currentColor). Pure CSS. Under
 * prefers-reduced-motion the case-file kill switch freezes it solid — the
 * status still reads, nothing pulses.
 */
export function ProgIndicator() {
  return (
    <span className="cf-prog" aria-hidden="true">
      <span className="cf-prog-ring" />
      <span className="cf-prog-dots">
        <i />
        <i />
        <i />
      </span>
    </span>
  );
}
