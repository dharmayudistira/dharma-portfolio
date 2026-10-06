# Animation Rules

Apply these rules to entrance motion, GSAP timelines, hand movement, SVG
drawing, and transition timing.

## Session Contract

- Use `sessionStorage["dharma:intro-seen"]` with value `"1"`.
- The first home load in a tab runs the full entrance sequence.
- The first load at `/projects/` in a tab writes its Caveat heading with the pencil.
- The first load at another non-home route in a tab draws the app shell guides.
- Later navigation in that tab skips the entrance.
- Storage failure must not prevent the page from becoming usable.
- Keep the `noscript` fallback that hides the blocking overlay.

## Source of Truth

- Drive the hand and drawn stroke from one GSAP timeline and one progress
  value. Never coordinate them with independent timers.
- Derive hand position from the active SVG path using its actual screen
  transform. Avoid duplicated hand-authored coordinates.
- Decode required image assets before measuring or starting motion.
- Measure layout only after the relevant DOM and assets are ready.
- If required elements are missing, remove the overlay and reveal the page.

## Geometry

- The hero golden-ratio SVG is the canonical geometry for both the hero and
  entrance. Clone or reuse it instead of maintaining a second curve.
- Preserve grid anchors shared by the intro, app bar, and hero content box.
- Derive responsive positions from rendered bounds and CSS layout variables.
- Keep technical guides subtle. They support the composition, not dominate it.
- Keep the illustrated hand as a sketch asset, never a photorealistic hand.

## Timeline Design

- Use a single named sequence for dependent animation phases.
- Prefer explicit timeline positions over delay chains and callbacks.
- Animate transforms and opacity where possible to reduce layout work.
- Use `quickSetter` or equivalent for per-frame coordinate updates.
- Cleanly remove the entrance overlay when the sequence completes or fails.
- Do not add reduced-motion behavior outside the approved footer landscape
  exception unless the product decision changes.

## Footer Landscape Exception

- The footer landscape may honor `prefers-reduced-motion`, including Hairline's
  built-in support, as an explicitly approved exception.
- Keep this exception scoped to the footer landscape. Entrance and other
  animations retain their existing behavior.
- Preserve the complete static landscape when motion is reduced.

## Verification

Test with a fresh tab session and with DevTools both closed and open:

1. First load at `/`.
2. First load at `/projects/` with pencil-written heading.
3. First load at another non-home route.
4. Reload after the animation has completed.
5. Desktop and mobile viewport sizes.
6. Dark and light themes.

During the drawing phase, compare the pencil tip with the visible path endpoint.
They should remain visually locked throughout, not only at the start and end.
Confirm the overlay never traps input after an asset or script error.
