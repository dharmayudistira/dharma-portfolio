const viewport = document.querySelector<HTMLElement>("[data-work-history-viewport]");
const controls = document.querySelector<HTMLElement>("[data-work-history-controls]");
const previous = document.querySelector<HTMLButtonElement>("[data-work-history-previous]");
const next = document.querySelector<HTMLButtonElement>("[data-work-history-next]");

if (viewport && controls && previous && next) {
  const desktop = matchMedia("(min-width: 768px)");
  const entries = [...viewport.querySelectorAll<HTMLElement>(".work-history__year--milestone")];
  const maxScroll = () => Math.max(0, viewport.scrollWidth - viewport.clientWidth);
  let interacted = false;
  // Keep rapid button presses relative to the destination while scrolling.
  let destination: number | null = null;

  const syncViewport = () => {
    const end = maxScroll();
    if (destination !== null && Math.abs(viewport.scrollLeft - destination) <= 1) {
      destination = null;
    }
    const position = destination ?? viewport.scrollLeft;
    viewport.tabIndex = desktop.matches ? 0 : -1;
    viewport.toggleAttribute("data-scroll-start", viewport.scrollLeft > 1);
    viewport.toggleAttribute("data-scroll-end", viewport.scrollLeft < end - 1);
    controls.hidden = !desktop.matches || end <= 1;
    previous.disabled = position <= 1;
    next.disabled = position >= end - 1;
  };

  const scrollTo = (position: number) => {
    destination = Math.max(0, Math.min(position, maxScroll()));
    viewport.scrollTo({ left: destination, behavior: "smooth" });
    syncViewport();
  };

  const step = (direction: -1 | 1) => {
    interacted = true;
    const end = maxScroll();
    const stops = [...new Set([0, ...entries.map((entry) => Math.min(entry.offsetLeft, end)), end])];
    const position = destination ?? viewport.scrollLeft;
    const target = direction === 1
      ? stops.find((stop) => stop > position + 1)
      : stops.filter((stop) => stop < position - 1).at(-1);
    if (target !== undefined) scrollTo(target);
  };

  const takeControl = () => {
    interacted = true;
    destination = null;
    syncViewport();
  };

  previous.addEventListener("click", () => step(-1));
  next.addEventListener("click", () => step(1));
  controls.addEventListener("pointerdown", () => { interacted = true; }, { passive: true });
  controls.addEventListener("focusin", () => { interacted = true; });
  viewport.addEventListener("pointerdown", takeControl, { passive: true });
  viewport.addEventListener("wheel", takeControl, { passive: true });
  viewport.addEventListener("focusin", takeControl);
  viewport.addEventListener("keydown", (event) => {
    interacted = true;
    if (!desktop.matches || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      step(event.key === "ArrowLeft" ? -1 : 1);
    }
  });
  viewport.addEventListener("scroll", syncViewport, { passive: true });
  const resize = () => {
    destination = null;
    syncViewport();
  };
  desktop.addEventListener("change", resize);
  new ResizeObserver(resize).observe(viewport);
  syncViewport();

  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    observer.disconnect();
    window.setTimeout(() => {
      const latestEntry = entries.at(-1);
      if (desktop.matches && !interacted && latestEntry
        && latestEntry.offsetLeft + latestEntry.offsetWidth > viewport.scrollLeft + viewport.clientWidth) {
        scrollTo(latestEntry.offsetLeft);
      }
    }, 200);
  }, { threshold: 0.25 });
  observer.observe(viewport);
}
