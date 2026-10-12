import type { CollectionEntry } from "astro:content";

export const BLOG_CATEGORIES = [
  { id: "engineering", label: "Engineering" },
  { id: "design", label: "Design" },
  { id: "product", label: "Product" },
] as const;

export const BLOG_TAGS = [
  { id: "performance", label: "Performance" },
  { id: "flutter", label: "Flutter" },
  { id: "react-native", label: "React Native" },
  { id: "mobile", label: "Mobile" },
  { id: "android", label: "Android" },
  { id: "ios", label: "iOS" },
  { id: "book", label: "Book" },
  { id: "ai", label: "AI" },
  { id: "career-reflection", label: "Career Reflection" },
  { id: "effective-engineering", label: "Effective Engineering" },
] as const;

export type BlogCategoryId = (typeof BLOG_CATEGORIES)[number]["id"];
export type BlogTagId = (typeof BLOG_TAGS)[number]["id"];

export const BLOG_CATEGORY_IDS = BLOG_CATEGORIES.map((category) => category.id);
export const BLOG_TAG_IDS = BLOG_TAGS.map((tag) => tag.id);

export const BLOG_CATEGORY_LABELS = Object.fromEntries(
  BLOG_CATEGORIES.map(({ id, label }) => [id, label] as const),
);

export const BLOG_TAG_LABELS = Object.fromEntries(
  BLOG_TAGS.map(({ id, label }) => [id, label] as const),
);

export const getBlogSearchFields = (post: CollectionEntry<"blog">) => ({
  title: post.data.title,
  metadata: `${BLOG_CATEGORY_LABELS[post.data.category]} ${post.data.tags.map((id) => BLOG_TAG_LABELS[id]).join(" ")}`,
  description: post.data.description,
});

export const getBlogReadingMinutes = (body: string | undefined): number => {
  const wordCount = (body ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/[`*_#[\]()>-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(wordCount / 200));
};

export const formatBlogDate = (date: Date): string => {
  const day = date.getUTCDate();
  const remainder = day % 100;
  const suffix = remainder >= 11 && remainder <= 13
    ? "th"
    : day % 10 === 1
      ? "st"
      : day % 10 === 2
        ? "nd"
        : day % 10 === 3
          ? "rd"
          : "th";
  const month = new Intl.DateTimeFormat("en", { month: "long", timeZone: "UTC" }).format(date);

  return `${month} ${day}${suffix}, ${date.getUTCFullYear()}`;
};
