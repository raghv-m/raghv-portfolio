"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { getUiSoundEnabled, playUiSound, setUiSoundEnabled } from "@/lib/ui-sounds";

/**
 * Mute/unmute for the UI sounds. Styled like ThemeToggle (same mono toggle
 * treatment in the navbar). The choice persists in localStorage via uisfx
 * preferences; sound is ON by default. The toggle plays its own cue so the
 * visitor hears the state change, and it is exempt from the global click
 * handler (data-sound-skip) so it never chirps twice.
 */
export function SoundToggle({ className = "" }: { className?: string }) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(getUiSoundEnabled());
  }, []);

  const toggle = () => {
    if (enabled) {
      playUiSound("toggle-off");
      setUiSoundEnabled(false);
      setEnabled(false);
    } else {
      setUiSoundEnabled(true);
      setEnabled(true);
      playUiSound("toggle-on");
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      data-sound-skip
      className={`cf-mono cf-theme-toggle inline-flex items-center gap-1.5 uppercase px-2 ${className}`}
      style={{ letterSpacing: "0.09em", fontSize: 10.5, minHeight: 36 }}
      aria-label={
        enabled
          ? "Interface sounds on. Activate to mute."
          : "Interface sounds muted. Activate to unmute."
      }
      aria-pressed={enabled}
      title={enabled ? "Sound: on (tap to mute)" : "Sound: muted (tap to unmute)"}
    >
      {enabled ? (
        <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
      ) : (
        <VolumeX className="w-3.5 h-3.5" aria-hidden="true" />
      )}
      <span className="hidden sm:inline">{enabled ? "Sound" : "Muted"}</span>
    </button>
  );
}
