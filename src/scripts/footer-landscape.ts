type LandscapeObject = {
  element: SVGGElement;
  response: SVGGElement;
  kind: "cloud" | "tree" | "boat";
  value: number;
  target: number;
  direction: number;
};

for (const landscape of document.querySelectorAll<HTMLElement>("[data-footer-landscape]")) {
  const layers = Array.from(landscape.querySelectorAll<SVGGElement>("[data-landscape-depth]"))
    .map((element) => ({ element, depth: Number(element.dataset.landscapeDepth) }));
  const objects: LandscapeObject[] = [];
  const motion = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
  let visible = false;
  let frame = 0;
  let lastTime = 0;
  let x = 0;
  let y = 0;
  let targetX = 0;
  let targetY = 0;

  const active = () => visible && motion.matches && !document.hidden;
  const reset = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    x = y = targetX = targetY = 0;
    for (const { element } of layers) {
      element.style.removeProperty("transform");
    }
    for (const object of objects) {
      object.value = object.target = 0;
      object.response.style.removeProperty("transform");
      object.element.style.removeProperty("--landscape-response");
    }
  };
  const tick = (time: number) => {
    const blend = 1 - Math.exp(-Math.min(time - lastTime, 50) / 130);
    lastTime = time;
    x += (targetX - x) * blend;
    y += (targetY - y) * blend;
    let settled = Math.abs(targetX - x) + Math.abs(targetY - y) < 0.02;
    if (settled) {
      x = targetX;
      y = targetY;
    }
    for (const { element, depth } of layers) {
      element.style.transform = `translate3d(${(x * depth).toFixed(3)}px, ${(y * depth).toFixed(3)}px, 0)`;
    }
    for (const object of objects) {
      if (object.value === object.target) {
        continue;
      }
      object.value += (object.target - object.value) * blend;
      if (Math.abs(object.target - object.value) < 0.002) {
        object.value = object.target;
      } else {
        settled = false;
      }
      const amount = object.value * object.direction;
      const sway = Math.sin(object.value * Math.PI * 2) * 0.8;
      const rotation = object.kind === "tree" ? amount * 3 + sway : object.kind === "boat" ? amount * -3 : 0;
      const dx = object.kind === "cloud" ? amount * 12 : object.kind === "boat" ? amount * 4 : 0;
      const dy = object.kind === "cloud" ? -object.value * 2 : object.kind === "boat" ? -object.value : 0;
      object.response.style.transform = `translate(${dx.toFixed(3)}px, ${dy.toFixed(3)}px) rotate(${rotation.toFixed(3)}deg)`;
      object.element.style.setProperty("--landscape-response", object.value.toFixed(3));
      if (object.value === 0) {
        object.response.style.removeProperty("transform");
        object.element.style.removeProperty("--landscape-response");
      }
    }
    frame = settled ? 0 : requestAnimationFrame(tick);
  };
  const wake = () => {
    if (active() && !frame) {
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
  };
  const sync = () => {
    if (!active()) {
      reset();
    }
  };
  for (const element of landscape.querySelectorAll<SVGGElement>("[data-landscape-object]")) {
    const response = element.querySelector<SVGGElement>("[data-landscape-response]");
    const kind = element.dataset.landscapeObject;
    if (!response || (kind !== "cloud" && kind !== "tree" && kind !== "boat")) {
      continue;
    }
    const object: LandscapeObject = { element, response, kind, value: 0, target: 0, direction: 1 };
    objects.push(object);
    element.addEventListener("pointerenter", (event) => {
      if (!active()) {
        return;
      }
      const bounds = element.getBoundingClientRect();
      object.direction = event.clientX < bounds.left + bounds.width / 2 ? 1 : -1;
      object.target = 1;
      wake();
    });
    element.addEventListener("pointerleave", () => {
      object.target = 0;
      wake();
    });
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  });
  observer.observe(landscape);

  landscape.addEventListener("pointermove", (event) => {
    if (!active()) {
      return;
    }
    const bounds = landscape.getBoundingClientRect();
    targetX = (0.5 - (event.clientX - bounds.left) / bounds.width) * 24;
    targetY = (0.5 - (event.clientY - bounds.top) / bounds.height) * 10;
    wake();
  }, { passive: true });
  landscape.addEventListener("pointerleave", () => {
    targetX = targetY = 0;
    for (const object of objects) {
      object.target = 0;
    }
    wake();
  });
  motion.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
  window.addEventListener("resize", reset, { passive: true });
  window.addEventListener("pagehide", reset);
}
