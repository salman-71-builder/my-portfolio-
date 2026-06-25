// Pure-math cubic bezier path sampling — no DOM / getPointAtLength needed,
// so it renders deterministically headless. A path is a list of cubic
// segments; each segment is [P0, P1, P2, P3] control points.

export type Pt = { x: number; y: number };
export type CubicSeg = [Pt, Pt, Pt, Pt];

const cubicAt = (p0: number, p1: number, p2: number, p3: number, t: number): number => {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
};

const pointOnSeg = (seg: CubicSeg, t: number): Pt => ({
  x: cubicAt(seg[0].x, seg[1].x, seg[2].x, seg[3].x, t),
  y: cubicAt(seg[0].y, seg[1].y, seg[2].y, seg[3].y, t),
});

// Travel along a multi-segment path at global progress 0→1.
// Returns position and tangent angle (degrees) for rotation-follows-path.
export const travelPath = (
  segments: CubicSeg[],
  progress: number,
): { x: number; y: number; angle: number } => {
  const clamped = Math.max(0, Math.min(1, progress));
  const scaled = clamped * segments.length;
  const idx = Math.min(segments.length - 1, Math.floor(scaled));
  const localT = scaled - idx;
  const seg = segments[idx];
  const p = pointOnSeg(seg, localT);
  const p2 = pointOnSeg(seg, Math.min(1, localT + 0.01));
  const angle = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI;
  return { x: p.x, y: p.y, angle };
};

// Build an SVG path string ("M ... C ...") from cubic segments.
export const segmentsToPath = (segments: CubicSeg[]): string => {
  if (segments.length === 0) return "";
  const head = `M ${segments[0][0].x},${segments[0][0].y}`;
  const body = segments
    .map((s) => `C ${s[1].x},${s[1].y} ${s[2].x},${s[2].y} ${s[3].x},${s[3].y}`)
    .join(" ");
  return `${head} ${body}`;
};

// Approximate total length by sampling — for strokeDasharray draw-on.
export const approxLength = (segments: CubicSeg[], steps = 240): number => {
  let len = 0;
  let prev = travelPath(segments, 0);
  for (let i = 1; i <= steps; i++) {
    const cur = travelPath(segments, i / steps);
    len += Math.hypot(cur.x - prev.x, cur.y - prev.y);
    prev = cur;
  }
  return len;
};
