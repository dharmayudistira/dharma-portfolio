# Deployment

[Back to README](../README.md)

## Production setup

1. Connect the repository to Vercel and configure the production branch.
2. Set the [environment variables](../README.md#configuration) in Vercel's
   Production environment. Use the deployment origin for `SITE_URL`.
3. Set `GOATCOUNTER_URL` to the HTTPS dashboard origin, such as
   `https://yourcode.goatcounter.com`. Create a key with only permission to read
   statistics under the GoatCounter account's API settings, then set
   `GOATCOUNTER_API_KEY`. See the [GoatCounter API guide](https://www.goatcounter.com/help/api).
4. Create a [Deploy Hook](https://vercel.com/docs/deploy-hooks) for the production
   branch under Vercel Settings → Git → Deploy Hooks. Store its URL in
   `VERCEL_DEPLOY_HOOK_URL` and set `CRON_SECRET` to a random secret of at least
   16 characters.
5. Store `GOATCOUNTER_API_KEY`, `CRON_SECRET`, and `VERCEL_DEPLOY_HOOK_URL` as
   [Secrets in Vercel](https://vercel.com/docs/environment-variables/sensitive-environment-variables).
   Keep local values in the ignored `.env` or `.env.local`, then deploy.

Analytics and scheduled refreshes are optional; local development works without
their environment variables.

## Statistics behavior

The tracker runs only on Vercel production builds and excludes `noindex` pages.
Query strings and fragments share the same pathname's statistics. The API key
is used only at build time and is never sent to the browser.

`/statistics/` combines published content totals with visits across all available
history. Repeat loads of a page within a session count as one visit under
[GoatCounter's session rules](https://www.goatcounter.com/help/sessions).
Without the dashboard URL and API key, visit counts show `N/A`; content totals
still work.

To [exclude your own browser](https://www.goatcounter.com/help/skip-dev), append
`#toggle-goatcounter` to the production site's URL and follow the dialog.
Enable public dashboard access in GoatCounter if visitors should be able to
open the footer's analytics link.

## Daily refresh

[vercel.json](../vercel.json) schedules `/api/rebuild` at 17:00 UTC, or 00:00 WIB,
using `0 17 * * *`. On Hobby plans, execution can occur anywhere within that hour,
as described in [Vercel's cron scheduling rules](https://vercel.com/docs/cron-jobs/manage-cron-jobs).

The native [rebuild function](../api/rebuild.ts) runs separately from Astro's
static pages. It checks `CRON_SECRET` and calls the Deploy Hook, which rebuilds
the latest commit on its configured branch. A `202` response confirms the
request was accepted; fresh statistics appear only after a successful deployment.

## Verification and troubleshooting

- Run the checks listed in the [README](../README.md#checks) before publishing.
- Trigger a run from Vercel's Cron Jobs controls. Inspect the function logs,
  resulting deployment, and refresh timestamp on `/statistics/`. Compare visit
  totals with GoatCounter's all-time range.
- If a configured GoatCounter API request fails, the build fails and the
  previous deployment stays online. Vercel does not automatically retry failed
  cron invocations. See [cron error handling](https://vercel.com/docs/cron-jobs/manage-cron-jobs).
- Locally, `vercel pull --environment=production` can write `[SENSITIVE]`
  placeholders. Supply real values from your ignored local environment when
  running `vercel build --prod`.

Local development and preview deployments do not send visits to GoatCounter.
