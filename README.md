# Dharma Portfolio

## Development

```sh
npm install
npm run dev
```

Run validation and create the production output:

```sh
npm run build
```

## Site URL

Copy `.env.example` to `.env` and replace the example value with the production
origin. `SITE_URL` enables canonical URLs, structured data URLs, `robots.txt`,
and sitemap generation.

## Identity and AI discovery

Public pages share a `Person` record with the stable `/profile/#person` identifier.
The website identifies that person as its author and publisher; Zero One Group is
identified only as the person's employer. `/profile/` carries both `ProfilePage`
and `AboutPage` metadata and remains the public about page.

`/.well-known/ai.txt` lists public discovery resources. `/ai/summary.json` contains
the existing public identity and links to profile, writing, projects, RSS, and
other machine-readable resources. Both are generated at build time from
`SITE_URL` and shared site data, and are linked from `/llms.txt`. These discovery
files are optional conventions; crawler permissions remain in `/robots.txt`.

Decorative social icons have empty alternative text and are hidden from
assistive technology; their links provide accessible labels. The decorative
entrance hand is already inside an accessibility-hidden overlay. Audit warnings
that require a company publisher, a literal `/about` path, or descriptive text
on every decorative image do not apply to these choices.

## RSS

`/rss.xml` provides summaries of published blog posts and project case studies,
combined newest first by publication date, with permanent links. Drafts from both
collections are excluded. It is generated at build time and requires `SITE_URL`.
Public pages advertise the feed through metadata for feed readers, and the footer
links to it under For agents.

## Analytics and statistics

GoatCounter records production visits. `/statistics/` combines the published
content collections with its visit counts across all available history. Repeated
page loads in the same session count as one visit with GoatCounter's default
session settings. Statistics are fetched at build time. The page shows unavailable
visit counts until the API is configured; published content counts always work.

Add these environment variables in Vercel's **Production** environment. For
local builds, use the ignored `.env` or `.env.local` file.
Mark `GOATCOUNTER_API_KEY`, `CRON_SECRET`, and `VERCEL_DEPLOY_HOOK_URL` as sensitive
in Vercel. `GOATCOUNTER_URL` is public configuration.

| Variable | Value |
| --- | --- |
| `GOATCOUNTER_URL` | Your dashboard origin, such as `https://yourcode.goatcounter.com`. |
| `GOATCOUNTER_API_KEY` | A private key with only the permission to read statistics, created under your GoatCounter account's API settings. |
| `CRON_SECRET` | A private, randomly generated secret of at least 16 characters. |
| `VERCEL_DEPLOY_HOOK_URL` | A Deploy Hook for your production branch, created in Vercel under Settings → Git → Deploy Hooks. |

The tracker loads only on Vercel production builds and excludes pages marked
`noindex`. Counts use the pathname, so query strings and fragments share the same
statistics row. The API key is used only at build time and is never included in
browser code. To exclude your own browser, visit your production site with
`#toggle-goatcounter` appended
and follow the confirmation dialog. The footer links to your dashboard; enable
public access in GoatCounter's site settings if visitors should see it.

After deployment, Vercel runs `/api/rebuild` daily at 17:00 UTC, which is 00:00 WIB.
The function checks `CRON_SECRET` and calls the Deploy Hook. On Vercel Hobby the
run can occur anywhere in that hour. A successful build publishes fresh statistics. If a
configured GoatCounter API request fails, the build fails and the previous
deployment stays online. Vercel does not retry failed cron invocations.

Verify the cron configuration with Vercel's **Run** control and deployment logs
after deployment. A response of `202` confirms the rebuild was requested; also
check the resulting deployment and the timestamp on `/statistics/`. The native
`api/rebuild.ts` function runs on Vercel, separately from Astro's static pages.

Push these changes to the production Git branch before the first deployment.
The daily Deploy Hook always rebuilds the latest commit on that branch, so it
needs to contain the tracker, statistics page, and cron function. Tracking and
scheduled refreshes become active with the production deployment.

For a local Vercel build, `vercel pull --environment=production` writes
`[SENSITIVE]` placeholders for secret values. Supply the real values from the
ignored local environment when running `vercel build --prod`.

Run `npm test`, `npm run check`, and `npm run build` before publishing. With an API
key configured locally, compare the per-page counts with GoatCounter's all-time
range. Local development and preview deployments do not send visits.

References: [GoatCounter setup](https://www.goatcounter.com/help/start),
[API](https://www.goatcounter.com/help/api),
[session counts](https://www.goatcounter.com/help/sessions),
[excluding your visits](https://www.goatcounter.com/help/skip-dev),
[Vercel cron](https://vercel.com/docs/cron-jobs), and
[Deploy Hooks](https://vercel.com/docs/deploy-hooks).
