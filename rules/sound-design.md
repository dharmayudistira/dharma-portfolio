# Interface Sound Rules

Apply these rules when adding or changing interface audio. They follow the
[UI SFX sound design guide](https://uisfx.com/ui-sound-design) and this site's
static-first, reading-focused design.

## Decide Whether Sound Helps

- Start with the product event and its visible feedback. Add a cue only when it
  clarifies a meaningful change or adds intentional character to an action.
- Keep entrance drawing, decorative motion, hover, typing, search filtering,
  routine dialog navigation, and page loads silent.
- Use the existing `zen` sound family. Name cues by meaning, not their texture.
  Reuse a cue when actions share a meaning.
- Current cues are `toggle-on` and `toggle-off` for theme changes, `forward` and
  `back` for featured project selection, and `reaction` for a mascot click.
  Volume adjustment previews `volume-change` with a cooldown.
- Trigger cues when the state actually changes. Future success or error cues
  belong to the confirmed result, and must differ in contour or rhythm.
- Do not add a loop unless a real ongoing state needs awareness when the user
  looks away. Stop it on completion, failure, cancellation, and page teardown.

## Playback and Control

- Sound starts disabled. Only an intentional choice in the Cmd+K sound control
  enables it. Store `enabled` and `volume` under `localStorage["dharma:sound"]`.
- Keep mute and volume controls inside the Cmd+K command palette on every route.
  Apply a new volume before its preview, and prevent rapid previews from stacking.
- Unlock browser audio during a trusted pointer or keyboard action. Do not play
  on page load or before the first gesture. Initialize the player only when it
  is needed, and stop it on page teardown.
- Route cues through `src/scripts/ui-sfx.ts`. Components request semantic
  events; that module owns volume, preference storage, and playback.
- Keep the player's bounded concurrency and restart policy. Do not stack
  repeated cues or prepare the entire library before the page becomes usable.
- Sound only reinforces visible state. Controls, theme, project selection, and
  mascot response must remain usable and understandable while muted.
- Keep cues brief and below speech and primary media. Check repeated use,
  headphones, laptop speakers, and phone speakers for sensory load.

## Review

Check the opt-in default, first pointer and keyboard activation, persisted
preferences after navigation, mute, volume preview, focus and labels, silent
operation, console errors, and build cost on desktop and mobile in both themes.
