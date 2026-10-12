import type { CollectionEntry } from "astro:content";
import { STACK_LABELS } from "./stacks";

export const PROJECT_TYPE_LABELS = {
  "full-time": "Full-time",
  freelance: "Freelance",
  "self-built": "Self-built product",
  experiment: "Experiments & learning",
} satisfies Record<CollectionEntry<"projects">["data"]["projectType"], string>;

export const compareProjectsByTimeline = (
  a: CollectionEntry<"projects">,
  b: CollectionEntry<"projects">,
) => b.data.year - a.data.year || a.data.title.localeCompare(b.data.title);

export const getProjectSearchFields = (project: CollectionEntry<"projects">) => ({
  title: project.data.title,
  metadata: `${project.data.projectType} ${PROJECT_TYPE_LABELS[project.data.projectType]} ${project.data.platform} ${project.data.role} ${project.data.year} ${project.data.stack.map((id) => `${id} ${STACK_LABELS[id]}`).join(" ")}`,
  description: project.data.summary,
});
