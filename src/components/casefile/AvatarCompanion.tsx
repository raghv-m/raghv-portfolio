"use client";

import { useEffect, useRef, useState } from "react";
import { validateAvatarDefinition, type AvatarDefinition } from "@/lib/avatar-engine";

import avatarJson from "@/data/avatar.json";
import { AvatarPlayer, type AvatarController } from "./AvatarPlayer";

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
 */
const validation = validateAvatarDefinition(avatarJson);
if (!validation.ok) {
  throw new Error(`Invalid avatar definition: ${validation.errors[0]?.message}`);
}
const definition: AvatarDefinition = validation.value;

export function AvatarCompanion() {
  const controller = useRef<AvatarController>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const wave = () => {
    const avatar = controller.current;
    if (!avatar || reducedMotion) return;
    if (avatar.getState().activeAnimation !== "wave") avatar.play("wave");
  };

  return (
    <div className="cf-companion" role="img" aria-label="Procedural avatar of Raghav Mahajan — it follows every page of this site">
      <div className="cf-companion-frame">
        <div className="cf-companion-tag" aria-hidden="true">
          <i />
          Live
        </div>
        <div style={{ padding: "7%" }} onMouseEnter={wave} onClick={wave}>
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
        </div>
      </div>
    </div>
  );
}
