import { testimonials } from "../data/testimonials";

const sections = document.querySelectorAll<HTMLElement>("[data-testimonials]");

const shuffle = (values: number[]) => {
  const shuffled = [...values];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }

  return shuffled;
};

sections.forEach((section) => {
  if (section.dataset.ready === "true") return;

  const cards = Array.from(
    section.querySelectorAll<HTMLElement>("[data-testimonial-card]"),
  );
  const mobileQuery = window.matchMedia("(max-width: 768px)");
  const allIndices = testimonials.map((_, index) => index);

  if (cards.length === 0 || testimonials.length <= cards.length) return;

  section.dataset.ready = "true";

  let bag = shuffle(allIndices.slice(cards.length));
  let slotCursor = 0;
  let isTransitioning = false;

  const getIndex = (card: HTMLElement) => Number(card.dataset.testimonialIndex);
  const refillBag = (excluded: Set<number>) => {
    bag = shuffle(allIndices.filter((index) => !excluded.has(index)));
  };
  const takeNext = (excluded: Set<number>) => {
    let candidatePosition = bag.findIndex((index) => !excluded.has(index));

    if (candidatePosition < 0) {
      refillBag(excluded);
      candidatePosition = 0;
    }

    return bag.splice(candidatePosition, 1)[0];
  };
  const writeCard = (card: HTMLElement, testimonialIndex: number) => {
    const testimonial = testimonials[testimonialIndex];
    const quote = card.querySelector<HTMLElement>("[data-testimonial-quote]");
    const name = card.querySelector<HTMLElement>("[data-testimonial-name]");
    const company = card.querySelector<HTMLElement>("[data-testimonial-company]");

    if (!testimonial || !quote || !name || !company) return false;

    quote.textContent = testimonial.quote;
    name.textContent = testimonial.name;
    company.textContent = testimonial.company;
    card.dataset.testimonialIndex = String(testimonialIndex);
    return true;
  };
  const swapCard = async (card: HTMLElement, testimonialIndex: number) => {
    const content = Array.from(
      card.querySelectorAll<HTMLElement>(
        "[data-testimonial-quote], [data-testimonial-identity]",
      ),
    );
    const exitAnimations = content.map((element) => element.animate(
      [
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(-6px)" },
      ],
      {
        duration: 180,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both",
      },
    ));

    await Promise.allSettled(exitAnimations.map(({ finished }) => finished));

    if (!writeCard(card, testimonialIndex)) {
      exitAnimations.forEach((animation) => animation.cancel());
      return;
    }

    exitAnimations.forEach((animation) => animation.cancel());

    const enterAnimations = content.map((element) => element.animate(
      [
        { opacity: 0, transform: "translateY(8px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 320,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both",
      },
    ));

    await Promise.allSettled(enterAnimations.map(({ finished }) => finished));
    enterAnimations.forEach((animation) => animation.cancel());
  };
  const normalizeDesktopCards = () => {
    if (mobileQuery.matches) return;

    const visible = new Set<number>();

    cards.forEach((card) => {
      const currentIndex = getIndex(card);

      if (!visible.has(currentIndex)) {
        visible.add(currentIndex);
        return;
      }

      const nextIndex = takeNext(visible);
      if (nextIndex === undefined || !writeCard(card, nextIndex)) return;
      visible.add(nextIndex);
    });
  };
  const rotate = async () => {
    if (isTransitioning || document.hidden) return;

    const visibleCards = mobileQuery.matches ? cards.slice(0, 1) : cards;
    const card = visibleCards[slotCursor % visibleCards.length];

    if (!card) return;

    const visibleIndices = new Set(visibleCards.map(getIndex));
    const nextIndex = takeNext(visibleIndices);

    if (nextIndex === undefined) return;

    isTransitioning = true;
    await swapCard(card, nextIndex);
    slotCursor = (slotCursor + 1) % visibleCards.length;
    isTransitioning = false;
  };

  mobileQuery.addEventListener("change", () => {
    slotCursor = 0;
    normalizeDesktopCards();
  });
  window.setInterval(rotate, 2500);
});
