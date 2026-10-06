export const BLOG_CATEGORIES = [
  { id: "engineering", label: "Engineering" },
  { id: "design", label: "Design" },
  { id: "product", label: "Product" },
] as const;

export const BLOG_TAGS = [
  { id: "astro", label: "Astro" },
  { id: "performance", label: "Performance" },
  { id: "static-sites", label: "Static Sites" },
  { id: "animation", label: "Animation" },
  { id: "interaction-design", label: "Interaction Design" },
  { id: "design-systems", label: "Design Systems" },
  { id: "design-tokens", label: "Design Tokens" },
  { id: "web", label: "Web" },
  { id: "mobile", label: "Mobile" },
  { id: "cross-platform", label: "Cross-platform" },
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
