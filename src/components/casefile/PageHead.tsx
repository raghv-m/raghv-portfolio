import type { CSSProperties, ReactNode } from "react";

/**
 * Inner-page head in the dossier system: mono file kicker, oversized display
 * title, plain lede. Entrance is the shared load sequence (blur-to-sharp
 * rise, 75ms stagger steps): it starts at navigation time and runs
 * concurrently with the page transition, so the heading arrives WITH the
 * page instead of fading in after it.
 */
export function PageHead({
  kicker,
  title,
  lede,
  children,
}: {
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="cf-pagehead">
      <p className="cf-kicker cf-load">{kicker}</p>
      <h1 className="cf-load" style={{ "--cf-d": "0.075s" } as CSSProperties}>
        {title}
      </h1>
      {lede ? (
        <div className="cf-lede cf-load" style={{ "--cf-d": "0.15s" } as CSSProperties}>
          {lede}
        </div>
      ) : null}
      {children}
    </header>
  );
}
