import assert from "node:assert/strict";
import { test } from "node:test";
import { createSearchIndex, searchIndex } from "../src/scripts/search-matching.ts";

const projects = [
  { title: "Adaptive Product Platform", metadata: "experiment Experiments & learning Web Mobile React Next.js nextjs 2026 Product Engineer", description: "Clear workflows across desktop and mobile surfaces." },
  { title: "Mobile Interaction Toolkit", metadata: "self-built Self-built product Mobile Kotlin 2025 Mobile Product Engineer", description: "Responsive motion and touch behavior." },
  { title: "Operational Design System", metadata: "freelance Web Astro TypeScript CSS 2026 Design Systems Engineer", description: "Shared interface decisions." },
];
const index = createSearchIndex(projects);
const titles = (results) => results.map(({ title }) => title);

test("matches words across project metadata in any order and requires every word", () => {
  assert.deepEqual(searchIndex(index, "kotlin mobile"), [projects[1]]);
  assert.deepEqual(searchIndex(index, "mobile kotlin"), [projects[1]]);
  assert.deepEqual(searchIndex(index, "freelance engineer 2026"), [projects[2]]);
  assert.deepEqual(searchIndex(index, "experiments learning web"), [projects[0]]);
  assert.deepEqual(searchIndex(index, "mobile astro"), []);
});

test("normalizes case, whitespace, punctuation and accents", () => {
  for (const query of ["NEXT.JS", "nextjs", "  next   js  "]) {
    assert.deepEqual(searchIndex(index, query), [projects[0]]);
  }
  for (const query of ["self-built", "self built"]) {
    assert.deepEqual(searchIndex(index, query), [projects[1]]);
  }
  assert.equal(searchIndex(createSearchIndex([{ title: "Café", metadata: "", description: "" }]), "cafe").length, 1);
});

test("matches blog categories and tags alongside titles and descriptions", () => {
  const post = { title: "Fast Sites", metadata: "Engineering Astro Static Sites", description: "Selective JavaScript." };
  assert.deepEqual(searchIndex(createSearchIndex([post]), "static-sites engineering"), [post]);
  assert.deepEqual(searchIndex(createSearchIndex([post]), "javascript astro"), [post]);
});

test("accepts one insertion, deletion, substitution or adjacent transposition in longer words", () => {
  for (const query of ["kotlinn", "kotln", "kotlun", "kotiln"]) {
    assert.deepEqual(searchIndex(index, query), [projects[1]], query);
  }
  assert.deepEqual(searchIndex(index, "kotllinn"), []);
  assert.deepEqual(searchIndex(index, "cxs"), []);
  assert.deepEqual(searchIndex(index, "2027"), []);
});

test("ranks literal matches before typos, whole words before partial words, and titles before metadata before descriptions", () => {
  const ranked = createSearchIndex([
    { title: "Typo", metadata: "", description: "Moblie" },
    { title: "Partial", metadata: "", description: "Automobile" },
    { title: "Description", metadata: "", description: "Mobile" },
    { title: "Metadata", metadata: "Mobile", description: "" },
    { title: "Mobile", metadata: "", description: "" },
  ]);
  assert.deepEqual(titles(searchIndex(ranked, "mobile")), ["Mobile", "Metadata", "Description", "Partial", "Typo"]);
  assert.deepEqual(searchIndex(index, "interact"), [projects[1]]);
});

test("preserves date order for ties and restores all items when cleared", () => {
  assert.deepEqual(searchIndex(index, "2026"), [projects[0], projects[2]]);
  searchIndex(index, "mobile");
  for (const query of ["", "   ", "?!"]) assert.deepEqual(searchIndex(index, query), projects);
  assert.deepEqual(searchIndex(index, "mobile mobile"), searchIndex(index, "mobile"));
  assert.deepEqual(searchIndex(createSearchIndex([]), "anything"), []);
});
