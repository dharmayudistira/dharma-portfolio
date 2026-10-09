import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";

const { SITE_URL: site } = loadEnv(
  process.env.NODE_ENV ?? "development",
  process.cwd(),
  "SITE_",
);

export default defineConfig({
  site,
  integrations: [
    {
      name: "separate-vite-caches",
      hooks: {
        "astro:config:setup": ({ command, updateConfig }) => {
          // Astro check/sync must not replace a running dev server's dependencies.
          updateConfig({ vite: { cacheDir: `node_modules/.vite/${command}` } });
        },
      },
    },
    mdx(),
    ...(site ? [sitemap()] : []),
  ],
});
