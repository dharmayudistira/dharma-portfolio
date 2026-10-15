export interface Testimonial {
  quote: string;
  name: string;
  company: string;
}

export const testimonials: readonly Testimonial[] = [
  {
    quote: "Dharma brought invaluable insights and a proactive attitude to our project. His expertise in frontend architecture and commitment to code quality resulted in a product that exceeded our expectations.",
    name: "Doni Rubiagatra",
    company: "Zero One Group",
  },
  {
    quote: "Dharma was such a pleasure to work with. He was thorough, thoughtful, and cared about the success of our company and it showed through the work he was doing. My team and I could not recommend him enough!",
    name: "Naya Brown",
    company: "Quete",
  },
  {
    quote: "Dharma brought clarity and consistency to our work together. He listened to the team, explained his approach, and followed through on the details that mattered to the product. I appreciated how easy he made collaboration feel.",
    name: "Aris Ripandi",
    company: "Zero One Group",
  },
];
