import dicodingLogo from "../assets/work-history/dicoding.webp?url";
import neurafarmLogo from "../assets/work-history/neurafarm.webp?url";
import zeroOneGroupLogo from "../assets/work-history/zero-one-group.svg?url";
import type { StackId } from "./stacks";

export interface WorkExperience {
  company: string;
  companyUrl: string;
  logo?: string;
  logoShape?: "circle" | "rounded-square";
  logoOnLight?: boolean;
  role: string;
  employmentType: "Internship" | "Part-time" | "Full-time";
  start: string;
  end: string | null;
  bullets: readonly string[];
  stack: readonly StackId[];
}

export const workHistory: readonly WorkExperience[] = [
  {
    company: "Zero One Group",
    companyUrl: "https://zero-one-group.com/",
    logo: zeroOneGroupLogo,
    logoShape: "circle",
    role: "Product Engineer",
    employmentType: "Full-time",
    start: "2022-09",
    end: null,
    bullets: [
      "Migrated legacy codebases and standardized coding practices and development workflows.",
      "Developed Flutter apps for retail investing (1,000+ downloads) and luxury resale (500K+ downloads).",
      "Contributed web features to a climate finance hub with 300+ resources and events and an F&B commerce platform with 5,000+ SKUs.",
      "Helped develop an AI workspace for real estate agents with 5 custom tools.",
    ],
    stack: ["flutter", "react", "nextjs", "tanstack", "monorepo"],
  },
  {
    company: "Dicoding Indonesia",
    companyUrl: "https://www.dicoding.com/",
    logo: dicodingLogo,
    logoShape: "rounded-square",
    role: "External Academy Reviewer",
    employmentType: "Part-time",
    start: "2021-08",
    end: "2025-12",
    bullets: [
      "Reviewed thousands of student submissions across Android and Multiplatform learning paths.",
      "Maintained rigorous quality standards and provided actionable technical feedback.",
    ],
    stack: ["android", "flutter"],
  },
  {
    company: "Neurafarm",
    companyUrl: "https://www.neurafarm.com/",
    logo: neurafarmLogo,
    logoShape: "rounded-square",
    logoOnLight: true,
    role: "Software Engineer - Mobile",
    employmentType: "Internship",
    start: "2021-06",
    end: "2021-09",
    bullets: [
      "Built \"Sobat Tania\", a cross-platform internal app deployed across Web, Android, and iOS using Flutter.",
      "Integrated with backend infrastructure and iterated on features based on direct user feedback.",
    ],
    stack: ["android", "flutter", "getx"],
  },
];
