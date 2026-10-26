# Dharma Portfolio

Dharma Yudistira's personal portfolio for product engineering, project case
studies, and writing. Built with Astro, strict TypeScript, MDX, native CSS,
and GSAP, with static pages, dark/light themes, and an engineering drawing style.

[Live site](https://www.dharma-yudistira.com/)

Main routes: `/`, `/projects/`, `/blog/`, `/profile/`, and `/statistics/`.

## Quick start

```sh
npm install
cp .env.example .env
```

Set `SITE_URL` in `.env` to your production origin, then start development.
The other environment variables can stay blank for local work.

```sh
npm run dev
```

## Where to edit

| Path | Purpose |
| --- | --- |
| `src/pages/` | Routes and generated endpoints. |
| `src/content/blog/`, `src/content/projects/` | Posts and case studies in MDX. |
| `src/components/`, `src/layouts/` | Reusable interface, page shells, and metadata. |
| `src/styles/` | Shared CSS and design tokens. |
| `src/data/` | Identity, catalogs, and shared site data. |

Copy the collection's `_template.mdx` for new content. Keep `draft: true` until
ready to publish; published filenames define permanent URLs.

## Public resources

Pages share structured person metadata; `/profile/` serves as the about page.
`/llms.txt`, `/.well-known/ai.txt`, and `/ai/summary.json` describe the public site
for AI agents. `/rss.xml` includes published posts and project case studies,
newest first. These resources are generated at build time. Crawler permissions
are defined in `/robots.txt`.

## Configuration

Use the ignored `.env` or `.env.local` locally and Vercel's Production environment
for deployment. See [.env.example](.env.example) for the complete template.

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | Production origin for canonical URLs, metadata, feeds, and sitemap. |
| `GOATCOUNTER_URL` | Optional HTTPS dashboard origin for analytics. |
| `GOATCOUNTER_API_KEY` | Optional private, read-only key for visit counts. |
| `CRON_SECRET` | Private authentication for scheduled rebuilds. |
| `VERCEL_DEPLOY_HOOK_URL` | Private rebuild hook for the production branch. |

GoatCounter statistics are fetched at build time. See the
[deployment guide](docs/deployment.md) for analytics setup, daily refreshes,
and troubleshooting.

## Checks

```sh
npm test
npm run check
npm run build
```

Use `npm run preview` to inspect the production build. Before editing, read
[AGENTS.md](AGENTS.md) and the applicable [rules](rules/).
