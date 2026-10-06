# AGENTS.md

Instructions for contributors and coding agents working in this repository.
Read this file first, then read the relevant document in `rules/` before editing.

## Project Context

Dharma Portfolio is a design-led personal site for a product engineer. It uses
an engineering drawing system, golden-ratio geometry, restrained annotation,
and a hand-drawn entrance sequence. Performance, accessibility, SEO, GEO,
content readability, and precise motion are product requirements.

The site has four primary routes:

- `/`: hero, selected work, and supporting home sections.
- `/projects/`: repository-backed project index and detail pages.
- `/blog/`: repository-backed writing index and detail pages.
- `/profile/`: professional profile.

## Stack

- Astro with static output and standard document navigation.
- Strict TypeScript.
- Astro Content Collections with MDX for projects and blog posts.
- Native CSS with shared custom properties. Tailwind is intentionally absent.
- GSAP for coordinated entrance animation only.
- Morphicons with Lucide icon paths for stateful interface controls.
- Inline SVG for technical drawings and geometry.
- Self-hosted Geist, Geist Mono, and Caveat font packages.

Keep pages static-first. Add client JavaScript only for behavior that HTML and
CSS cannot provide cleanly.

## Project Structure

```text
.
├── src/
│   ├── assets/                 # Versioned images and drawing assets
│   ├── components/             # Reusable Astro UI and visual systems
│   ├── content/
│   │   ├── blog/               # Blog MDX and its template
│   │   └── projects/           # Project MDX and its template
│   ├── layouts/                # Shared page shells and metadata
│   ├── pages/                  # File-based routes and static endpoints
│   ├── scripts/                # Focused browser behavior
│   ├── styles/                 # Global tokens, layout, and component CSS
│   └── content.config.ts       # Validated collection schemas
├── rules/                      # Detailed project rules by concern
├── astro.config.mjs            # Astro, MDX, sitemap, and site URL config
├── package.json                # Commands and pinned capabilities
└── tsconfig.json               # Astro strict TypeScript config
```

Do not edit generated `.astro/`, `dist/`, or `node_modules/` content.

## Rule Routing

Read only the rule files relevant to the task, but follow all applicable ones.

| Task | Required rule |
| --- | --- |
| Routes, dependencies, components, or data flow | `rules/architecture.md` |
| Entrance, GSAP, hand motion, SVG drawing, or timing | `rules/animation.md` |
| MDX, collections, metadata, SEO, GEO, or publishing | `rules/content-and-seo.md` |
| CSS, themes, typography, icons, grid, or responsive UI | `rules/design-system.md` |
| Interface sound, playback, or sound controls | `rules/sound-design.md` |
| Testing, review, release, or completion checks | `rules/quality-gates.md` |

## Protected Product Decisions

Do not change these without explicit user approval:

- The home intro plays once per browser tab session.
- A first visit to `/` runs the full grid, hand, and golden-ratio sequence.
- A first visit to `/projects/` runs the handwritten heading sequence.
- A first visit to `/blog/` runs the handwritten heading sequence.
- A first visit to another non-home route runs the shell line-drawing sequence.
- `sessionStorage["dharma:intro-seen"]` stores intro completion.
- `localStorage["dharma:theme"]` stores the `dark` or `light` theme.
- Interface sound is opt-in and `localStorage["dharma:sound"]` stores its settings.
- Sound and volume controls live in the Cmd+K command palette.
- Dark and light themes remain supported.
- The public writing route is `/blog/`, never `/blogs/`.
- Projects and posts live in this repository as validated MDX.
- Route slugs come from stable content filenames.
- Animations outside the footer landscape have no reduced-motion branch by
  current product decision.
- The footer landscape may honor `prefers-reduced-motion`, including Hairline's
  built-in support, as an explicitly approved exception.
- `SITE_URL` is the only production-origin configuration source.

The missing reduced-motion branch outside the footer landscape is a known
accessibility tradeoff. Do not silently add or remove one elsewhere.

## Working Method

For each task:

1. Read the request, this file, and the routed rule files.
2. Inspect existing code before proposing new files or abstractions.
3. State assumptions, tradeoffs, success criteria, and unresolved questions.
4. Identify the smallest change that satisfies the request.
5. Implement one concern at a time and remove only orphans you created.
6. Run the applicable gates below.
7. Review the diff for unrelated edits, regressions, and hidden complexity.
8. Report the outcome, verification, and any remaining risk.

Stop and ask before changing routes, schemas, dependencies, storage contracts,
or core visual behavior when the request does not explicitly authorize it.
Also ask before unrequested deletes, renames, or broad refactors.

## Quality Gates

- Documentation only: verify links, commands, facts, and the final diff.
- Any code: run `npm run check` and `npm run build`.
- Visual changes: inspect desktop and mobile in both themes.
- Sound changes: test opt-in, keyboard activation, mute, volume, navigation,
  and silent use on desktop and mobile.
- Entrance changes: test first home visit, first non-home visit, and same-tab
  revisit. Confirm hand and stroke stay synchronized and the console is clean.
- Content changes: validate frontmatter, draft filtering, routes, canonical data,
  and structured metadata.
- Dependency changes: explain the need, bundle/runtime impact, and alternative.

See `rules/quality-gates.md` for the full verification matrix.

## Code Conventions

- Preserve strict types. Avoid `any`, unsafe casts, and silent failures.
- Prefer Astro components and server-rendered markup over client frameworks.
- Keep components focused. Extract only when behavior or markup is reused.
- Use semantic HTML, visible keyboard focus, useful labels, and valid headings.
- Use existing CSS custom properties instead of duplicating literal values.
- Follow the existing BEM-like class pattern, such as `hero__content`.
- Keep responsive geometry derived from shared layout variables.
- Use double quotes and semicolons in TypeScript, matching existing source.
- Keep comments for intent, constraints, or non-obvious math, not narration.
- Never hardcode secrets, deployment origins, or environment-specific paths.
- Do not introduce a package when a small native solution is sufficient.
- Do not mix unrelated cleanup into a requested change.

## Content Conventions

- Author new long-form content as `.mdx`.
- Copy the relevant `_template.mdx`, then rename it to the permanent slug.
- Keep `draft: true` until the entry is ready to publish.
- Treat published filenames and URLs as stable public contracts.
- Use MDX components sparingly and keep the reading experience semantic.

## Common Commands

```sh
npm install
npm run dev
npm run check
npm run build
npm run preview
```

Set `SITE_URL` in `.env` for canonical URLs, structured data, `robots.txt`, and
sitemap generation. Never commit secrets or machine-specific configuration.

## Definition of Done

A change is done when the requested outcome is present, applicable gates pass,
responsive and theme behavior are preserved, no unrelated files changed, and
the final report names both verification performed and any unresolved risk.
