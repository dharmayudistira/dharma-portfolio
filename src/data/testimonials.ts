export interface Testimonial {
  quote: string;
  name: string;
  company: string;
}

export const testimonials = [
  {
    quote: "Dharma turns complicated product problems into experiences that feel clear, thoughtful, and easy to use.",
    name: "Maya Chen",
    company: "Northstar Labs",
  },
  {
    quote: "He brings engineering depth into design conversations without losing sight of the people using the product.",
    name: "Jordan Lee",
    company: "Studio Current",
  },
  {
    quote: "Working with Dharma made every handoff feel lighter. The details were considered before they became problems.",
    name: "Nadia Putri",
    company: "Loom Works",
  },
  {
    quote: "He can move from system thinking to polished interaction work while keeping the whole team aligned.",
    name: "Elias Morgan",
    company: "Field Notes",
  },
  {
    quote: "Dharma asks the right questions early, then builds with a level of care that shows in the final experience.",
    name: "Priya Raman",
    company: "Common Ground",
  },
  {
    quote: "The result was not only technically solid. It felt coherent, intentional, and unmistakably ours.",
    name: "Theo Bennett",
    company: "Orbit Systems",
  },
  {
    quote: "He made a complex workflow understandable without flattening the personality that made the product special.",
    name: "Aisha Rahman",
    company: "Parallel Studio",
  },
  {
    quote: "Dharma is the rare engineer who notices both the edge cases in the system and the rhythm of the interface.",
    name: "Noah Kim",
    company: "Signal House",
  },
  {
    quote: "Every iteration became sharper because he could connect user needs, visual intent, and implementation reality.",
    name: "Clara Wijaya",
    company: "Kinship Labs",
  },
] satisfies readonly Testimonial[];
