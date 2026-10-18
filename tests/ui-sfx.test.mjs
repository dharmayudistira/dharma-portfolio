import assert from "node:assert/strict";
import { mock, test } from "node:test";

const calls = [];
const players = [];

mock.module("uisfx", {
  namedExports: {
    createUISFX(options) {
      calls.push(["create", options]);
      const player = {
        enabled: options.enabled,
        volume: options.volume,
        unlock: async () => {
          calls.push(["unlock"]);
          return true;
        },
        play(cue, options) {
          if (!this.enabled) return null;
          calls.push(["play", cue, options]);
          return { stop() {}, ended: Promise.resolve() };
        },
        setPack(pack) {
          calls.push(["pack", pack]);
        },
        setVolume(volume) {
          this.volume = volume;
          calls.push(["volume", volume]);
        },
        getVolume() {
          return this.volume;
        },
        setEnabled(enabled) {
          this.enabled = enabled;
          calls.push(["enabled", enabled]);
        },
        isEnabled() {
          return this.enabled;
        },
        stopAll() {
          calls.push(["stopAll"]);
        },
        async destroy() {
          calls.push(["destroy"]);
        },
      };
      players.push(player);
      return player;
    },
  },
});

const sound = await import("../src/scripts/ui-sfx.ts");

test("server import and calls never create a player", () => {
  assert.deepEqual(sound.readSoundPreference(), { enabled: false, volume: 0.35 });
  assert.equal(sound.playInteractionSound("open"), null);
  assert.equal(calls.length, 0);
});

test("one player handles pointer and keyboard activation, mute, volume, and teardown", async () => {
  const listeners = new Map();
  const storage = new Map();
  const contexts = [];
  globalThis.window = {
    addEventListener() {},
    AudioContext: class {
      state = "suspended";
      constructor() { contexts.push(this); }
      async resume() { this.state = "running"; }
      async close() { this.state = "closed"; }
    },
  };
  globalThis.document = {
    addEventListener(type, listener) {
      listeners.set(type, [...(listeners.get(type) ?? []), listener]);
    },
  };
  globalThis.localStorage = {
    getItem(key) {
      return storage.get(key) ?? null;
    },
    setItem(key, value) {
      storage.set(key, value);
    },
  };

  sound.installSoundUnlock();
  sound.installSoundUnlock();
  assert.equal(listeners.get("pointerdown").length, 1);
  assert.equal(listeners.get("keydown").length, 1);

  listeners.get("pointerdown")[0]();
  listeners.get("keydown")[0]();
  assert.equal(sound.playInteractionSound("forward"), null);
  assert.equal(players.length, 0);
  sound.setSoundVolume(0.4);
  await sound.setSoundEnabled(false);
  assert.equal(contexts.length, 0, "muted controls must not initialize audio");

  storage.set("dharma:sound", "invalid JSON");
  assert.deepEqual(sound.readSoundPreference(), { enabled: false, volume: 0.4 });
  storage.set("dharma:sound", JSON.stringify("invalid shape"));
  assert.deepEqual(sound.readSoundPreference(), { enabled: false, volume: 0.4 });
  storage.set("dharma:sound", JSON.stringify({ enabled: true, volume: 2 }));
  assert.deepEqual(sound.readSoundPreference(), { enabled: true, volume: 1 });
  storage.set("dharma:sound", JSON.stringify({ enabled: true, volume: 0.4 }));

  listeners.get("pointerdown")[0]();
  listeners.get("keydown")[0]();
  assert.equal(contexts[0].state, "running", "unlock must start inside the gesture");
  await sound.setSoundEnabled(true);
  assert.equal(players.length, 1);
  assert.equal(calls.filter(([method]) => method === "play").length, 0);

  sound.playInteractionSound("open");
  sound.playInteractionSound("close");
  assert.deepEqual(
    calls.filter(([method]) => method === "play").map(([, cue]) => cue),
    ["open", "close"],
  );
  assert.deepEqual(calls.find(([method]) => method === "create")[1], {
    pack: "zen",
    volume: 0.4,
    enabled: true,
    context: contexts[0],
  });
  sound.setSoundVolume(0.25);
  await sound.setSoundEnabled(false);
  assert.deepEqual(JSON.parse(storage.get("dharma:sound")), {
    enabled: false,
    volume: 0.25,
  });
  assert.deepEqual(calls.slice(-2), [["stopAll"], ["enabled", false]]);
  assert.equal(sound.playInteractionSound("forward"), null);

  await sound.setSoundEnabled(true);
  sound.playInteractionSound("toggle-on");
  await sound.disposeSound();
  assert.equal(calls.at(-1)[0], "destroy");
  assert.equal(contexts[0].state, "closed");

  listeners.get("pointerdown")[0]();
  await sound.setSoundEnabled(true);
  assert.equal(players.length, 2);
  await sound.disposeSound();

  delete globalThis.window;
  delete globalThis.document;
  delete globalThis.localStorage;
});

test("mute cancels queued cues and stale enable confirmations during player loading", async (t) => {
  let preference = JSON.stringify({ enabled: false, volume: 0.35 });
  globalThis.window = {
    AudioContext: class {
      state = "running";
      async close() { this.state = "closed"; }
    },
  };
  globalThis.localStorage = {
    getItem: () => preference,
    setItem: (_key, value) => { preference = value; },
  };
  t.after(async () => {
    await sound.disposeSound();
    delete globalThis.window;
    delete globalThis.localStorage;
  });

  const start = calls.length;
  const firstEnable = sound.setSoundEnabled(true);
  sound.playInteractionSound("forward");
  const mute = sound.setSoundEnabled(false);
  const currentEnable = sound.setSoundEnabled(true);

  assert.deepEqual(await Promise.all([firstEnable, mute, currentEnable]), [false, false, true]);
  assert.equal(calls.slice(start).filter(([method]) => method === "play").length, 0);
  sound.playInteractionSound("back");
  assert.deepEqual(calls.slice(start).filter(([method]) => method === "play").map(([, cue]) => cue), ["back"]);
});
