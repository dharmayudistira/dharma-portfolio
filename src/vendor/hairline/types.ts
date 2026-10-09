export type Point = [number, number];
export type WorldPoint = [number, number, number];
type Ring = { u: number; v: number; nu: number; nv: number }[];
type Camera = object;
type Tween = object;
type Spring = { x: number; t: number; v: number };
type Solid = { g: SVGGElement; sil: SVGPathElement; cr: SVGPathElement };

export interface HairlineKernel {
  facing(camera: Camera): (point: Ring[number]) => boolean;
  rings(x0: number, y0: number, x1: number, y1: number, radius: number, inset: number): [Ring, Ring];
  prism(project: (x: number, y: number, z: number) => Point, front: (point: Ring[number]) => boolean, ring: Ring, inner: Ring, z0: number, z1: number): { sil: string; crease: string };
  solid(parent: Element): Solid;
  put(solid: Solid, paths: { sil: string; crease: string }): void;
  Cam(angle: number, elevation: number, scale: number): Camera;
  fit(camera: Camera, points: WorldPoint[], x: number, y: number): void;
  proj(camera: Camera): (x: number, y: number, z: number) => Point;
  rrect(x0: number, y0: number, x1: number, y1: number, radius: number, steps?: number): Ring;
  circ(radius: number, steps?: number): Ring;
  fillet(points: Point[], radii: number[], steps?: number): Point[];
  run(ring: Ring, keep: (point: Ring[number]) => boolean): Ring;
  hull(points: Point[]): Point[];
  poly(points: Point[]): string;
  open(points: Point[]): string;
  seg(a: Point, b: Point): string;
  rad(degrees: number): number;
  clamp(value: number, minimum: number, maximum: number): number;
  spring(value: number, options?: { k?: number; c?: number; m?: number; eps?: number }): Spring;
  stepS(spring: Spring, dt: number): boolean;
  tween(value: number): Tween;
  tset(tween: Tween, target: number, now: number, delay: number): void;
  tval(tween: Tween, now: number): number;
  tdone(tween: Tween, now: number): boolean;
  mk<K extends keyof SVGElementTagNameMap>(tag: K, attributes: Record<string, string | number>, parent: Element): SVGElementTagNameMap[K];
  register(stage: HTMLElement, tick: (dt: number, now: number) => boolean): { wake(): void; unregister(): void };
  pointer(stage: HTMLElement, handlers: { move(point: Point): void; down?(point: Point): void; leave(): void }): () => void;
  disposer(): { add(dispose: () => void): void; dispose(): void };
  inject(root: Document): void;
  setReducedMotion(value: boolean): void;
}

export interface DeviceStage {
  stage: HTMLElement;
  svg: SVGSVGElement;
  read: { textContent: string | null };
}
