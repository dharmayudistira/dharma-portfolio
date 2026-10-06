import {
  createUISFX,
  type CueName,
  type PlayOptions,
  type UISFXPlayer,
} from "uisfx";

const soundStorageKey = "dharma:sound";
const soundPack = "zen";
const defaultVolume = 0.35;

export interface SoundPreference {
  enabled: boolean;
  volume: number;
}

let player: UISFXPlayer | undefined;
let unlocked = false;
let unlockInstalled = false;
let fallbackPreference: SoundPreference = {
  enabled: false,
  volume: defaultVolume,
};

export const readSoundPreference = (): SoundPreference => {
  if (typeof window === "undefined") return fallbackPreference;

  try {
    const saved: unknown = JSON.parse(
      localStorage.getItem(soundStorageKey) ?? "null",
    );
    if (typeof saved !== "object" || saved === null) return fallbackPreference;

    return {
      enabled:
        "enabled" in saved && typeof saved.enabled === "boolean"
          ? saved.enabled
          : fallbackPreference.enabled,
      volume:
        "volume" in saved && typeof saved.volume === "number" && Number.isFinite(saved.volume)
          ? Math.max(0, Math.min(1, saved.volume))
          : fallbackPreference.volume,
    };
  } catch {
    return fallbackPreference;
  }
};

const saveSoundPreference = (preference: SoundPreference) => {
  fallbackPreference = preference;
  try {
    localStorage.setItem(soundStorageKey, JSON.stringify(preference));
  } catch {
    // Sound remains usable when storage is unavailable.
  }
};

const getPlayer = (): UISFXPlayer | undefined => {
  if (typeof window === "undefined") return;
  if (!player) {
    const preference = readSoundPreference();
    player = createUISFX({
      pack: soundPack,
      volume: preference.volume,
      enabled: preference.enabled,
    });
  }
  return player;
};

export const installSoundUnlock = () => {
  if (typeof document === "undefined" || unlockInstalled) return;
  unlockInstalled = true;

  const unlock = () => {
    if (!readSoundPreference().enabled || unlocked) return;
    const ui = getPlayer();
    if (!ui) return;
    void ui.unlock().then((ready) => {
      if (player === ui && ui.isEnabled()) unlocked = ready;
    });
  };

  document.addEventListener("pointerdown", unlock, { capture: true });
  document.addEventListener("keydown", unlock, { capture: true });
  window.addEventListener("pagehide", () => {
    void disposeSound();
  });
};

// Use inside the user's input handler so the first playback can unlock Web Audio.
export const playInteractionSound = (cue: CueName, options?: PlayOptions) =>
  readSoundPreference().enabled ? getPlayer()?.play(cue, options) ?? null : null;

export const setSoundEnabled = async (enabled: boolean) => {
  const ui = getPlayer();
  if (!ui) return false;
  if (!enabled) ui.stopAll();
  ui.setEnabled(enabled);
  saveSoundPreference({ enabled, volume: ui.getVolume() });
  if (!enabled) {
    unlocked = false;
    return false;
  }
  const ready = await ui.unlock();
  if (player !== ui || !ui.isEnabled()) return false;
  unlocked = ready;
  return ready;
};

export const setSoundVolume = (volume: number) => {
  const ui = getPlayer();
  if (!ui) return;
  ui.setVolume(volume);
  saveSoundPreference({ enabled: ui.isEnabled(), volume: ui.getVolume() });
};

export const disposeSound = async () => {
  const ui = player;
  player = undefined;
  unlocked = false;
  if (ui) await ui.destroy();
};
