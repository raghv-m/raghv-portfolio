"use client";

import { useEffect, useRef, useState } from "react";
import { validateAvatarDefinition, type AvatarDefinition } from "@/lib/avatar-engine";

import avatarJson from "@/data/avatar.json";
import { AvatarPlayer, type AvatarController } from "./AvatarPlayer";

/**
 * The subject's likeness as an exhibit: a procedural portrait built with
 * the Bible Strong Avatar Lab. The definition (src/data/avatar.json) is
 * rendered as inline SVG by AvatarPlayer on the lab's engine (vendored
 * CSP-safe in src/lib/avatar-engine): a paper-toned head on an ink stage,
 * a curly-hair silhouette, round glasses. The frame is the brutalist
 * standard (thick ink border, hard offset shadow) and a red block label
 * names the medium; the same avatar also rides every page as the fixed
 * companion (AvatarCompanion).
 *
 * Behaviour: the "idle" animation loops gentle glances with ambient drift
 * and automatic blinking. Hovering (or tapping) plays the "wave" greeting
 * once, then idle resumes. Under prefers-reduced-motion the avatar is a
 * static neutral pose: no animation, no ambient motion, no blinking.
 */
const validation = validateAvatarDefinition(avatarJson);
if (!validation.ok) {
  throw new Error(`Invalid avatar definition: ${validation.errors[0]?.message}`);
}
const definition: AvatarDefinition = validation.value;

export function SubjectAvatar() {
  const controller = useRef<AvatarController>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Syncing with the media query on mount is the point of this effect;
    // the state only changes again when the OS setting changes.
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
    <div className="cf-exhibit" style={{ maxWidth: 216 }}>
      <div
        className="cf-exhibit-frame"
        style={{ background: "#141414", padding: "9%" }}
        onMouseEnter={wave}
        onClick={wave}
      >
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
      <div
        className="cf-mono"
        style={{
          background: "var(--cf-red)",
          color: "#F4F1EC",
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          padding: "5px 9px",
          marginTop: 12,
        }}
      >
        Procedural portrait — generated in code
      </div>
    </div>
  );
}
