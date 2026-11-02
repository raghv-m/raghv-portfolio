"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";

/**
 * Site-wide command menu (Ctrl+K / Cmd+K, or the navbar button, which fires
 * the "cf:command-menu" window event). Pages and a few real actions, filter
 * as you type, arrow keys + Enter, Escape closes. No dependency: the list is
 * static site structure, so a small hand-rolled palette is all this needs.
 * Styling lives in src/app/ux-pass.css (.cf-cmd-*), square and inked like
 * everything else in the case file.
 */

type Item = {
  id: string;
  group: "Pages" | "Actions";
  label: string;
  hint: string;
  href?: string;
  external?: boolean;
  copy?: string;
  keywords: string;
};

const ITEMS: Item[] = [
  { id: "home", group: "Pages", label: "Home", hint: "The case file cover", href: "/", keywords: "home cover start index" },
  { id: "about", group: "Pages", label: "About", hint: "The person behind the file", href: "/about", keywords: "about bio person raghav" },
  { id: "experience", group: "Pages", label: "Experience", hint: "Storyboard, frame by frame", href: "/experience", keywords: "experience work history storyboard jobs" },
  { id: "portfolio", group: "Pages", label: "Portfolio", hint: "Projects and builds", href: "/portfolio", keywords: "portfolio projects work builds" },
  { id: "cybersecurity", group: "Pages", label: "Cybersecurity", hint: "SOC work and the lab", href: "/cybersecurity", keywords: "cybersecurity soc security analyst" },
  { id: "lab001", group: "Pages", label: "LAB-001 investigation", hint: "SSH brute force, caught by Wazuh", href: "/investigations/lab-001-ssh-brute-force", keywords: "lab 001 investigation ssh brute force wazuh case" },
  { id: "blog", group: "Pages", label: "Blog", hint: "Field notes", href: "/blog", keywords: "blog field notes writing posts" },
  { id: "newsletter", group: "Pages", label: "Newsletter", hint: "Blue Team Brief", href: "/newsletter", keywords: "newsletter blue team brief subscribe editions" },
  { id: "certifications", group: "Pages", label: "Certifications", hint: "Security+, ISC2 CC, first aid", href: "/certifications", keywords: "certifications security+ isc2 cc comptia certs" },
  { id: "homelab", group: "Pages", label: "Home lab", hint: "HOMELAB.CORP, four nodes", href: "/homelab", keywords: "homelab lab network wazuh topology" },
  { id: "career", group: "Pages", label: "Career", hint: "The road so far", href: "/career", keywords: "career path goals" },
  { id: "hobbies", group: "Pages", label: "Hobbies", hint: "Photography, Edmonton Valley Zoo", href: "/hobbies", keywords: "hobbies photography zoo photos" },
  { id: "roadmap", group: "Pages", label: "Roadmap", hint: "What is next", href: "/roadmap", keywords: "roadmap next plans future" },
  { id: "contact-page", group: "Pages", label: "Contact", hint: "Establish connection", href: "/contact", keywords: "contact message reach email form" },
  { id: "estimate", group: "Actions", label: "Get an estimate", hint: "Price a website build in two minutes", href: "/estimate", keywords: "estimate price quote website build cost hire" },
  { id: "resume", group: "Actions", label: "Open the resume", hint: "PDF, one page, plain words", href: "/resume.pdf", external: true, keywords: "resume cv pdf download" },
  { id: "login", group: "Actions", label: "Client login", hint: "Portal sign in", href: "/auth/login", keywords: "login sign in portal client account" },
  { id: "copy-email", group: "Actions", label: "Copy hello@raghv.dev", hint: "Email address, straight to the clipboard", copy: "hello@raghv.dev", keywords: "email copy address hello contact" },
];

export function CommandMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ITEMS;
    return ITEMS.filter((item) => `${item.label} ${item.hint} ${item.keywords}`.toLowerCase().includes(q));
  }, [query]);

  const close = useCallback(() => setOpen(false), []);

  const run = useCallback(
    (item: Item) => {
      setOpen(false);
      if (item.copy) {
        void navigator.clipboard?.writeText(item.copy).catch(() => {});
        return;
      }
      if (!item.href) return;
      if (item.external) {
        window.open(item.href, "_blank", "noopener");
        return;
      }
      router.push(item.href);
    },
    [router],
  );

  // Openers: Ctrl+K / Cmd+K anywhere, plus the navbar button's event.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onButton = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("cf:command-menu", onButton);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("cf:command-menu", onButton);
    };
  }, []);

  // Fresh state each open; the page underneath stays put while it is open.
  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open ]);

  // Navigating (e.g. browser back with the menu open) closes it.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Keep the active row visible while arrowing through a long list.
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (results.length ? (a + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (results.length ? (a - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[active];
      if (item) run(item);
    }
  };

  let lastGroup = "";

  return createPortal(
      <div
        className="cf-cmd-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="cf-cmd-panel" role="dialog" aria-modal="true" aria-label="Command menu">
          <div className="cf-cmd-inputrow">
            <span aria-hidden="true" className="cf-cmd-prompt">&gt;</span>
            <input
              ref={inputRef}
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onInputKey}
              placeholder="Jump to a page, or run an action…"
              aria-label="Search pages and actions"
              className="cf-cmd-input"
            />
            <kbd className="cf-cmd-kbd">ESC</kbd>
          </div>

          <div ref={listRef} className="cf-cmd-list" role="listbox" aria-label="Results">
            {results.length === 0 && (
              <p className="cf-cmd-empty">Nothing in the file matches that. Try “blog”, “estimate”, or “lab”.</p>
            )}
            {results.map((item, i) => {
              const head = item.group !== lastGroup ? item.group : null;
              lastGroup = item.group;
              return (
                <div key={item.id}>
                  {head && <p className="cf-cmd-group">{head}</p>}
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    data-index={i}
                    data-active={i === active}
                    className="cf-cmd-item"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => run(item)}
                  >
                    <span className="cf-cmd-label">{item.label}</span>
                    <span className="cf-cmd-hint">{item.hint}</span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="cf-cmd-foot" aria-hidden="true">
            <span>↑↓ navigate</span>
            <span>↵ open</span>
            <span>esc close</span>
          </div>
        </div>
      </div>,
    document.body,
  );
}
