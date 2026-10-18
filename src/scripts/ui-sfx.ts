import type { CueName, PlayOptions, UISFXPlayer } from "uisfx";

const soundStorageKey = "dharma:sound";
const soundPack = "zen";
const defaultVolume = 0.35;

export interface SoundPreference {
  enabled: boolean;
  volume: number;
}

let player: UISFXPlayer | undefined;
let audioContext: AudioContext | undefined;
let loadingPlayer: Promise<UISFXPlayer | undefined> | undefined;
let playbackGeneration = 0;
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

const getPlayer = async (): Promise<UISFXPlayer | undefined> => {
  if (typeof window === "undefined" || !window.AudioContext) return;

  // Resume synchronously in the gesture, before downloading the optional player.
  audioContext ??= new window.AudioContext();
  const context = audioContext;
  if (context.state === "suspended") void context.resume().catch(() => undefined);
  if (player) return player;
  if (!loadingPlayer) {
    loadingPlayer = import("uisfx").then(({ createUISFX }) => {
      if (audioContext !== context) return;
      const preference = readSoundPreference();
      player = createUISFX({
        pack: soundPack,
        volume: preference.volume,
        enabled: preference.enabled,
        context,
      });
      return player;
    }).catch((error: unknown) => {
      console.warn("Interface sound is unavailable.", error);
      return undefined;
    }).finally(() => {
      if (audioContext === context) loadingPlayer = undefined;
    });
  }
  return loadingPlayer;
};

export const installSoundUnlock = () => {
  if (typeof document === "undefined" || unlockInstalled) return;
  unlockInstalled = true;

  const unlock = () => {
    if (!readSoundPreference().enabled || unlocked) return;
    void getPlayer().then(async (ui) => {
      if (!ui || !readSoundPreference().enabled) return;
      const ready = await ui.unlock();
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
export const playInteractionSound = (cue: CueName, options?: PlayOptions) => {
  if (!readSoundPreference().enabled) return null;
  if (player) return player.play(cue, options);
  const generation = playbackGeneration;
  void getPlayer().then((ui) => {
    if (generation === playbackGeneration && ui === player && readSoundPreference().enabled) ui?.play(cue, options);
  });
  return null;
};

export const setSoundEnabled = async (enabled: boolean) => {
  saveSoundPreference({ ...readSoundPreference(), enabled });
  if (!enabled) {
    playbackGeneration += 1;
    player?.stopAll();
    player?.setEnabled(false);
    unlocked = false;
    return false;
  }
  const generation = playbackGeneration;
  const ui = await getPlayer();
  if (generation !== playbackGeneration || !ui || player !== ui || !readSoundPreference().enabled) return false;
  ui.setEnabled(true);
  const ready = await ui.unlock();
  if (generation !== playbackGeneration || player !== ui || !ui.isEnabled()) return false;
  unlocked = ready;
  return ready;
};

export const setSoundVolume = (volume: number) => {
  if (!Number.isFinite(volume)) return;
  const nextVolume = Math.max(0, Math.min(1, volume));
  player?.setVolume(nextVolume);
  saveSoundPreference({ ...readSoundPreference(), volume: nextVolume });
};

export const disposeSound = async () => {
  playbackGeneration += 1;
  const ui = player;
  const context = audioContext;
  player = undefined;
  audioContext = undefined;
  loadingPlayer = undefined;
  unlocked = false;
  if (ui) await ui.destroy();
  if (context && context.state !== "closed") await context.close();
};
