# Design System Rules

Apply these rules to CSS, layout, themes, typography, icons, technical drawing,
and responsive behavior.

## Visual Direction

The interface combines a restrained engineering drawing with a modern product
portfolio. Golden-ratio geometry and grid logic establish structure. Technical
annotations add meaning. Keep decoration sparse and preserve content clarity.

## Layout and Grid

- Use `--content-max-width`, `--page-gutter`, and `--header-height` as shared
  anchors for the app bar, hero, page guides, and entrance.
- Treat vertical guides as real content boundaries, not arbitrary decoration.
- Align related marks to the same coordinate system across sections.
- Keep the hero content area clear unless the request explicitly changes it.
- Validate layouts at mobile, tablet, desktop, and wide desktop widths.

## Color and Themes

- Support both `dark` and `light` themes through semantic custom properties.
- Add a semantic token before repeating a meaningful color value.
- Do not style components against raw dark-theme values.
- Preserve readable text contrast and visible keyboard focus in both themes.
- Store only `dark` or `light` in `localStorage["dharma:theme"]`.
- Let system preference choose the initial theme when no value is stored.

## Typography

- Use Geist for display type and primary interface copy.
- Use Geist Mono for technical labels, metadata, and annotations.
- Use Caveat only for deliberately handwritten notes.
- Keep labels legible at their final rendered size and letter spacing.
- Do not add remote font requests when packaged fonts are available.

## CSS Conventions

- Keep global tokens and existing site-wide component rules in `global.css`.
- Follow the BEM-like naming pattern: `block`, `block__element`, and
  `block--modifier`.
- Prefer logical properties such as `margin-inline` and `padding-block`.
- Use modern CSS directly before adding JavaScript for presentation.
- Avoid one-off pixel corrections when shared geometry can express the intent.
- Keep selectors shallow and specificity predictable.

## Icons and SVG

- Use Morphicons with Lucide paths for controls whose icon state changes.
- Give icon-only controls an accessible name and visible focus state.
- Use inline SVG for golden-ratio and technical drawing geometry that needs
  CSS styling, clipping, responsive scaling, or path animation.
- Keep decorative SVG hidden from assistive technology.
- Preserve `vector-effect="non-scaling-stroke"` where line weight must remain
  visually stable during scaling.
- Do not replace established icons or drawings with generated bitmap assets.

## Responsive Behavior

- Design mobile intentionally. Do not rely on cropped desktop composition.
- Preserve the information hierarchy when annotations move or disappear.
- Keep nonessential technical annotation hidden on mobile if it harms clarity.
- Check overflow, clipped marks, focus order, navigation, and tap targets.
