import type { DeviceStage, HairlineKernel, Point } from "../vendor/hairline/types";

declare const HL: HairlineKernel;

export function mountProjectDevices({ stage, svg, read }: DeviceStage, value: number, engine: HairlineKernel = HL) {
  const { Cam, fit, proj, rrect, hull, poly, open, seg, rad, tween, tset, tval, tdone, mk, register, pointer, disposer } = engine;
  const bag = disposer();
  const camera = Cam(45, 0.5, 1.8);
  fit(camera, [[-74, 42, 0], [78, -12, 0], [-70, -12, 120], [78, -12, 120]], 200, 166);
  const P = proj(camera);
  const group = mk("g", {}, svg);
  let reach = value;
  let active = -1;
  const specs = [
    { name: "desktop", x: 5, y: 0, z: 29, w: 146, h: 88, radius: 4, rest: -6 },
    { name: "phone", x: -48, y: 34, z: 2, w: 34, h: 66, radius: 5, rest: -9 },
  ];

  // The stand is behind the monitor and the phone; all surfaces remain opaque.
  const base = rrect(-23, -14, 33, 22, 5);
  mk("path", { class: "sil", d: poly(hull(base.flatMap((q) => [P(q.u, q.v, 0), P(q.u, q.v, 3)]))) }, group);
  mk("path", { class: "nf lo", d: poly(base.map((q) => P(q.u, q.v, 3))) }, group);
  const stem = rrect(-3, 3, 13, 40, 3);
  mk("path", { class: "sil", d: poly(stem.map((q) => P(q.u, -3, q.v))) }, group);

  const devices = specs.map((spec) => {
    const g = mk("g", {}, group);
    const body = mk("path", { class: "sil" }, g);
    const crease = mk("path", { class: "nf lo" }, g);
    const screen = mk("path", { class: "lo" }, g);
    const hardware = mk("path", { class: "nf" }, g);
    const layout = mk("path", { class: "nf" }, g);
    const copy = mk("path", { class: "nf lo" }, g);
    return { ...spec, body, crease, screen, hardware, layout, copy, angle: tween(spec.rest), drawn: NaN };
  });

  function project(device: typeof devices[number], angle: number, u: number, v: number, depth = 0): Point {
    const s = Math.sin(rad(angle)), c = Math.cos(rad(angle));
    return P(device.x + u, device.y + v * s + depth * c, device.z + v * c - depth * s);
  }

  function draw(device: typeof devices[number], angle: number) {
    if (angle === device.drawn) return;
    device.drawn = angle;
    const { w, h, radius } = device;
    const p = (u: number, v: number, depth = 2) => project(device, angle, u, v, depth);
    const outline = rrect(-w / 2, 0, w / 2, h, radius, 8);
    device.body.setAttribute("d", poly(hull(outline.flatMap((q) => [p(q.u, q.v, -2), p(q.u, q.v)]))));
    device.crease.setAttribute("d", open(outline.map((q) => p(q.u, q.v))));
    const rect = (x: number, y: number, width: number, height: number, r = 1.5) =>
      poly(rrect(x, y, x + width, y + height, r, 6).map((q) => p(q.u, q.v, 2.2)));
    const line = (x: number, y: number, length: number) => seg(p(x, y, 2.3), p(x + length, y, 2.3));
    const phone = device.name === "phone";
    device.screen.setAttribute("d", rect(-w / 2 + 3, phone ? 4 : 9, w - 6, h - (phone ? 8 : 13), phone ? 3 : 1.5));
    device.hardware.setAttribute("d", phone ? rect(-5, h - 7, 10, 1.4, 0.7) + line(-5, 2, 10) : rect(-1, h - 2.8, 2, 1.1, 0.5));
    if (phone) {
      device.layout.setAttribute("d", rect(-11, 42, 22, 11) + rect(-11, 8, 22, 13) + rect(-11, 25, 12, 3));
      device.copy.setAttribute("d", line(-11, 56, 8) + line(6, 56, 5) + line(-11, 37, 19) + line(-11, 33, 14) + line(-8, 17, 15) + line(-8, 13, 10));
    } else {
      device.layout.setAttribute("d", rect(8, 34, 52, 34) + rect(-60, 35, 24, 5) + [-60, -19, 22].map((x) => rect(x, 15, 38, 12)).join(""));
      device.copy.setAttribute("d", line(-60, 76, 15) + [20, 35, 50].map((x) => line(x, 76, 10)).join("") + line(-60, 62, 47) + line(-60, 55, 36) + line(-60, 46, 40) + line(16, 43, 36));
    }
  }

  // Inverse of each resting screen plane. Animated edges never affect picking.
  function hit(point: Point) {
    for (let i = devices.length - 1; i >= 0; i--) {
      const device = devices[i];
      const origin = project(device, device.rest, 0, 0);
      const u = project(device, device.rest, 1, 0), v = project(device, device.rest, 0, 1);
      const ux = u[0] - origin[0], uy = u[1] - origin[1], vx = v[0] - origin[0], vy = v[1] - origin[1];
      const dx = point[0] - origin[0], dy = point[1] - origin[1], determinant = ux * vy - uy * vx;
      const x = (dx * vy - dy * vx) / determinant, y = (ux * dy - uy * dx) / determinant;
      if (Math.abs(x) <= device.w / 2 + 5 && y >= -4 && y <= device.h + 4) return i;
    }
    return -1;
  }

  const loop = register(stage, (_dt, now) => {
    let moving = false;
    devices.forEach((device) => {
      draw(device, tval(device.angle, now));
      if (!tdone(device.angle, now)) moving = true;
    });
    return moving;
  });
  bag.add(loop.unregister);

  function focus(next: number, force = false) {
    if (next === active && !force) return;
    active = next;
    const now = performance.now();
    devices.forEach((device, i) => {
      tset(device.angle, device.rest + (i === active ? reach : 0), now, 0);
      device.body.classList.toggle("hi", i === (active < 0 ? 0 : active));
    });
    read.textContent = active < 0 ? "rest" : devices[active].name;
    loop.wake();
  }

  devices.forEach((device) => draw(device, device.rest));
  focus(-1, true);
  bag.add(pointer(stage, { move: (point) => focus(hit(point)), down: (point) => focus(hit(point)), leave: () => focus(-1) }));
  bag.add(() => svg.replaceChildren());
  return { set(next: number) { reach = next; focus(active, true); }, destroy: bag.dispose };
}
