import type { APIRoute } from "astro";
import { SITE_IDENTITY } from "../../data/site";

export const GET: APIRoute = ({ site }) => {
  if (!site) return new Response(null, { status: 404 });

  const url = (path: string) => new URL(path, site).toString();
  const lines = [
    `# ${SITE_IDENTITY.name}`,
    "",
    "Public site discovery resources. Crawler access is defined in robots.txt.",
    "",
    `Website: ${url("/")}`,
    `About: ${url("/profile/")}`,
    `Summary: ${url("/ai/summary.json")}`,
    `LLMs: ${url("/llms.txt")}`,
    `RSS: ${url("/rss.xml")}`,
    `Sitemap: ${url("/sitemap-index.xml")}`,
    `Robots: ${url("/robots.txt")}`,
  ];

  return new Response(`${lines.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
