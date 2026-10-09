import type { ReactNode } from "react";

/** **bold** → <strong>. Plain text otherwise (no HTML is ever injected). */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i} className="text-[var(--text)]">{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>,
  );
}

/** Renders the agreement markup from lib/contracts/template.ts: "# ", "## ", "- " and paragraphs. */
export function ContractText({ body }: { body: string }) {
  return (
    <div className="space-y-4 text-[14px] leading-[1.8] text-[var(--text-muted)]">
      {body.split("\n\n").map((block, i) => {
        if (block.startsWith("# ")) return <h2 key={i} className="text-2xl font-semibold text-[var(--text)] text-center pb-2">{block.slice(2)}</h2>;
        if (block.startsWith("## ")) return <h3 key={i} className="pt-4 font-semibold text-[var(--gold)]">{block.slice(3)}</h3>;
        if (block.startsWith("- ")) {
          return (
            <ul key={i} className="list-disc pl-5 space-y-1">
              {block.split("\n").map((line, j) => <li key={j}>{inline(line.replace(/^- /, ""))}</li>)}
            </ul>
          );
        }
        return <p key={i}>{inline(block)}</p>;
      })}
    </div>
  );
}
