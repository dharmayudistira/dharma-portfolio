import { mountProfileSpider } from "../assets/profile-spider.figure";
import type { HairlineKernel, Point } from "../vendor/hairline/types";

declare const HL: HairlineKernel;
const wrapper = document.querySelector<HTMLElement>(".profile-spider");
const stage = wrapper?.querySelector<HTMLButtonElement>(".profile-spider__figure");
const svg = stage?.querySelector("svg");

if (wrapper && stage && svg) {
  const desktop = matchMedia("(min-width: 768px)");
  let figure: ReturnType<typeof mountProfileSpider> | undefined;
  const fallback = svg.innerHTML;
  const engine: HairlineKernel = {
    ...HL,
    register: (element, tick) => HL.register(element, (dt, now) => {
      // The profile follows the site's existing motion policy.
      HL.setReducedMotion(false);
      return tick(dt, now);
    }),
    pointer: (element, handlers) => {
      const point = ([x, y]: Point): Point => [80 + x * 220 / 400, y * 280 / 320];
      return HL.pointer(element, { move: p => handlers.move(point(p)), down: p => handlers.down?.(point(p)), leave: handlers.leave });
    },
  };
  const align = () => {
    if (!figure) return;
    const { width, height } = wrapper.getBoundingClientRect();
    figure.setAnchor(280 - height * 220 / width);
  };
  const resize = new ResizeObserver(align);
  const sync = () => {
    if (desktop.matches && !figure) {
      figure = mountProfileSpider({ stage, svg, read: { textContent: "rest" } }, 3.5, engine);
      align();
      stage.disabled = false;
      wrapper.dataset.ready = "true";
      resize.observe(wrapper);
    } else if (!desktop.matches && figure) {
      resize.disconnect();
      figure.destroy();
      figure = undefined;
      svg.innerHTML = fallback;
      stage.disabled = true;
      delete wrapper.dataset.ready;
    }
  };
  // Native button activation covers keyboard and assistive technology clicks.
  stage.addEventListener("click", event => { if (event.detail === 0) figure?.push(); });
  desktop.addEventListener("change", sync);
  sync();
}
