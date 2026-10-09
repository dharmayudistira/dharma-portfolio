export interface WorkExperience {
  company: string;
  companyUrl: string;
  role: string;
  start: string;
  end: string | null;
  description: string;
}

// Fictional entries for the work-history preview.
export const workHistory = [
  {
    company: "Example Studio",
    companyUrl: "https://example.com/",
    role: "Frontend Engineer",
    start: "2022-06",
    end: "2024-02",
    description:
      "Built responsive dashboards and customer-facing interfaces, working with designers to turn product ideas into reliable web experiences.",
  },
  {
    company: "Example Labs",
    companyUrl: "https://example.org/",
    role: "Product Engineer",
    start: "2024-03",
    end: null,
    description:
      "Building web and mobile products, from early prototypes to polished releases, with a focus on usability and performance.",
  },
] satisfies readonly WorkExperience[];
