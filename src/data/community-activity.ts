type LinkedBullet = {
  before: string;
  text: string;
  after: string;
  href: string;
};

export interface CommunityEntry {
  organization: string;
  role: string;
  start: string;
  end?: string;
  description?: string;
  bullets?: readonly (string | LinkedBullet)[];
  organizationUrl?: string;
}

export const communityActivities: readonly CommunityEntry[] = [
  {
    organization: "Google Developer Student Club",
    role: "Lead",
    start: "2019",
    bullets: [
      "Hosted campus workshops and meetups.",
      "Introduced students to Google products and technologies.",
      "Helped students become trainers and lead their own sessions.",
    ],
  },
  {
    organization: "Workshop & Riset Informatika",
    role: "Community Partner",
    start: "2019",
    bullets: [
      "Taught an Android miniclass to support the campus Google DSC community.",
      "Created the Android miniclass syllabus.",
    ],
  },
  {
    organization: "Workshop & Riset Informatika",
    role: "Head of Mobile Division",
    start: "2020",
    bullets: [
      "Led Android teaching and curriculum for the mobile division.",
      "Designed a capstone, organizing student teams to address local problems.",
    ],
  },
  {
    organization: "Bangkit Academy",
    role: "Student",
    start: "2021",
    bullets: [
      "Completed the Mobile Development path with distinction, ranking in the top 10% of 3,000 students.",
      "Built DeCare, an Android app for early dementia detection using machine learning, and published it on Google Play.",
      "Earned the Associate Android Developer certification.",
    ],
  },
  {
    organization: "Kampus Merdeka × Dicoding",
    role: "Student",
    start: "2022",
    bullets: [
      "Best Graduate (top performer among 400 students).",
      "Completed the Cross-Platform learning path.",
    ],
  },
  {
    organization: "SurabayaJS",
    organizationUrl: "https://www.instagram.com/surabaya.js/",
    role: "Speaker",
    start: "2023-08",
    bullets: [{
      before: "Presented “",
      text: "The Ins and Out of Flutter Web",
      after: "” to the SurabayaJS community.",
      href: "https://www.instagram.com/p/Cwl_VqOvCgd/",
    }],
  },
  {
    organization: "Bangkit Academy",
    role: "Android Instructor",
    start: "2024",
    bullets: ["Selected to teach Android programming and share practical experience with Bangkit students."],
  },
];
