import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { BLOG_CATEGORY_IDS, BLOG_TAG_IDS } from "./data/blog";
import { STACK_IDS } from "./data/stacks";

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      year: z.number().int(),
      projectType: z.enum([
        "full-time",
        "freelance",
        "self-built",
        "experiment",
      ]),
      role: z.string(),
      platform: z.string(),
      stack: z.array(z.enum(STACK_IDS)),
      cover: image().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      externalUrl: z.url().optional(),
      repositoryUrl: z.url().optional(),
    }),
});

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      category: z.enum(BLOG_CATEGORY_IDS),
      tags: z.array(z.enum(BLOG_TAG_IDS)).default([]),
      cover: image(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false),
      canonicalUrl: z.url().optional(),
    }),
});

export const collections = { projects, blog };
