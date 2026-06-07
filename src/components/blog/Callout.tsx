import { Info, AlertTriangle, XCircle, Lightbulb } from "lucide-react";

const TYPES = {
  info: { icon: Info, color: "var(--blue)", bg: "rgba(68,136,255,0.06)", border: "rgba(68,136,255,0.25)" },
  warning: { icon: AlertTriangle, color: "#f59e0b", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.25)" },
  danger: { icon: XCircle, color: "var(--red)", bg: "rgba(255,68,68,0.06)", border: "rgba(255,68,68,0.25)" },
  tip: { icon: Lightbulb, color: "var(--green)", bg: "rgba(0,255,136,0.06)", border: "rgba(0,255,136,0.2)" },
};

export function Callout({ type = "info", children }: { type?: keyof typeof TYPES; children: React.ReactNode }) {
  const { icon: Icon, color, bg, border } = TYPES[type] ?? TYPES.info;
  return (
    <div className="my-6 flex gap-3 rounded-lg px-4 py-4" style={{ background: bg, border: `1px solid ${border}` }}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color }} />
      <div className="text-sm leading-relaxed text-[var(--text-muted)] [&>p]:m-0">{children}</div>
    </div>
  );
}
