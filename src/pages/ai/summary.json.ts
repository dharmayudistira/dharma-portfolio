import type { APIRoute } from "astro";
import { getPersonSchema, SITE_DESCRIPTION, SITE_IDENTITY } from "../../data/site";

export const GET: APIRoute = ({ site }) => {
  if (!site) return new Response(null, { status: 404 });

  const url = (path: string) => new URL(path, site).toString();

  return Response.json({
    name: SITE_IDENTITY.name,
    description: SITE_DESCRIPTION,
    url: url("/"),
    person: getPersonSchema(site),
    links: {
      about: url("/profile/"),
      projects: url("/projects/"),
      blog: url("/blog/"),
      rss: url("/rss.xml"),
      llms: url("/llms.txt"),
      sitemap: url("/sitemap-index.xml"),
    },
  });
};
