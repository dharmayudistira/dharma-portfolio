export const STACKS = [
  { id: "astro", label: "Astro" },
  { id: "typescript", label: "TypeScript" },
  { id: "css", label: "CSS" },
  { id: "vs-code", label: "VS Code" },
  { id: "cursor", label: "Cursor" },
  { id: "react", label: "React" },
  { id: "nextjs", label: "Next.js" },
  { id: "nodejs", label: "Node.js" },
  { id: "postgresql", label: "PostgreSQL" },
  { id: "dart", label: "Dart" },
  { id: "kotlin", label: "Kotlin" },
] as const;

export type StackId = (typeof STACKS)[number]["id"];

export const STACK_IDS = STACKS.map((stack) => stack.id);

export const STACK_LABELS = Object.fromEntries(
  STACKS.map(({ id, label }) => [id, label] as const),
);
