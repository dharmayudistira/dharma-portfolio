import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { compareProjectsByTimeline } from "../data/projects";
import { SITE_IDENTITY } from "../data/site";
import { STACKS } from "../data/stacks";

export const GET: APIRoute = async ({ site }) => {
  const [projects, posts] = await Promise.all([
    getCollection("projects", ({ data }) => !data.draft && data.featured),
    getCollection("blog", ({ data }) => !data.draft),
  ]);
  const url = (path: string) => site ? new URL(path, site).toString() : path;
  const featuredPost = posts.sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  ).find(({ data }) => data.featured) ?? posts[0];
  const homePosts = featuredPost
    ? [featuredPost, ...posts.filter(({ id }) => id !== featuredPost.id).slice(0, 3)]
    : [];
  const lines = [
    `# ${SITE_IDENTITY.name}`,
    "",
    `${SITE_IDENTITY.role} at ${SITE_IDENTITY.employer.name}, building web and mobile products.`,
    "",
    "## Explore",
    "",
    `- [Profile](${url("/profile/")}): Work history, community activity, and technology stack.`,
    `- [Projects](${url("/projects/")}): All published projects.`,
    `- [Blog](${url("/blog/")}): All published articles.`,
    `- [Statistics](${url("/statistics/")}): Published blog and project counts with all-time visits, refreshed daily.`,
    "",
    "## Technology stack",
    "",
    STACKS.map(({ label }) => label).join(", "),
    "",
    "## Featured writing",
    "",
    ...homePosts.map(({ id, data }) =>
      `- [${data.title}](${url(`/blog/${id}/`)}): ${data.description}`
    ),
    "",
    "## Featured projects",
    "",
    ...projects.sort(compareProjectsByTimeline).map(({ id, data }) =>
      `- [${data.title}](${url(`/projects/${id}/`)}): ${data.summary}`
    ),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
