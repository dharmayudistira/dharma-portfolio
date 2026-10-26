# Content and SEO Rules

Apply these rules to MDX, Content Collections, metadata, structured data, RSS,
AI discovery files, and publishing behavior. SEO includes search indexing. GEO
means making content clear and attributable for answer engines and AI-assisted
search.

## Content Collections

- Store projects in `src/content/projects/` and posts in `src/content/blog/`.
- Use `.mdx` for new entries, starting from the local `_template.mdx`.
- Validate all frontmatter through `src/content.config.ts`.
- Keep dates as ISO-compatible values that `z.coerce.date()` can parse.
- Keep `draft: true` while an entry is incomplete.
- Filter drafts from indexes, static paths, feeds, and sitemap-visible routes.
- Keep a published filename stable because it defines the URL slug.

## Required Project Data

Projects require `title`, `summary`, `year`, `projectType`, `role`, `platform`,
`stack`, `publishedAt`, and `draft`. Optional fields are `cover`, `featured`,
`updatedAt`, `externalUrl`, and `repositoryUrl`.

Choose `projectType` explicitly; it has no default. Replace the template's
sample value with the project's primary category:

| Value | Display label | Use for |
| --- | --- | --- |
| `full-time` | Full-time | Work delivered as an employee. |
| `freelance` | Freelance | Work delivered for a client through a paid engagement. |
| `self-built` | Self-built product | A product you create and own for intended users. |
| `experiment` | Experiments & learning | Personal exploration, practice, or technology trials. |

Store `stack` as an array of IDs from the shared catalog in
`src/data/stacks.ts`, such as `astro` and `typescript`. Unknown IDs fail
collection validation. Add a technology's ID and display label to `STACKS`
before referencing it in project frontmatter. Components use `STACK_LABELS`
for display; selections such as the marquee keep their own ID order.

## Required Blog Data

Posts require `title`, `description`, `publishedAt`, `category`, and `draft`.
Optional fields are `updatedAt`, `tags`, `coAuthors`, `cover`, `featured`, and
`canonicalUrl`. Dharma is the primary author; list additional credited authors
in `coAuthors` so the visible byline and structured data stay aligned.

Choose one `category` ID from `BLOG_CATEGORIES` in `src/data/blog.ts`:
`engineering`, `design`, or `product`. Categories are broad areas; `tags` are
narrower topics and may appear across categories.

Store `tags` as an array of IDs from `BLOG_TAGS` in the same catalog, such as
`astro`, `performance`, or `design-systems`. Unknown category and tag IDs fail
collection validation. Add an ID and display label to the catalog before using
it in frontmatter. Components use `BLOG_CATEGORY_LABELS` and `BLOG_TAG_LABELS`
for display and search.

Reading time is derived from the MDX body at 200 words per minute, rounded up
with a minimum of one minute. Do not store it in frontmatter.

Do not weaken schemas to accommodate one malformed entry. Correct the entry or
propose an intentional schema change with its route and metadata impact.

## Writing and MDX

- Use one descriptive H1 supplied by the page layout.
- Start authored content at H2 and preserve a logical heading hierarchy.
- Use descriptive link text. Describe informative images and follow the
  [decorative image rules](design-system.md#icons-and-svg) for decorative ones.
- Keep the important explanation in text, not only in an interactive element.
- Use embedded components only when they add material value.
- Do not place secrets or executable third-party snippets in MDX.

For images in project and blog MDX, use `ContentImage` with an imported local
asset. It preserves the aspect ratio, loads lazily, and handles responsive
image selection. Keep captions in a surrounding `<figure>` and `<figcaption>`.

```mdx
import ContentImage from "../../components/ContentImage.astro";
import screenshot from "../../assets/screenshot.webp";

<ContentImage src={screenshot} alt="Describe what the screenshot shows." />
```

## Metadata

- Every public page needs a unique title and useful description.
- Use `SITE_URL` for canonical, Open Graph, JSON-LD, robots, and sitemap URLs.
- Never guess a production origin when `SITE_URL` is absent.
- When `SITE_URL` is configured, default to one canonical URL pointing to the
  indexable page's own URL. Reserve external canonical overrides for intentionally
  cross-published content.
- Keep original publication dates accurate. Set `updatedAt` only for substantive
  content changes; never derive content dates from builds or statistics refreshes.
- Emit `updatedAt`, when provided, as `dateModified` and applicable article
  metadata. Follow the [protected update-date decision](../AGENTS.md#protected-product-decisions).
- Provide a social image when a suitable versioned asset exists.

## Structured Content and GEO

- Keep schema.org data consistent with visible page content.
- Reuse `SITE_IDENTITY` and `getPersonSchema()` from `src/data/site.ts`. Preserve
  `/profile/#person` as the shared owner identifier and keep author and publisher
  references consistent across pages and discovery files.
- The website's author and publisher are the owner's `Person` record. Identify
  the actual employer through `worksFor`; the employer is not the site publisher.
- `/profile/` serves as the about page with `ProfilePage` and `AboutPage` metadata.
- Use `BlogPosting` only for actual posts; other schema types must match the
  page's purpose and content.
- Prefer direct statements of role, project outcome, constraints, and tools.
- Add useful internal links between related pages without keyword stuffing.
- Do not generate repetitive hidden copy for search engines or answer engines.

## Feeds and AI Discovery

- Maintain `/rss.xml`, `/llms.txt`, `/.well-known/ai.txt`, and `/ai/summary.json`
  as generated public resources using shared site data and `SITE_URL`.
- RSS includes published blog posts and project case studies, using summaries
  ordered newest first by publication date, with stable permalink links and GUIDs.
- Exclude drafts and secrets from discovery resources. Keep their links, RSS
  discovery metadata, and footer destinations valid.
- `/index.md` was intentionally removed. Keep it out of generated discovery
  links and automatic audit fixes.
- `robots.txt` governs crawler access. Discovery files are optional conventions;
  Google AI search features require no additional AI files or special schema.
  See [Google's AI search guidance](https://developers.google.com/search/docs/appearance/ai-features).

## Publishing Check

Before setting `draft: false`, verify frontmatter, permanent slug, headings,
links, images, metadata, build output, and the final public route.
