const sliders = document.querySelectorAll<HTMLElement>("[data-project-slider]");

sliders.forEach((slider) => {
  if (slider.dataset.ready === "true") return;

  const slides = Array.from(
    slider.querySelectorAll<HTMLElement>("[data-project-slide]"),
  );
  const previousButton = slider.querySelector<HTMLButtonElement>("[data-project-previous]");
  const nextButton = slider.querySelector<HTMLButtonElement>("[data-project-next]");
  const currentLabel = slider.querySelector<HTMLElement>("[data-project-current]");
  const roleLabel = slider.querySelector<HTMLElement>("[data-project-role]");
  const announcer = slider.querySelector<HTMLElement>("[data-project-announcer]");
  const viewport = slider.querySelector<HTMLElement>("[data-project-viewport]");
  const currentText = currentLabel?.querySelector<HTMLElement>(
    "[data-project-current-text]",
  );
  const counterDigits = Array.from(
    currentLabel?.querySelectorAll<HTMLElement>(
      "[data-project-counter-digit]",
    ) ?? [],
  );

  if (
    slides.length === 0 ||
    !currentLabel ||
    !currentText ||
    counterDigits.length === 0 ||
    !roleLabel ||
    !announcer ||
    !viewport
  ) {
    return;
  }

  slider.dataset.ready = "true";

  let activeIndex = 0;
  let isTransitioning = false;
  let pointerStart: { x: number; y: number } | undefined;

  const formatIndex = (index: number) => String(index + 1).padStart(2, "0");
  const updateNavigation = () => {
    if (previousButton) previousButton.disabled = activeIndex === 0 || isTransitioning;
    if (nextButton) nextButton.disabled = activeIndex === slides.length - 1 || isTransitioning;
  };

  const animateCounter = async (nextIndex: number, direction: number) => {
    const nextValue = formatIndex(nextIndex);
    const changes: Array<{
      currentValue: HTMLElement;
      incomingValue: HTMLElement;
      nextDigit: string;
      animations: Animation[];
    }> = [];

    counterDigits.forEach((digit, index) => {
      const currentValue = digit.querySelector<HTMLElement>(
        "[data-project-counter-value]",
      );
      const nextDigit = nextValue[index];

      if (
        !currentValue ||
        nextDigit === undefined ||
        currentValue.textContent === nextDigit
      ) {
        return;
      }

      const incomingValue = document.createElement("span");
      incomingValue.className = "featured-projects__counter-value";
      incomingValue.textContent = nextDigit;
      digit.append(incomingValue);

      const outgoingEnd = -100 * direction;
      const incomingStart = 100 * direction;
      const animations = [
        currentValue.animate(
          [
            {
              transform: "translateY(0)",
              offset: 0,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            },
            {
              transform: `translateY(${-108 * direction}%)`,
              offset: 0.76,
              easing: "ease-out",
            },
            {
              transform: `translateY(${-97 * direction}%)`,
              offset: 0.9,
              easing: "ease-out",
            },
            { transform: `translateY(${outgoingEnd}%)`, offset: 1 },
          ],
          { duration: 360, fill: "both" },
        ),
        incomingValue.animate(
          [
            {
              transform: `translateY(${incomingStart}%)`,
              offset: 0,
              easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            },
            {
              transform: `translateY(${-8 * direction}%)`,
              offset: 0.76,
              easing: "ease-out",
            },
            {
              transform: `translateY(${3 * direction}%)`,
              offset: 0.9,
              easing: "ease-out",
            },
            { transform: "translateY(0)", offset: 1 },
          ],
          { duration: 360, fill: "both" },
        ),
      ];

      changes.push({ currentValue, incomingValue, nextDigit, animations });
    });

    await Promise.allSettled(
      changes.flatMap(({ animations }) =>
        animations.map(({ finished }) => finished),
      ),
    );

    changes.forEach(({ currentValue, incomingValue, nextDigit, animations }) => {
      currentValue.textContent = nextDigit;
      animations.forEach((animation) => animation.cancel());
      incomingValue.remove();
    });
    currentText.textContent = nextValue;
  };

  const animateRole = async (nextRole: string, direction: number) => {
    const exitAnimation = roleLabel.animate(
      [
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: `translateY(${-6 * direction}px)` },
      ],
      {
        duration: 180,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "forwards",
      },
    );

    await exitAnimation.finished;
    roleLabel.textContent = nextRole;
    exitAnimation.cancel();

    const enterAnimation = roleLabel.animate(
      [
        {
          opacity: 0,
          transform: `translateY(${6 * direction}px)`,
          offset: 0,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
        {
          opacity: 1,
          transform: `translateY(${-1.2 * direction}px)`,
          offset: 0.72,
          easing: "ease-out",
        },
        {
          opacity: 1,
          transform: `translateY(${0.4 * direction}px)`,
          offset: 0.9,
          easing: "ease-out",
        },
        { opacity: 1, transform: "translateY(0)", offset: 1 },
      ],
      {
        duration: 260,
        fill: "both",
      },
    );

    await enterAnimation.finished;
    enterAnimation.cancel();
  };

  const animateToolbar = async (
    nextIndex: number,
    nextRole: string,
    direction: number,
  ) => {
    await Promise.all([
      animateCounter(nextIndex, direction),
      animateRole(nextRole, direction),
    ]);
  };

  const showProject = async (nextIndex: number) => {
    if (
      isTransitioning ||
      nextIndex === activeIndex ||
      nextIndex < 0 ||
      nextIndex >= slides.length
    ) {
      return;
    }

    isTransitioning = true;
    updateNavigation();

    const direction = nextIndex > activeIndex ? 1 : -1;
    const currentSlide = slides[activeIndex];
    const nextSlide = slides[nextIndex];
    const contentGroups = [
      {
        selector: "[data-project-copy] h3",
        delay: 60,
        duration: 360,
        distance: 12,
      },
      {
        selector: ".featured-projects__summary",
        delay: 90,
        duration: 330,
        distance: 10,
      },
      {
        selector: ".featured-projects__case-study, [data-project-details] dd",
        delay: 120,
        duration: 300,
        distance: 8,
      },
    ];
    const currentImage = currentSlide.querySelector<HTMLImageElement>(
      "[data-project-visual] img",
    );
    const nextImage = nextSlide.querySelector<HTMLImageElement>(
      "[data-project-visual] img",
    );
    const nextRole = nextSlide.dataset.projectRole ?? "Project role";

    currentSlide.inert = true;
    currentSlide.setAttribute("aria-hidden", "true");
    nextSlide.hidden = false;
    nextSlide.inert = true;
    nextSlide.setAttribute("aria-hidden", "false");
    nextSlide.classList.add("featured-projects__slide--entering");

    const animations: Animation[] = [];
    const outgoingTiming: KeyframeAnimationOptions = {
      duration: 180,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "both",
    };
    contentGroups.forEach(({ selector, delay, duration, distance }) => {
      currentSlide.querySelectorAll<HTMLElement>(selector).forEach((element) => {
        animations.push(element.animate(
          [
            { opacity: 1, transform: "translateX(0)" },
            { opacity: 0, transform: `translateX(${-10 * direction}px)` },
          ],
          outgoingTiming,
        ));
      });
      nextSlide.querySelectorAll<HTMLElement>(selector).forEach((element) => {
        animations.push(element.animate(
          [
            { opacity: 0, transform: `translateX(${distance * direction}px)` },
            { opacity: 1, transform: "translateX(0)" },
          ],
          {
            duration,
            delay,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "both",
          },
        ));
      });
    });

    if (currentImage) {
      animations.push(currentImage.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        outgoingTiming,
      ));
    }
    if (nextImage) {
      animations.push(nextImage.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        {
          duration: 360,
          delay: 80,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "both",
        },
      ));
    }

    const toolbarAnimation = animateToolbar(nextIndex, nextRole, direction);
    await Promise.all([
      toolbarAnimation,
      Promise.allSettled(animations.map(({ finished }) => finished)),
    ]);

    currentSlide.hidden = true;
    nextSlide.classList.remove("featured-projects__slide--entering");
    nextSlide.inert = false;
    animations.forEach((animation) => animation.cancel());
    activeIndex = nextIndex;
    announcer.textContent = `Project ${activeIndex + 1} of ${slides.length}: ${nextSlide.dataset.projectTitle ?? "Featured project"}`;
    isTransitioning = false;
    updateNavigation();
  };

  previousButton?.addEventListener("click", () => showProject(activeIndex - 1));
  nextButton?.addEventListener("click", () => showProject(activeIndex + 1));

  slider.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showProject(activeIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showProject(activeIndex + 1);
    }
  });

  viewport.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || (event.target as Element).closest("a, button")) return;
    pointerStart = { x: event.clientX, y: event.clientY };
  });
  viewport.addEventListener("pointerup", (event) => {
    if (!pointerStart || !event.isPrimary) return;

    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    pointerStart = undefined;

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    showProject(activeIndex + (deltaX < 0 ? 1 : -1));
  });
  viewport.addEventListener("pointercancel", () => {
    pointerStart = undefined;
  });

  updateNavigation();
});
