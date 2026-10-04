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
  integrations: [mdx(), ...(site ? [sitemap()] : [])],
});
