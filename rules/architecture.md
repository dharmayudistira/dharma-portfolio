# Architecture Rules

Apply these rules when changing routes, layouts, components, dependencies, or
data flow.

## Static-First Boundary

- Render content and navigation through Astro wherever possible.
- Keep standard document navigation. Do not add a client router without an
  explicit product requirement.
- Add browser scripts only for interaction, animation, or browser storage.
- Keep scripts focused and avoid shared mutable global state.
- Do not add React, Vue, Svelte, or another UI runtime for static markup.

## Component Boundaries

- Pages compose layouts and components. They should not duplicate site chrome.
- Layouts own document metadata, fonts, the app shell, and shared guides.
- Components own one clear visual or behavioral concern.
- `src/scripts/` owns browser behavior that is too substantial for an inline
  script. Small pre-render theme setup may remain inline to prevent flashing.
- Extract a shared helper only after a real second use appears.

## Routes and Data

- Keep `/`, `/projects/`, `/blog/`, and `/profile/` as the primary routes.
- Generate detail pages from Astro Content Collections at build time.
- Exclude drafts from public indexes and static path generation.
- Treat content IDs and filenames as permanent public slugs after publishing.
- Keep collection validation in `src/content.config.ts`.

## Dependencies

Before adding a dependency, verify that existing Astro, browser, CSS, or GSAP
capabilities cannot solve the problem simply. A new package needs a clear use,
acceptable client cost, active maintenance, and compatibility with static
output. Request approval before installation unless the user explicitly asked
for that dependency.

## Configuration

- Keep the TypeScript preset strict.
- Read deployment origin only from `SITE_URL`.
- Do not hardcode production URLs or local absolute paths.
- Keep optional sitemap generation tied to a valid configured site origin.
- Never place secrets in source, MDX, client scripts, or committed env files.

## Change Discipline

- Search for an existing pattern before adding a new one.
- Match current file placement, naming, imports, and formatting.
- Keep route, schema, storage, and dependency changes isolated and explicit.
- Remove imports and helpers made unused by the current change only.
- Mention unrelated problems in the handoff instead of fixing them silently.
