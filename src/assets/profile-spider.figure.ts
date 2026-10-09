import type { DeviceStage, HairlineKernel, Point, WorldPoint } from "../vendor/hairline/types";

declare const HL: HairlineKernel;

export function mountProfileSpider({ stage, svg, read }: DeviceStage, value: number, engine: HairlineKernel = HL) {
  const { Cam, circ, clamp, fillet, fit, hull, mk, open, poly, proj, rad, rrect, run, solid, put, spring, stepS, pointer, register, disposer } = engine;
  const bag = disposer();
  svg.replaceChildren();
  const tether = mk("path", { class: "nf sil", "data-spider-rope": "" }, svg);
  const body = mk("g", { "data-spider-body": "" }, svg);
  type Project = (point: WorldPoint) => Point;
  const C = Cam(45, 0.5, 1.8), yaw = rad(-65), lean = rad(-10);
  const model = ([x, y, z]: WorldPoint): WorldPoint => [x * Math.cos(yaw) - y * Math.sin(yaw), x * Math.sin(yaw) + y * Math.cos(yaw), z];
  fit(C, [model([-55, -20, 0]), model([55, 50, 160])], 200, 166);
  const camera = proj(C);
  const screen = (p: WorldPoint): Point => { const [x, y] = camera(...model(p)); return [x * Math.cos(lean) - y * Math.sin(lean), x * Math.sin(lean) + y * Math.cos(lean)]; };
  const grip: WorldPoint = [-42, 3, 149], origin = screen(grip);
  const P: Project = (p) => { const q = screen(p); return [q[0] - origin[0] + 124, q[1] - origin[1] + 65]; };
  const path = (d: string, cls = "nf lo") => mk("path", { d, class: cls }, body);
  const front = (q: { nu: number; nv: number }) => q.nu * -0.34 + q.nv * 0.94 > 0;
  const cylinder = (radius: number, z0: number, z1: number, project: Project = P) => {
    const ring = (r: number, z: number) => circ(r, 56).map(q => project([q.u, q.v, z]));
    const shape = solid(body);
    put(shape, { sil: poly(hull([...ring(radius - 1, z0), ...ring(radius, z0 + 1), ...ring(radius, z1 - 1), ...ring(radius - 1, z1)])), crease: open(run(circ(radius - 0.8, 56), front).map(q => project([q.u, q.v, z1 - 0.7]))) });
    return shape;
  };
  const block = (x0: number, y0: number, x1: number, y1: number, z0: number, z1: number, inset = 0, project: Project = P) => {
    const bottom = rrect(x0, y0, x1, y1, 2, 8), top = rrect(x0 + inset, y0, x1 - inset, y1, 2, 8);
    put(solid(body), { sil: poly(hull([...bottom.map(q => project([q.u, q.v, z0])), ...top.map(q => project([q.u, q.v, z1]))])), crease: open(run(top, front).map(q => project([q.u, q.v, z1 - 0.8]))) });
  };
  // Extruded outlines preserve the elbow and toe recesses that a convex hull erases.
  const molded = (outline: Point[], depth: number, project: Project, radius = 2) => {
    const rounded = fillet(outline, outline.map(() => radius), 6);
    const back = rounded.map(([u, z]) => project([u, -depth, z])), face = rounded.map(([u, z]) => project([u, depth, z]));
    path(poly(back), "sil");
    path(rounded.map((_, i) => {
      const j = (i + 1) % rounded.length, wall = [back[i], back[j], face[j], face[i]];
      // Keep overlapping side faces opaque instead of cancelling their winding.
      const area = wall.reduce((sum, p, k) => { const q = wall[(k + 1) % 4]; return sum + p[0] * q[1] - q[0] * p[1]; }, 0);
      return poly(area < 0 ? wall.reverse() : wall);
    }).join(""), "fo");
    path(poly(face), "sil");
  };
  path("M123 61C123 107 145 125 135 166S112 238 153 251Q172 259 220 240", "nf sil");
  path("M126 61C126 107 148 125 138 167S117 235 155 248Q173 256 219 237", "nf sil");
  const hand = (center: WorldPoint, angle: number, tilt: number) => {
    const a = rad(angle), t = rad(tilt);
    const project: Project = ([u, v, z]) => {
      const x = u * Math.cos(a) - z * Math.sin(a), h = u * Math.sin(a) + z * Math.cos(a);
      return P([center[0] + x, center[1] + v * Math.cos(t) - h * Math.sin(t), center[2] + v * Math.sin(t) + h * Math.cos(t)]);
    };
    // A compact palm and thick fingers match the sleeve width, rather than a round ring.
    const outline: Point[] = [
      [4.4, 3.5], [2.4, 5.2], [-1, 5.6], [-4.6, 4.2], [-5.7, 1.5], [-5.7, -1.5],
      [-4.6, -4.2], [-1, -5.6], [2.4, -5.2], [4.4, -3.5], [2.2, -1.6],
      [0.5, -2.6], [-1.9, -2.2], [-2.8, 0], [-1.9, 2.2], [0.5, 2.6], [2.2, 1.6],
    ];
    molded(outline, 2.3, project, 0.8);
  };
  const leg = (x: number, angle: number) => {
    const a = rad(angle);
    const project: Project = ([u, v, z]) => P([x + u, v * Math.cos(a) - (z - 50) * Math.sin(a), 55 + v * Math.sin(a) + (z - 50) * Math.cos(a)]);
    block(-9.5, -9, 9.5, 9, 10, 49, 0, project);
    block(-9.5, -9, 9.5, 18, 0, 12.5, 0, project);
    // One dim molded seam describes the foot's upper ledge.
    path(open([project([-7.4, 10.2, 11.8]), project([7.4, 10.2, 11.8]), project([7.4, 15.4, 10.4])]));
    const sole = rrect(-6.3, -6, 6.3, 13, 1.3, 7), inner = rrect(-4.7, -4.4, 4.7, 11.4, 0.8, 7);
    if (angle > 30) {
      path(poly(sole.map(q => project([q.u, q.v, -0.1]))), "sil");
      path(open(inner.slice(0, 22).map(q => project([q.u, q.v, 1.5]))));
    }
  };
  leg(10.2, 45);
  leg(-10.2, 78);
  block(-21, -10, 21, 11, 55, 64);
  path(open([P([-19, 11.1, 58]), P([19, 11.1, 58])]));
  const freeArm: Point[] = [[18, 102], [42, 101], [45, 93], [20, 90]];
  molded(freeArm, 5.2, ([x, y, z]) => P([x, y + 1, z]), 1.2);
  // The wrist and palm continue along the straight forearm's axis.
  cylinder(2.2, 0, 5, ([u, v, z]) => P([42.5 + z, 2 + u, 97 + v]));
  hand([51.5, 2, 97], 5, 0);
  block(-23, -12, 23, 12, 64, 105, 6);
  const chest = (x: number, z: number): Point => P([x, 12.2, z]);
  const panel: Point[] = [[-20.5, 67], [20.5, 67], [15, 103], [-15, 103]];
  path(poly(fillet(panel, [1, 1, 2, 2], 5).map(([x, z]) => chest(x, z))));
  for (const side of [-1, 1]) {
    path(open([[side * 14.5, 102], [side * 12, 94], [side * 12.8, 83], [side * 19.8, 77]].map(([x, z]) => chest(x, z))), "nf sil");
    path(open([[side * 14, 99], [side * 9, 95], [side * 7, 90]].map(([x, z]) => chest(x, z))));
  }
  // Web print follows the chest and abdomen, leaving the suit's side panels clear.
  for (const z of [69, 74, 79, 84, 89, 94, 99]) {
    const w = z < 79 ? 19 : 11;
    path(open([chest(-w, z + 0.8), chest(-w / 2, z), chest(0, z + 0.6), chest(w / 2, z), chest(w, z + 0.8)]));
  }
  for (const x of [-16, -8, 0, 8, 16]) path(open([chest(x, 68), chest(x * 0.68, 82), chest(x * 0.65, 102)]));
  path(poly(circ(1.25, 20).map(q => chest(q.u, 94 + q.v))), "dot m");
  path(poly(circ(1.6, 20).map(q => chest(q.u, 90.5 + q.v * 1.8))), "dot m");
  for (const side of [-1, 1]) for (let i = 0; i < 4; i++) path(open([[side, 92], [side * (3.8 + i * 0.25), 97 - i * 3], [side * (4.6 + i * 0.3), 99 - i * 4.5]].map(([x, z]) => chest(x, z))), "nf sil");
  // The near shoulder sits on the torso's side and paints in front of that side panel.
  cylinder(6.2, 0, 7, ([u, v, z]) => P([-18 - z, u, 96 + v]));
  const raisedArm: Point[] = [[-28, 93], [-45, 138], [-36, 142], [-18, 99]];
  molded(raisedArm, 5, ([x, y, z]) => P([x, 2 + y, z]), 1.4);
  cylinder(2.4, 0, 5, ([x, y, z]) => P([-40.4 + x * 0.94 - z * 0.34, 3 + y, 140 + x * 0.34 + z * 0.94]));
  hand(grip, 5, 0);
  cylinder(6.5, 105, 111);
  const tilt = rad(-5), head: Project = ([x, y, z]) => P([x * Math.cos(tilt) - (z - 110) * Math.sin(tilt), y, 110 + x * Math.sin(tilt) + (z - 110) * Math.cos(tilt)]);
  const helmet = cylinder(18, 111, 139, head);
  helmet.sil.classList.add("hi");
  cylinder(7.8, 139, 145, head);
  const face = (x: number, z: number): Point => head([x, Math.sqrt(18 ** 2 - x ** 2) + 0.2, z]);
  const spokes: Point[] = [[0, 138], [10, 138], [16.5, 133], [16.5, 122], [9, 113], [0, 113], [-9, 113], [-16.5, 122], [-16.5, 133], [-10, 138]];
  for (const [x, z] of spokes) path(open([face(0, 128), face(x, z)]));
  for (const size of [0.43, 0.77]) {
    const web: Point[] = [];
    spokes.forEach(([x, z], i) => { const next = spokes[(i + 1) % spokes.length]; web.push(face(x * size, 128 + (z - 128) * size), face((x + next[0]) * size * 0.46, 128 + (z + next[1] - 256) * size * 0.46)); });
    path(poly(web));
  }
  const eye: Point[] = [[2.3, 128], [13.8, 135.5], [13, 124], [10, 120], [5, 120.5], [3, 123]];
  for (const side of [-1, 1]) path(poly(fillet(eye, [0.6, 0.6, 2, 2, 2, 1.5], 7).map(([x, z]) => face(x * side, z))), "hi");
  path("M124 51L124 66M126 51L126 65", "nf sil");
  const highlights = [...body.querySelectorAll(".hi")];
  // Lower damping lets the suspended weight pass its target before settling.
  const swing = spring(0, { k: 64, c: 8, m: 1, eps: 0.025 });
  const maximumAngle = 6;
  let reach = clamp(value, 0, 4), top = 0, drawn = Number.NaN, position: Point | null = null, pushed = false;
  const draw = () => {
    if (swing.x === drawn) return;
    drawn = swing.x;
    body.setAttribute("transform", `rotate(${swing.x} 124 ${top})`);
    const a = rad(swing.x), length = 65 - top, x = 124 - length * Math.sin(a), y = top + length * Math.cos(a);
    tether.setAttribute("d", `M124 ${top}Q${124 + (x - 124) * 0.45} ${(top + y) / 2} ${x} ${y}M126 ${top}Q${126 + (x - 124) * 0.45} ${(top + y) / 2} ${x + 2 * Math.cos(a)} ${y + 2 * Math.sin(a)}`);
  };
  const feedback = () => {
    const active = !!position || pushed;
    read.textContent = pushed ? "push" : position ? "swing" : "rest";
    highlights.forEach(el => el.classList.toggle("hi", !active));
    tether.classList.toggle("hi", active);
  };
  const loop = register(stage, (dt) => {
    const moving = stepS(swing, dt);
    if (Math.abs(swing.x) > maximumAngle) {
      swing.x = clamp(swing.x, -maximumAngle, maximumAngle);
      if (swing.x * swing.v > 0) swing.v = 0;
    }
    draw();
    if (!moving && pushed) { pushed = false; feedback(); }
    return moving;
  });
  const retarget = () => {
    swing.t = position ? -clamp((position[0] - 205) / 95, -1, 1) * reach : 0;
    feedback();
    loop.wake();
  };
  const push = () => {
    const direction = swing.t < 0 ? -1 : 1;
    // Cap velocity so repeated clicks cannot build an oversized swing.
    swing.v = clamp(swing.v + direction * 34, -34, 34);
    pushed = true;
    feedback();
    loop.wake();
  };
  bag.add(pointer(stage, { move: p => { position = p; retarget(); }, down: push, leave: () => { position = null; retarget(); } }));
  bag.add(loop.unregister);
  bag.add(() => svg.replaceChildren());
  read.textContent = "rest";
  draw();
  return { push, set: (v: number) => { reach = clamp(v, 0, 4); retarget(); }, setAnchor: (y: number) => { top = y; drawn = Number.NaN; draw(); }, destroy: bag.dispose };
}
