import type { DeviceStage, HairlineKernel, Point } from "../vendor/hairline/types";

declare const HL: HairlineKernel;

export function mountFooterLandscape({ stage, svg, read }: DeviceStage, value: number, engine: HairlineKernel = HL) {
  const { Cam, fit, proj, facing, rings, prism, solid, put, rrect, poly, seg, mk, tween, tset, tval, tdone, register, pointer, disposer } = engine;
  const bag = disposer(), camera = Cam(45, 0.5, 0.86);
  const diagonal = Math.SQRT1_2;
  fit(camera, [[-184, 120, 0], [120, -184, 0], [-120, 184, 0], [184, -120, 0], [138, -100, 148]], 200, 166);
  const P = proj(camera), front = facing(camera);
  type Project = typeof P;
  type Part = { group: SVGGElement; level: number; dx: number; dy: number };
  svg.replaceChildren();
  const root = mk("g", {}, svg);
  const path = (parent: Element, d: string, cls = "nf lo") => mk("path", { d, class: cls }, parent);
  const rect = (p: Project, x: number, y: number, w: number, h: number, z: number, radius = 1) =>
    poly(rrect(x, y, x + w, y + h, radius, 6).map((q) => p(q.u, q.v, z)));
  const plate = (parent: Element, p: Project, x: number, y: number, w: number, h: number, z: number, thickness: number, radius: number, face = front) => {
    const [ring, inner] = rings(x, y, x + w, y + h, radius, Math.min(0.65, radius * 0.4));
    const el = solid(parent);
    put(el, prism(p, face, ring, inner, z, z + thickness));
    return el;
  };
  const table: Project = (u, v, z) => P((u + v) * diagonal, (v - u) * diagonal, z);
  // All four legs are behind the opaque tabletop; its long axis faces the reader.
  for (const v of [-32, 32]) for (const u of [-195, 195]) plate(root, table, u - 3, v - 3, 6, 6, 0, 43, 1.5, (q) => q.nv > 0);
  plate(root, table, -212, -45, 424, 90, 40, 4, 5, (q) => q.nv > 0);

  const specs = [
    { name: "watch", u: -169, w: 20, h: 24 },
    { name: "phone", u: -111, w: 25, h: 47 },
    { name: "tablet", u: -37, w: 39, h: 56 },
    { name: "laptop", u: 56, w: 61, h: 41 },
    { name: "desktop", u: 160, w: 72, h: 45 },
  ];
  const devices = specs.map((spec, index) => {
    const group = mk("g", {}, root), guides = path(group, "", "nf lo dash"), parts: Part[] = [];
    const p: Project = (x, y, z) => P(spec.u * diagonal + x, -spec.u * diagonal + y, 44 + z);
    const part = (project: Project, level: number) => {
      const node = mk("g", {}, group), a = project(0, 0, 0), b = project(0, 0, 1);
      parts.push({ group: node, level, dx: b[0] - a[0], dy: b[1] - a[1] });
      return node;
    };
    const { w, h } = spec;
    let accent: SVGPathElement;
    let screen: Project | undefined;
    if (index < 3) {
      if (index === 0) {
        for (const y of [-30, 11]) plate(group, p, -6, y, 12, 19, 0.2, 1.5, 2.5);
        path(group, [-24, -20, -16, 18, 22, 26].map((y) => rect(p, -1, y, 2, 1.6, 1.8, 0.7)).join(""));
        plate(group, p, 10, -2, 3, 4, 3, 2, 1.5);
      }
      const bottom = part(p, 0);
      plate(bottom, p, -w / 2, -h / 2, w, h, 1.7, index === 0 ? 3.2 : 1.6, index === 0 ? 6 : 3.5);
      path(bottom, rect(p, -w * 0.3, -h * 0.3, w * 0.42, h * 0.46, 5, 1.3), "lo");
      for (let i = 0; i < 3; i++) path(bottom, rect(p, w * 0.18, -h * 0.25 + i * 4, w * 0.19, 2.7, 4, 0.6), "lo");
      const middle = part(p, 0.5);
      plate(middle, p, -w * 0.4, -h * 0.39, w * 0.8, h * 0.78, 8, 1.1, index === 0 ? 4 : 2);
      const top = part(p, 1);
      accent = plate(top, p, -w / 2, -h / 2, w, h, 14, 1.4, index === 0 ? 6 : 3.5).sil;
      if (index === 1) {
        plate(top, p, -w / 2 + 2, -h / 2 + 2, 8, 13, 15.4, 0.9, 2);
        for (const y of [-h / 2 + 5.5, -h / 2 + 11]) {
          path(top, rect(p, -w / 2 + 3.4, y - 2, 4.5, 4.5, 16.4, 2.25), "sil");
          path(top, rect(p, -w / 2 + 4.5, y - 0.9, 2.3, 2.3, 16.5, 1.15));
        }
        path(top, seg(p(w / 2, -9, 15), p(w / 2, -2, 15)) + seg(p(-w / 2, -5, 15), p(-w / 2, 1, 15)));
      } else {
        path(top, rect(p, -w / 2 + 2.4, -h / 2 + 2.4, w - 4.8, h - 4.8, 15.5, index === 0 ? 4 : 2), "lo");
        if (index === 0) {
          path(top, rect(p, -5, -5, 10, 10, 15.6, 5));
          path(top, seg(p(0, -3, 15.7), p(0, 0, 15.7)) + seg(p(0, 0, 15.7), p(3, 1.5, 15.7)), "nf sil");
        } else {
          path(top, rect(p, -w / 2 + 6, -h / 2 + 9, w - 12, 16, 15.6, 1.3));
          path(top, [0, 1, 2].map((i) => rect(p, -w / 2 + 6 + i * 9, 5, 7, 10, 15.6)).join(""));
          path(top, seg(p(-w / 2 + 6, -h / 2 + 6, 15.6), p(-w / 2 + 17, -h / 2 + 6, 15.6)));
        }
      }
    } else {
      const laptop = index === 3;
      // Upright displays share the same camera as the flat devices on the desk.
      const display: Project = laptop ? (x, y, z) => p(x, -21 - y * 0.22 + z * 0.98, 6 + y * 0.98 + z * 0.22) : (x, y, z) => p(x, -19 + z, 22 + y);
      screen = display;
      const shell = part(display, 0);
      if (!laptop) {
        plate(group, p, -14, -26, 28, 23, 0.5, 1.7, 3);
        plate(group, display, -4, -21, 8, 25, -4, 3, 1.5);
      }
      plate(shell, display, -w / 2, 0, w, h, -2, 2, 2.5);
      const panel = part(display, 0.5);
      plate(panel, display, -w / 2 + 2, 2, w - 4, h - 4, 8, 1.1, 2);
      const glass = part(display, 1);
      accent = plate(glass, display, -w / 2 + 1, 1, w - 2, h - 2, 14, 0.65, 2).sil;
      path(glass, rect(display, -w / 2 + 3.5, 5, w - 7, h - 9, 14.7, 1), "lo");
      path(glass, rect(display, -w / 2 + 7, 9, w * 0.38, h - 18, 14.8) + rect(display, 0, 18, w * 0.36, h - 27, 14.8));
      path(glass, [9, 13].map((y) => seg(display(0, y, 14.8), display(w * 0.29, y, 14.8))).join(""));
      const keyboard = mk("g", {}, group);
      const ky = laptop ? -h / 2 : 10, kw = laptop ? w : 44, kh = laptop ? h : 17;
      plate(keyboard, p, -kw / 2, ky, kw, kh, 1, 2, 2.5);
      const keys = [];
      for (let row = 0; row < 4; row++) for (let col = 0; col < 10; col++) keys.push(rect(p, -kw / 2 + 4 + col * (kw - 8) / 10, ky + 3 + row * (laptop ? 4 : 2.7), (kw - 12) / 10, laptop ? 2.8 : 1.8, 3.1, 0.45));
      path(keyboard, keys.join(""));
      if (laptop) path(keyboard, rect(p, -10, 3, 20, 12, 3.1, 1.4));
      else {
        plate(keyboard, p, 28, 13, 9, 15, 1, 3, 4.5);
        path(keyboard, seg(p(32.5, 14, 4.1), p(32.5, 18, 4.1)));
      }
      // Elevated screen layers occlude the keyboard and stand underneath them.
      group.append(shell, panel, glass);
    }
    const center = p(0, 0, index < 3 ? 10 : 28);
    return { ...spec, group, guides, parts, accent, p, screen, center, gap: tween(0), drawn: NaN };
  });

  let active = -1, reach = value;
  function draw(device: typeof devices[number], gap: number) {
    if (device.drawn === gap) return;
    device.drawn = gap;
    device.parts.forEach(({ group, level, dx, dy }) => group.setAttribute("transform", `translate(${dx * gap * level} ${dy * gap * level})`));
    const project = device.screen ?? device.p;
    device.guides.setAttribute("d", [-1, 1].flatMap((x) => [-1, 1].map((y) => {
      const u = x * (device.w / 2 - 3), v = y * (device.h / 2 - 3) + (device.screen ? device.h / 2 : 0);
      return seg(project(u, v, device.screen ? 0 : 3), project(u, v, 14 + gap));
    })).join(""));
  }
  const loop = register(stage, (_dt, now) => {
    let moving = false;
    devices.forEach((device) => { draw(device, tval(device.gap, now)); if (!tdone(device.gap, now)) moving = true; });
    return moving;
  });
  bag.add(loop.unregister);
  function focus(next: number, force = false) {
    if (next === active && !force) return;
    const from = next < 0 ? active : next;
    active = next;
    devices.forEach((device, i) => {
      const distance = Math.abs(i - active), target = active < 0 ? 0 : distance === 0 ? reach : distance === 1 ? reach * 0.16 : 0;
      tset(device.gap, target, performance.now(), Math.abs(i - from) * 40);
      device.accent.classList.toggle("hi", i === (active < 0 ? 1 : active));
    });
    read.textContent = active < 0 ? "rest" : devices[active].name;
    loop.wake();
  }
  function hit([x, y]: Point) {
    const nearest = devices.reduce((a, b) => Math.abs(b.center[0] - x) < Math.abs(a.center[0] - x) ? b : a);
    return Math.abs(nearest.center[0] - x) < 40 && Math.abs(nearest.center[1] - y) < 50 ? devices.indexOf(nearest) : -1;
  }
  devices.forEach((device) => draw(device, 0));
  focus(-1, true);
  bag.add(pointer(stage, { move: (point) => focus(hit(point)), down: (point) => focus(hit(point)), leave: () => focus(-1) }));
  bag.add(() => svg.replaceChildren());
  return { set(next: number) { reach = next; focus(active, true); }, destroy: bag.dispose };
}
