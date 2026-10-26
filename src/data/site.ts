export const SITE_IDENTITY = {
  name: "Dharma Yudistira",
  shortName: "Dharma",
  role: "Product Engineer",
  employer: {
    name: "Zero One Group",
    url: "https://zero-one-group.com/",
  },
  links: {
    x: "https://x.com/justamannothero",
    instagram: "https://www.instagram.com/dharmayudistira_/",
    linkedin: "https://www.linkedin.com/in/dharmayudistira/",
    github: "https://github.com/dharmayudistira",
    upwork: "https://www.upwork.com/freelancers/~01eced17d5102f0a7e",
    email: "dharmayudistira2000@gmail.com",
    repository: "https://github.com/dharmayudistira/dharma-portfolio",
  },
} as const;

export const SITE_DESCRIPTION = `${SITE_IDENTITY.name}, product engineer working across frontend and mobile experiences.`;

export const getPersonSchema = (site: URL) => ({
  "@type": "Person",
  "@id": new URL("/profile/#person", site).toString(),
  name: SITE_IDENTITY.name,
  url: new URL("/profile/", site).toString(),
  mainEntityOfPage: { "@id": new URL("/profile/#webpage", site).toString() },
  jobTitle: SITE_IDENTITY.role,
  sameAs: [
    SITE_IDENTITY.links.x,
    SITE_IDENTITY.links.instagram,
    SITE_IDENTITY.links.linkedin,
    SITE_IDENTITY.links.github,
    SITE_IDENTITY.links.upwork,
  ],
  worksFor: {
    "@type": "Organization",
    name: SITE_IDENTITY.employer.name,
    url: SITE_IDENTITY.employer.url,
  },
});
