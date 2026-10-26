import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { SITE_IDENTITY } from "../data/site";

const escapeXml = (value: string): string => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll("\"", "&quot;")
  .replaceAll("'", "&apos;");

export const GET: APIRoute = async ({ site }) => {
  if (!site) return new Response(null, { status: 404 });

  const [posts, projects] = await Promise.all([
    getCollection("blog", ({ data }) => !data.draft),
    getCollection("projects", ({ data }) => !data.draft),
  ]);
  const entries = [
    ...posts.map(({ id, data }) => ({
      title: data.title,
      description: data.description,
      publishedAt: data.publishedAt,
      path: `/blog/${id}/`,
    })),
    ...projects.map(({ id, data }) => ({
      title: data.title,
      description: data.summary,
      publishedAt: data.publishedAt,
      path: `/projects/${id}/`,
    })),
  ].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime() || a.path.localeCompare(b.path));
  const items = entries.map(({ title, description, publishedAt, path }) => {
    const url = escapeXml(new URL(path, site).toString());

    return `    <item>
      <title>${escapeXml(title)}</title>
      <description>${escapeXml(description)}</description>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${publishedAt.toUTCString()}</pubDate>
    </item>`;
  }).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${SITE_IDENTITY.name} | Blog & Projects`)}</title>
    <description>${escapeXml(`Published writing and project case studies from ${SITE_IDENTITY.name}.`)}</description>
    <link>${escapeXml(new URL("/", site).toString())}</link>
    <language>en</language>
    <atom:link href="${escapeXml(new URL("/rss.xml", site).toString())}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
