"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

/**
 * Site-wide replacements for window.confirm() and alert():
 *  - useConfirm(): an accessible <dialog> that resolves to true/false.
 *  - useToast():   a short success or error message after an action.
 */

type ConfirmOptions = {
  title: string;
  body?: ReactNode;
  /** Plain words for what will happen, e.g. "Delete post". Never "OK". */
  confirmLabel: string;
  cancelLabel?: string;
  /** Red button that needs a second click. */
  destructive?: boolean;
};

type Toast = { id: number; text: string; tone: "success" | "error" };

const ConfirmContext = createContext<((o: ConfirmOptions) => Promise<boolean>) | null>(null);
const ToastContext = createContext<((text: string, tone?: Toast["tone"]) => void) | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used inside <FeedbackProvider>");
  return ctx;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <FeedbackProvider>");
  return ctx;
}

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const confirm = useCallback(
    (options: ConfirmOptions) => new Promise<boolean>((resolve) => setRequest({ ...options, resolve })),
    [],
  );

  const toast = useCallback((text: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "error" ? 8000 : 5000);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      <ToastContext.Provider value={toast}>
        {children}
        {request && (
          <ConfirmDialog
            key={request.title}
            {...request}
            onClose={(ok) => {
              request.resolve(ok);
              setRequest(null);
            }}
          />
        )}
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[min(92vw,360px)]">
          {toasts.map((t) => (
            <div
              key={t.id}
              role={t.tone === "error" ? "alert" : "status"}
              className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg bg-[#121212] ${t.tone === "error" ? "border-[rgba(255,68,68,0.4)] text-[var(--text)]" : "border-[rgba(212,160,23,0.35)] text-[var(--text)]"}`}
            >
              {t.tone === "error" ? <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-[var(--red)]" /> : <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-[var(--green)]" />}
              <span className="flex-1">{t.text}</span>
              <button type="button" aria-label="Dismiss" onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))} className="text-[var(--text-muted)] hover:text-[var(--text)]">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </ToastContext.Provider>
    </ConfirmContext.Provider>
  );
}

function ConfirmDialog({ title, body, confirmLabel, cancelLabel = "Cancel", destructive, onClose }: ConfirmOptions & { onClose: (ok: boolean) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    // Remember the button that opened the dialog so focus goes back to it afterwards.
    const trigger = document.activeElement as HTMLElement | null;
    // showModal() makes the rest of the page inert (focus stays in the dialog) and Escape fires "cancel".
    dialog?.showModal();
    // Safer default for destructive actions: focus starts on Cancel.
    (destructive ? cancelRef : confirmRef).current?.focus();
    return () => {
      if (dialog?.open) dialog.close();
      trigger?.focus?.();
    };
  }, [destructive]);

  const onConfirm = () => {
    if (destructive && !armed) {
      setArmed(true);
      return;
    }
    onClose(true);
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      aria-describedby={body ? "confirm-body" : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onClose(false);
      }}
      onClick={(e) => {
        // A click on the backdrop (the dialog element itself, outside its content) cancels.
        if (e.target === ref.current) onClose(false);
      }}
      onKeyDown={(e) => {
        // Keep Tab cycling inside the dialog. The native <dialog> lets focus leave to the
        // browser's own toolbar after the last button.
        if (e.key !== "Tab") return;
        const items = [cancelRef.current, confirmRef.current].filter(Boolean) as HTMLElement[];
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }}
      className="m-auto w-[min(92vw,440px)] rounded-xl border border-[var(--border)] bg-[#111111] p-0 text-[var(--text)] backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <h2 id="confirm-title" className="font-display text-lg font-semibold">{title}</h2>
        {body && <div id="confirm-body" className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{body}</div>}
        {destructive && armed && <p role="status" className="mt-3 text-xs text-[var(--red)]">Click again to confirm. This can&apos;t be undone.</p>}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button ref={cancelRef} type="button" onClick={() => onClose(false)} className="btn-ghost btn-no-arrow">
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={destructive ? "btn-danger" : "btn-gold"}
          >
            {destructive && armed ? `Yes, ${confirmLabel.toLowerCase()}` : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
