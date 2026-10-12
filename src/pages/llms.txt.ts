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
    `- [Home as Markdown](${url("/index.md")}): Text version of the home page.`,
    `- [Profile](${url("/profile/")}): Work history, community activity, and technology stack.`,
    `- [Projects](${url("/projects/")}): All published projects.`,
    `- [Blog](${url("/blog/")}): All published articles.`,
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
