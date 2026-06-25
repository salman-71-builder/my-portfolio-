import { useId } from "react";
import { useCurrentFrame, interpolate, AbsoluteFill } from "remotion";

type Props = {
  startFrame: number;
  width?: number;
  height?: number;
  cx?: number;
  cy?: number;
  color?: string;
  durationInFrames?: number;
};

// AE ink/liquid wipe — a wobbling blob expands from a point to cover the
// screen, then contracts away, instead of a flat wipe.
export const LiquidTransition: React.FC<Props> = ({
  startFrame,
  width = 1920,
  height = 1080,
  cx = 960,
  cy = 540,
  color = "#00E5FF",
  durationInFrames = 60,
}) => {
  const frame = useCurrentFrame();
  const gradId = `liquidGrad-${useId().replace(/:/g, "")}`;
  const local = frame - startFrame;
  if (local < 0 || local > durationInFrames) return null;

  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationInFrames / 2, startFrame + durationInFrames],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const maxR = Math.hypot(width, height);
  const r = progress * maxR * 0.8;
  const wob = Math.sin(frame * 0.5) * 24 * progress;

  // 8-point irregular blob.
  const pts = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    const rr = r + Math.sin(frame * 0.4 + i * 1.3) * 30 * progress + wob;
    return { x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr };
  });
  const d =
    pts
      .map((p, i) => {
        const next = pts[(i + 1) % pts.length];
        const mx = (p.x + next.x) / 2;
        const my = (p.y + next.y) / 2;
        return i === 0 ? `M ${mx},${my}` : `Q ${p.x},${p.y} ${mx},${my}`;
      })
      .join(" ") +
    ` Q ${pts[0].x},${pts[0].y} ${(pts[0].x + pts[1].x) / 2},${(pts[0].y + pts[1].y) / 2} Z`;

  return (
    <AbsoluteFill>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity="0.85" />
          </radialGradient>
        </defs>
        <path d={d} fill={`url(#${gradId})`} style={{ filter: `drop-shadow(0 0 40px ${color})` }} />
      </svg>
    </AbsoluteFill>
  );
};
