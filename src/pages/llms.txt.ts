import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { compareProjectsByTimeline } from "../data/projects";
import { SITE_IDENTITY } from "../data/site";

export const GET: APIRoute = async ({ site }) => {
  const [projects, posts] = await Promise.all([
    getCollection("projects", ({ data }) => !data.draft),
    getCollection("blog", ({ data }) => !data.draft),
  ]);
  const url = (path: string) => site ? new URL(path, site).toString() : path;
  const lines = [
    `# ${SITE_IDENTITY.name}`,
    "",
    `> ${SITE_IDENTITY.name} is a ${SITE_IDENTITY.role} building web and mobile products. This site contains his profile, projects, and writing.`,
    "",
    "## Main pages",
    "",
    `- [Home](${url("/")}): Overview and featured work.`,
    `- [Profile](${url("/profile/")}): Work history, community activity, and technology stack.`,
    `- [Projects](${url("/projects/")}): All published projects.`,
    `- [Blog](${url("/blog/")}): All published articles.`,
    `- [Statistics](${url("/statistics/")}): Published blog and project counts with all-time visits, refreshed daily.`,
    "",
    "## Machine-readable resources",
    "",
    `- [AI summary](${url("/ai/summary.json")}): Public identity and site links.`,
    `- [AI discovery](${url("/.well-known/ai.txt")}): Links to public discovery resources.`,
    `- [RSS](${url("/rss.xml")}): Published articles and project case studies.`,
    "",
    "## Projects",
    "",
    ...projects.sort(compareProjectsByTimeline).map(({ id, data }) =>
      `- [${data.title}](${url(`/projects/${id}/`)}): ${data.summary}`
    ),
    "",
    "## Writing",
    "",
    ...posts.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()).map(({ id, data }) =>
      `- [${data.title}](${url(`/blog/${id}/`)}): ${data.description}`
    ),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
