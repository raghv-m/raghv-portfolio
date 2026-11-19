"use client";

import { useEffect } from "react";
import { playUiSound, unlockUiSound } from "@/lib/ui-sounds";

/**
 * Global UI-sound wiring. Mounted once in the root layout; renders nothing.
 *
 * Delegated listeners, so no existing component has to change:
 * - click on a button -> `press`; click on a link -> `select`
 * - click on a checkbox / switch / aria-pressed control -> `toggle-on` /
 *   `toggle-off` (state read after React has applied it)
 * - hover over [data-sound-hover] (primary CTAs only, fine pointers only)
 *   -> `hover`
 * - the command menu's custom event -> `open`
 *
 * Submit buttons stay quiet here: the three public forms play `send` /
 * `success` / `error` from their own submit handlers, so one action never
 * chirps twice. The SoundToggle itself carries `data-sound-skip` and plays
 * its own toggle cue.
 */
export default function UiSounds() {
  useEffect(() => {
    // Web Audio needs a user gesture: resume the context on the first one.
    const unlock = () => {
      void unlockUiSound();
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const el = target.closest(
        "a[href], button, input[type='submit'], [role='button']",
      ) as HTMLElement | null;
      if (!el || el.closest("[data-sound-skip]")) return;

      const isToggle =
        el.matches("input[type='checkbox'], [role='switch']") ||
        el.getAttribute("aria-pressed") !== null;
      if (isToggle) {
        // React applies the new state after this handler; read it next frame.
        requestAnimationFrame(() => {
          const on =
            el instanceof HTMLInputElement
              ? el.checked
              : el.getAttribute("aria-pressed") === "true" ||
                el.getAttribute("aria-checked") === "true";
          playUiSound(on ? "toggle-on" : "toggle-off");
        });
        return;
      }

      // Submit buttons stay quiet here; their form plays send/success/error.
      if (el instanceof HTMLButtonElement && el.type === "submit" && el.closest("form")) return;

      playUiSound(el.tagName === "A" ? "select" : "press");
    };
    document.addEventListener("click", onClick);

    const onHover = (event: MouseEvent) => {
      // Touch pointers never get hover ticks; the media query also excludes
      // coarse-pointer devices outright.
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const target = event.target as HTMLElement | null;
      const el = target?.closest("[data-sound-hover]");
      if (!el) return;
      // mouseover also fires moving between children; only sound on entry.
      if (el.contains(event.relatedTarget as Node | null)) return;
      playUiSound("hover", { cooldownMs: 150 });
    };
    document.addEventListener("mouseover", onHover);

    const onCommandMenu = () => playUiSound("open");
    window.addEventListener("cf:command-menu", onCommandMenu);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      document.removeEventListener("click", onClick);
      document.removeEventListener("mouseover", onHover);
      window.removeEventListener("cf:command-menu", onCommandMenu);
    };
  }, []);

  return null;
}
