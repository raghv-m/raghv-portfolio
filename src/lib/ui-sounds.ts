/**
 * UI sound effects, powered by uisfx (MIT code, CC0 audio, ~12 kB, Web Audio
 * synthesis — no audio files shipped).
 *
 * One lazy singleton player, Minimal pack, volume 0.6. uisfx persists the
 * enabled state (plus pack/volume) in localStorage under STORAGE_KEY, so the
 * visitor's mute choice survives reloads. The AudioContext is created lazily
 * and only unlocked from a real user gesture (see UiSounds), because browsers
 * block audio before any interaction.
 */
import { createUISFX, type CueName, type PlayOptions, type UISFXPlayer } from "uisfx";

export type { CueName };

const STORAGE_KEY = "raghv.dev:ui-sound";
const DEFAULT_PACK = "minimal" as const;
const DEFAULT_VOLUME = 0.6;

let player: UISFXPlayer | null = null;
let unlockAttempted = false;

function getPlayer(): UISFXPlayer | null {
  if (typeof window === "undefined") return null;
  if (!player) {
    player = createUISFX({
      pack: DEFAULT_PACK,
      volume: DEFAULT_VOLUME,
      preferences: { key: STORAGE_KEY },
    });
  }
  return player;
}

/** Resume/create the AudioContext. Call from a user gesture (pointer/key). */
export async function unlockUiSound(): Promise<boolean> {
  const p = getPlayer();
  if (!p) return false;
  try {
    const ok = await p.unlock();
    unlockAttempted = true;
    return ok;
  } catch {
    return false;
  }
}

/**
 * Play a semantic cue. Safe to call anywhere, including server-rendered code
 * paths (no-ops off the client) and before the first gesture: if the context
 * is still locked, the player drops the cue silently instead of throwing.
 */
export function playUiSound(cue: CueName, options?: PlayOptions): void {
  const p = getPlayer();
  if (!p || !p.isEnabled()) return;
  if (!unlockAttempted) {
    // A click/keypress IS a gesture, so this unlock normally succeeds; if it
    // doesn't, the play below is dropped silently by the player.
    void unlockUiSound();
  }
  p.play(cue, options);
}

export function getUiSoundEnabled(): boolean {
  return getPlayer()?.isEnabled() ?? true;
}

export function setUiSoundEnabled(enabled: boolean): void {
  getPlayer()?.setEnabled(enabled);
}
