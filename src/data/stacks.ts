export const STACK_CATEGORIES = [
  "Languages",
  "Frontend",
  "Mobile",
  "Backend",
  "Infrastructure",
  "AI",
] as const;

export const STACKS = [
  { id: "typescript", label: "TypeScript", category: "Languages" },
  { id: "dart", label: "Dart", category: "Languages" },
  { id: "kotlin", label: "Kotlin", category: "Languages" },

  { id: "react", label: "React", category: "Frontend" },
  { id: "nextjs", label: "Next.js", category: "Frontend" },
  { id: "astro", label: "Astro", category: "Frontend" },
  { id: "css", label: "CSS", category: "Frontend" },
  { id: "tanstack", label: "TanStack", category: "Frontend" },

  { id: "flutter", label: "Flutter", category: "Mobile" },
  { id: "android", label: "Android", category: "Mobile" },
  { id: "bloc", label: "BLoC", category: "Mobile" },
  { id: "riverpod", label: "Riverpod", category: "Mobile" },
  { id: "getx", label: "GetX", category: "Mobile" },
  { id: "viewmodel", label: "ViewModel", category: "Mobile" },

  { id: "nodejs", label: "Node.js", category: "Backend" },
  { id: "supabase", label: "Supabase", category: "Backend" },
  { id: "nestjs", label: "NestJS", category: "Backend" },
  { id: "mongodb", label: "MongoDB", category: "Backend" },
  { id: "postgresql", label: "PostgreSQL", category: "Backend" },

  { id: "vercel", label: "Vercel", category: "Infrastructure" },
  { id: "cloudflare", label: "Cloudflare", category: "Infrastructure" },
  { id: "monorepo", label: "Monorepo", category: "Infrastructure" },

  { id: "codex", label: "Codex", category: "AI" },
  { id: "claude", label: "Claude", category: "AI" },
  { id: "higgsfield", label: "Higgsfield", category: "AI" },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  category: (typeof STACK_CATEGORIES)[number];
}>;

export type StackId = (typeof STACKS)[number]["id"];

export const STACK_IDS = STACKS.map((stack) => stack.id);

export const STACK_LABELS = Object.fromEntries(
  STACKS.map(({ id, label }) => [id, label] as const),
);
