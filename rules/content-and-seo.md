# Content and SEO Rules

Apply these rules to MDX, Content Collections, metadata, structured data, and
publishing behavior. SEO includes search indexing. GEO means making content
clear and attributable for answer engines and AI-assisted search.

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

Posts require `title`, `description`, `publishedAt`, `cover`, and `draft`.
Optional fields are `updatedAt`, `tags`, `featured`, and `canonicalUrl`.

Do not weaken schemas to accommodate one malformed entry. Correct the entry or
propose an intentional schema change with its route and metadata impact.

## Writing and MDX

- Use one descriptive H1 supplied by the page layout.
- Start authored content at H2 and preserve a logical heading hierarchy.
- Use descriptive link text and meaningful image alternative text.
- Keep the important explanation in text, not only in an interactive element.
- Use embedded components only when they add material value.
- Do not place secrets or executable third-party snippets in MDX.

## Metadata

- Every public page needs a unique title and useful description.
- Use `SITE_URL` for canonical, Open Graph, JSON-LD, robots, and sitemap URLs.
- Never guess a production origin when `SITE_URL` is absent.
- Use an explicit canonical URL only for intentionally cross-published content.
- Keep article publish and update dates accurate.
- Provide a social image when a suitable versioned asset exists.

## Structured Content and GEO

- Keep schema.org data consistent with visible page content.
- Use `BlogPosting` only for actual posts and the person identity for the
  portfolio owner.
- Prefer direct statements of role, project outcome, constraints, and tools.
- Add useful internal links between related pages without keyword stuffing.
- Do not generate repetitive hidden copy for search engines or answer engines.

## Publishing Check

Before setting `draft: false`, verify frontmatter, permanent slug, headings,
links, images, metadata, build output, and the final public route.
