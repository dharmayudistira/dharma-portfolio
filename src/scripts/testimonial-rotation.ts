import { testimonials } from "../data/testimonials";

const sections = document.querySelectorAll<HTMLElement>("[data-testimonials]");

sections.forEach((section) => {
  if (section.dataset.ready === "true") return;

  const cards = Array.from(
    section.querySelectorAll<HTMLElement>("[data-testimonial-card]"),
  );
  const buttons = Array.from(
    section.querySelectorAll<HTMLButtonElement>("[data-testimonial-page]"),
  );
  const controls = section.querySelector<HTMLElement>("[data-testimonial-controls]");
  const announcer = section.querySelector<HTMLElement>("[data-testimonial-announcer]");
  const content = Array.from(
    section.querySelectorAll<HTMLElement>(
      "[data-testimonial-quote], [data-testimonial-identity]",
    ),
  );
  const hoverTargets = Array.from(
    section.querySelectorAll<HTMLElement>("[data-testimonial-card], .testimonials__pagination"),
  );
  const mobileQuery = window.matchMedia("(max-width: 768px)");
  const hoverQuery = window.matchMedia("(hover: hover)");

  if (cards.length === 0 || buttons.length === 0 || !controls || !announcer) return;

  section.dataset.ready = "true";

  let pageSize = mobileQuery.matches ? 1 : cards.length;
  let activePage = 0;
  let transitionId = 0;
  let isInView = false;
  let progress: Animation | undefined;
  let animations: Animation[] = [];

  const pageCount = () => Math.ceil(testimonials.length / pageSize);
  const syncPlayback = () => {
    if (!progress) return;

    const isHovered = hoverQuery.matches && hoverTargets.some((target) => target.matches(":hover"));
    const isPaused = document.hidden || !isInView || isHovered ||
      section.querySelector(":focus-visible") !== null;

    // A completed clock must wait while paused and must never restart on resume.
    if (progress.effect?.getComputedTiming().progress === 1) {
      if (!isPaused) void showPage((activePage + 1) % pageCount());
    } else if (isPaused) {
      progress.pause();
    } else if (progress.playState === "paused") {
      progress.play();
    }
  };
  const resetProgress = () => {
    progress?.cancel();
    const fill = buttons[activePage]?.querySelector<HTMLElement>("[data-testimonial-progress]");
    if (!fill || pageCount() <= 1) return;

    // The fill is also the autoplay clock, so pausing cannot put them out of sync.
    progress = fill.animate(
      [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
      { duration: 6000, easing: "linear", fill: "forwards" },
    );
    // Recheck the current clock: an old finish event can arrive after a dot click.
    progress.onfinish = syncPlayback;
    syncPlayback();
  };
  const writePage = () => {
    cards.forEach((card, index) => {
      const testimonialIndex = activePage * pageSize + index;
      const testimonial = testimonials[testimonialIndex];
      const quote = card.querySelector<HTMLElement>("[data-testimonial-quote]");
      const name = card.querySelector<HTMLElement>("[data-testimonial-name]");
      const company = card.querySelector<HTMLElement>("[data-testimonial-company]");

      card.hidden = index >= pageSize || !testimonial;
      if (card.hidden || !testimonial || !quote || !name || !company) return;

      quote.textContent = testimonial.quote;
      name.textContent = testimonial.name;
      company.textContent = testimonial.company;
      card.dataset.testimonialIndex = String(testimonialIndex);
    });

    buttons.forEach((button, index) => {
      button.hidden = index >= pageCount();
      button.tabIndex = index === activePage ? 0 : -1;
      button.setAttribute("aria-current", String(index === activePage));
      const first = index * pageSize + 1;
      const last = Math.min(first + pageSize - 1, testimonials.length);
      button.setAttribute("aria-label", pageSize === 1
        ? `Show testimonial ${first} of ${testimonials.length}`
        : `Show testimonials ${first} to ${last} of ${testimonials.length}`);
    });
    controls.hidden = pageCount() <= 1;
  };
  const animateContent = async (keyframes: Keyframe[], duration: number) => {
    animations.forEach((animation) => animation.cancel());
    animations = content.map((element) => element.animate(keyframes, {
      duration,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "both",
    }));
    await Promise.allSettled(animations.map(({ finished }) => finished));
  };
  const showPage = async (nextPage: number, animate = true, announce = false) => {
    const id = ++transitionId;
    activePage = nextPage;
    progress?.cancel();
    progress = undefined;
    animations.forEach((animation) => animation.cancel());

    if (animate) {
      await animateContent([
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(-6px)" },
      ], 180);
      if (id !== transitionId) return;
    }

    writePage();
    announcer.textContent = announce
      ? `Testimonial page ${activePage + 1} of ${pageCount()}`
      : "";

    if (animate) {
      await animateContent([
        { opacity: 0, transform: "translateY(8px)" },
        { opacity: 1, transform: "translateY(0)" },
      ], 320);
      if (id !== transitionId) return;
    }

    animations.forEach((animation) => animation.cancel());
    animations = [];
    resetProgress();
  };

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      void showPage(index, index !== activePage, true);
    });
    button.addEventListener("keydown", (event) => {
      let nextPage: number;
      switch (event.key) {
        case "ArrowLeft":
          nextPage = (index - 1 + pageCount()) % pageCount();
          break;
        case "ArrowRight":
          nextPage = (index + 1) % pageCount();
          break;
        case "Home":
          nextPage = 0;
          break;
        case "End":
          nextPage = pageCount() - 1;
          break;
        default:
          return;
      }
      event.preventDefault();
      buttons[nextPage]?.focus();
      void showPage(nextPage, nextPage !== activePage, true);
    });
  });

  hoverTargets.forEach((target) => {
    target.addEventListener("pointerenter", syncPlayback);
    target.addEventListener("pointerleave", syncPlayback);
  });
  section.addEventListener("focusin", syncPlayback);
  section.addEventListener("focusout", () => queueMicrotask(syncPlayback));
  section.addEventListener("keydown", syncPlayback);
  hoverQuery.addEventListener("change", syncPlayback);
  document.addEventListener("visibilitychange", syncPlayback);
  window.addEventListener("focus", syncPlayback);
  window.addEventListener("pageshow", syncPlayback);

  new IntersectionObserver(([entry]) => {
    isInView = entry.isIntersecting && entry.intersectionRatio >= 0.25;
    syncPlayback();
  }, { threshold: 0.25 }).observe(section);

  mobileQuery.addEventListener("change", () => {
    const firstIndex = activePage * pageSize;
    const hadFocus = controls.contains(document.activeElement);
    pageSize = mobileQuery.matches ? 1 : cards.length;
    void showPage(Math.floor(firstIndex / pageSize), false);
    if (hadFocus) buttons[activePage]?.focus();
  });

  void showPage(0, false);
});
