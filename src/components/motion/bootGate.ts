/**
 * The boot loader's once-per-session gate, shared by BootLoader (which
 * plays the sequence) and HudHero (which times its entrance to start as
 * the loader's wipe lifts). Both sides read the same predicate at mount,
 * before the flag is ever written: the loader writes the flag only when
 * it EXITS, so during the one play both components agree it is playing.
 *
 * Storage failures (private mode, blocked storage) read as "will play":
 * the loader replays, and the hero waits for it. That is the same
 * fallback the hero's own boot readout uses for its session flag.
 */
export const BOOT_SEEN_KEY = "rv-boot-seen";

export function bootLoaderWillPlay(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(BOOT_SEEN_KEY) !== "1";
  } catch {
    return true;
  }
}

export function markBootSeen(): void {
  try {
    window.sessionStorage.setItem(BOOT_SEEN_KEY, "1");
  } catch {
    /* storage unavailable: the loader may replay next visit */
  }
}
