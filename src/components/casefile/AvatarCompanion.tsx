"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import { validateAvatarDefinition, type AvatarDefinition } from "@/lib/avatar-engine";

import avatarJson from "@/data/avatar.json";
import { AvatarPlayer, type AvatarController } from "./AvatarPlayer";
import {
  CHAT_CHIPS,
  CHAT_GREETING,
  answerById,
  answerQuestion,
  type ChatAction,
  type ChatReply,
} from "./avatarChat";

/**
 * The fellow-traveller: the subject's procedural avatar as a persistent
 * fixed companion on every public page (the owner asked for it to follow
 * everywhere, not just sit in the About exhibit). Same engine and
 * definition as the exhibit (vendored CSP-safe in src/lib/avatar-engine).
 *
 * Placement is deliberate: bottom-LEFT, because the consent banner owns
 * the bottom-right corner (z-80) and the mobile menu owns the full
 * screen (z-50); the companion rides at z-40 under both and never covers
 * either. Safe-area inset respected. Behaviour matches the exhibit:
 * idle animation with blinking, wave on hover/tap, and under
 * prefers-reduced-motion a static neutral pose.
 *
 * Avatar-upgrade pass, on the owner's order:
 * - Travel: the companion glides along the bottom of the viewport as
 *   the visitor scrolls, driven by overall scroll progress and smoothed
 *   with a rAF lerp so it settles when scrolling stops. Transform only
 *   (no layout shift, no horizontal overflow), capped inside the left
 *   portion of the viewport so it can never reach the consent banner's
 *   bottom-right zone. While the chat panel is open it glides home and
 *   parks. Reduced motion: no travel at all, static bottom-left.
 * - Guide chat: clicking the companion opens a chat panel whose brain
 *   is a built-in knowledge base (see avatarChat.ts). It runs entirely
 *   in the visitor's browser: no network calls, no cost, and nothing
 *   typed into it leaves the page.
 */
const validation = validateAvatarDefinition(avatarJson);
if (!validation.ok) {
  throw new Error(`Invalid avatar definition: ${validation.errors[0]?.message}`);
}
const definition: AvatarDefinition = validation.value;

type Message = { from: "bot" | "user"; text: string; actions?: ChatAction[] };

export function AvatarCompanion() {
  const controller = useRef<AvatarController>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const travel = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ from: "bot", text: CHAT_GREETING }]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  /* Scroll travel: a rAF loop lerps the wrapper's translateX toward the
   * target (scroll progress x capped travel) and stops once settled, so
   * an idle page does no per-frame work. Opening the panel retargets to
   * 0 — the companion glides home and parks while the visitor chats. */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    if (reducedMotion) {
      travel.current = 0;
      el.style.transform = "";
      return;
    }
    let raf = 0;
    let target = 0;
    const maxTravel = () => {
      const w = window.innerWidth;
      return w < 640 ? Math.min(w * 0.18, 72) : Math.min(w * 0.3, 380);
    };
    const computeTarget = () => {
      if (open) return 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      return progress * maxTravel();
    };
    const tick = () => {
      raf = 0;
      const diff = target - travel.current;
      travel.current = Math.abs(diff) < 0.15 ? target : travel.current + diff * 0.12;
      el.style.transform = `translate3d(${travel.current.toFixed(1)}px, 0, 0)`;
      if (travel.current !== target) raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      target = computeTarget();
      if (!raf) raf = requestAnimationFrame(tick);
    };
    kick();
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    return () => {
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reducedMotion, open]);

  /* Focus follows the panel: into the input on open, and the message
   * log stays pinned to the newest message. */
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open ]);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, open]);

  const wave = () => {
    const avatar = controller.current;
    if (!avatar || reducedMotion) return;
    if (avatar.getState().activeAnimation !== "wave") avatar.play("wave");
  };

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && open) close();
  };

  const ask = (question: string, reply: ChatReply) => {
    setMessages((prev) => [
      ...prev,
      { from: "user", text: question },
      { from: "bot", text: reply.text, actions: reply.actions },
    ]);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const question = input.trim();
    if (!question) return;
    setInput("");
    ask(question, answerQuestion(question));
  };

  return (
    <div className="cf-companion" ref={wrapRef} onKeyDown={onKeyDown}>
      {open && (
        <div className="cf-chat" id="cf-chat-panel" role="dialog" aria-label="Site guide chat">
          <div className="cf-chat-head">
            <span className="cf-display" style={{ fontSize: 15, letterSpacing: "0.06em" }}>
              Site guide
            </span>
            <button type="button" className="cf-chat-close" onClick={close} aria-label="Close the guide chat">
              ×
            </button>
          </div>
          <div className="cf-chat-log" ref={logRef} aria-live="polite">
            {messages.map((message, i) => (
              <div key={i} className={message.from === "user" ? "cf-chat-msg cf-chat-msg-user" : "cf-chat-msg cf-chat-msg-bot"}>
                <p>{message.text}</p>
                {message.actions && (
                  <div className="cf-chat-actions">
                    {message.actions.map((action) => (
                      <Link
                        key={`${action.href}-${action.label}`}
                        href={action.href}
                        className="cf-chat-action"
                        onClick={() => setOpen(false)}
                      >
                        {action.label} →
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="cf-chat-chips">
            {CHAT_CHIPS.map((chip) => (
              <button
                key={chip.entryId}
                type="button"
                className="cf-chat-chip"
                onClick={() => ask(chip.label, answerById(chip.entryId))}
              >
                {chip.label}
              </button>
            ))}
          </div>
          <form className="cf-chat-form" onSubmit={onSubmit}>
            <label className="sr-only" htmlFor="cf-chat-input">
              Ask a question about this site
            </label>
            <input
              id="cf-chat-input"
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about this site..."
              autoComplete="off"
            />
            <button type="submit" className="cf-chat-send">
              Ask
            </button>
          </form>
          <p className="cf-chat-foot">Runs entirely in your browser. Nothing you type leaves this page.</p>
        </div>
      )}
      <button
        type="button"
        ref={buttonRef}
        className="cf-companion-btn"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="cf-chat-panel"
        aria-label="Site guide avatar of Raghav Mahajan — open the guide chat"
        onClick={() => {
          wave();
          setOpen((value) => !value);
        }}
      >
        <span className="cf-companion-frame" style={{ display: "block" }}>
          <span className="cf-companion-tag" aria-hidden="true">
            <i />
            Live
          </span>
          <span style={{ padding: "7%", display: "block" }} onMouseEnter={wave}>
            {reducedMotion ? (
              <AvatarPlayer
                definition={definition}
                expression="neutral"
                size="100%"
                ariaLabel="Procedural portrait of Raghav Mahajan: curly hair and round glasses"
              />
            ) : (
              <AvatarPlayer
                definition={definition}
                ref={controller}
                defaultAnimation="idle"
                size="100%"
                ariaLabel="Procedural portrait of Raghav Mahajan: curly hair and round glasses"
                onAnimationEnd={(animation) => {
                  if (animation === "wave") controller.current?.play("idle");
                }}
              />
            )}
          </span>
        </span>
      </button>
    </div>
  );
}
