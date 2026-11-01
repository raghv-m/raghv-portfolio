import type { CSSProperties, ReactNode } from "react";

/**
 * Inner-page head in the dossier system: mono file kicker, oversized display
 * title, plain lede. Entrance uses the shared load sequence (rise + stagger).
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
      <h1 className="cf-load" style={{ "--cf-d": "0.08s" } as CSSProperties}>
        {title}
      </h1>
      {lede ? (
        <div className="cf-lede cf-load" style={{ "--cf-d": "0.18s" } as CSSProperties}>
          {lede}
        </div>
      ) : null}
      {children}
    </header>
  );
}
