const viewport = document.querySelector<HTMLElement>("[data-community-activity-viewport]");
const controls = document.querySelector<HTMLElement>("[data-community-activity-controls]");
const previous = document.querySelector<HTMLButtonElement>("[data-community-activity-previous]");
const next = document.querySelector<HTMLButtonElement>("[data-community-activity-next]");

if (viewport && controls && previous && next) {
  const desktop = matchMedia("(min-width: 768px)");
  const entries = [...viewport.querySelectorAll<HTMLElement>(".community-activity__year--milestone")];
  const maxScroll = () => Math.max(0, desktop.matches
    ? viewport.scrollWidth - viewport.clientWidth
    : viewport.scrollHeight - viewport.clientHeight);
  const scrollPosition = () => desktop.matches ? viewport.scrollLeft : viewport.scrollTop;
  let interacted = false;
  // Keep rapid button presses relative to the destination while scrolling.
  let destination: number | null = null;

  const syncViewport = () => {
    const end = maxScroll();
    if (destination !== null && Math.abs(scrollPosition() - destination) <= 1) {
      destination = null;
    }
    const position = destination ?? scrollPosition();
    viewport.tabIndex = end > 1 ? 0 : -1;
    viewport.toggleAttribute("data-scroll-start", scrollPosition() > 1);
    viewport.toggleAttribute("data-scroll-end", scrollPosition() < end - 1);
    controls.hidden = end <= 1;
    previous.disabled = position <= 1;
    next.disabled = position >= end - 1;
  };

  const scrollTo = (position: number) => {
    destination = Math.max(0, Math.min(position, maxScroll()));
    viewport.scrollTo(desktop.matches
      ? { left: destination, behavior: "smooth" }
      : { top: destination, behavior: "smooth" });
    syncViewport();
  };

  const step = (direction: -1 | 1) => {
    interacted = true;
    const end = maxScroll();
    const stops = [...new Set([0, ...entries.map((entry) => Math.min(desktop.matches ? entry.offsetLeft : entry.offsetTop, end)), end])];
    const position = destination ?? scrollPosition();
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
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const previousKey = desktop.matches ? "ArrowLeft" : "ArrowUp";
    const nextKey = desktop.matches ? "ArrowRight" : "ArrowDown";
    if (event.key === previousKey || event.key === nextKey) {
      event.preventDefault();
      step(event.key === previousKey ? -1 : 1);
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
