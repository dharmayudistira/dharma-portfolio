# Quality Gates

Use the smallest verification set that covers the risk, then expand it when a
change crosses multiple concerns. Do not claim a check that was not run.

## Baseline Commands

For any source or configuration change:

```sh
npm run check
npm run build
```

`npm run check` verifies Astro and TypeScript. `npm run build` also verifies
static route generation and production bundling. For runtime review, use:

```sh
npm run dev
npm run preview
```

## Verification Matrix

| Change | Required checks |
| --- | --- |
| Documentation | Facts, links, commands, spelling, diff scope |
| Astro or TypeScript | Check, build, affected route, browser console |
| CSS or layout | Check, build, desktop/mobile, dark/light, overflow |
| Navigation or controls | Keyboard, focus, labels, active state, mobile menu |
| Interface sound | Opt-in, unlock, mute, volume preview, persistence, silent use, sensory load |
| Entrance animation | Full intro, shell intro, revisit skip, timing, failures |
| SVG geometry | Scaling, clipping, stroke weight, both themes, breakpoints |
| Content or schema | Frontmatter, draft filter, index, detail route, build |
| Metadata, SEO, or GEO | Title, description, canonical, Open Graph, JSON-LD, identity references |
| Feeds or AI discovery | Response status, content type, valid format, draft filtering, links |
| Dependency | Lockfile, check, build, client impact, reason documented |

## Animation Inspection

Use a new tab session for each first-visit case. Check with DevTools closed and
open because timing and asset decode behavior can differ. During golden-ratio
drawing, verify the hand and path endpoint stay synchronized frame by frame.
After completion or failure, confirm the overlay is removed and input works.

## Content Inspection

Test one draft and one published item when changing collection logic. Confirm
drafts do not appear publicly. Validate the route slug, heading order, links,
image text alternatives, canonical URL, dates, and structured data.

## SEO and GEO Verification

- Inspect built HTML and generated endpoints against the
  [content and SEO rules](content-and-seo.md). Check identity references, page
  types, canonical URLs, content dates, draft exclusion, and discovery links.
- Before a live audit, confirm the intended commit is deployed. Record the
  audited origin, date, auditor version, scoring rubric, and successful and
  failed URL counts. Compare scores using matching auditor versions and rubrics.
- Distinguish local, preview, and live results. Report environment overrides and
  disabled services; a build without analytics fetching does not verify visit
  counts.
- Review warnings against page purpose, visible content, and accessibility.
  Explain false positives such as literal `/about` checks, expectations of a
  company publisher for this personal portfolio, or empty `alt` on decorative images.
  Do not invent entities, FAQs, dates, or routes solely to increase a score.
- Report readiness scores and crawler user-agent simulations as such. They do
  not measure AI citations or prove that actual vendor crawlers visited.

## Review Before Handoff

1. Inspect `git diff` and `git status`.
2. Confirm every changed line traces to the request.
3. Remove temporary logging, test artifacts, and orphans created by the change.
4. Confirm no secrets, local absolute paths, or generated output were added.
5. State checks run, results, skipped checks, and remaining risks.

Warnings already known to be toolchain output may be reported as such, but do
not hide new warnings or assume they are harmless without checking their source.
