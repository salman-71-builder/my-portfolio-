declare module "flubber" {
  type Point = [number, number];
  interface Options {
    maxSegmentLength?: number;
    string?: boolean;
  }
  export function interpolate(
    fromShape: string | Point[],
    toShape: string | Point[],
    options?: Options,
  ): (t: number) => string;
  export function interpolateAll(
    fromShapes: (string | Point[])[],
    toShapes: (string | Point[])[],
    options?: Options,
  ): ((t: number) => string)[];
  export function separate(
    fromShape: string | Point[],
    toShapes: (string | Point[])[],
    options?: Options & { single?: boolean },
  ): (t: number) => string | string[];
  export function combine(
    fromShapes: (string | Point[])[],
    toShape: string | Point[],
    options?: Options & { single?: boolean },
  ): (t: number) => string | string[];
  export function toCircle(
    fromShape: string | Point[],
    cx: number,
    cy: number,
    r: number,
    options?: Options,
  ): (t: number) => string;
  export function fromCircle(
    cx: number,
    cy: number,
    r: number,
    toShape: string | Point[],
    options?: Options,
  ): (t: number) => string;
  export function splitPathString(pathString: string): string[];
  export function toPathString(ring: Point[]): string;
}
