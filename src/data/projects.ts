import type { CollectionEntry } from "astro:content";

export const PROJECT_TYPE_LABELS = {
  "full-time": "Full-time",
  freelance: "Freelance",
  "self-built": "Self-built product",
  experiment: "Experiments & learning",
} satisfies Record<CollectionEntry<"projects">["data"]["projectType"], string>;
