import { useMemo } from "react";
import { useCurrentFrame, interpolate, AbsoluteFill } from "remotion";
import { easeOut, easeIn } from "../../utils/easing";

type Props = {
  text: string;
  width: number;
  height: number;
  startFrame: number;
  formDuration?: number; // frames for particles to fly into text
  holdDuration?: number; // frames text stays formed
  explodeDuration?: number; // frames to explode out
  fontSize?: number;
  colors?: string[];
  sampleGap?: number; // pixel sampling density (smaller = more particles)
};

const seeded = (i: number) => {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// AE Particular-style: particles fly in to spell text, hold, then explode out.
export const ParticleText: React.FC<Props> = ({
  text,
  width,
  height,
  startFrame,
  formDuration = 90,
  holdDuration = 60,
  explodeDuration = 60,
  fontSize = 160,
  colors = ["#00E5FF", "#FFD700", "#FFFFFF"],
  sampleGap = 9,
}) => {
  const frame = useCurrentFrame();

  // Sample text outline pixels via offscreen canvas (deterministic).
  const targets = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    try {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `900 ${fontSize}px "Hind Siliguri", Arial, sans-serif`;
        ctx.fillText(text, width / 2, height / 2);
        const data = ctx.getImageData(0, 0, width, height).data;
        for (let y = 0; y < height; y += sampleGap) {
          for (let x = 0; x < width; x += sampleGap) {
            const alpha = data[(y * width + x) * 4 + 3];
            if (alpha > 128) pts.push({ x, y });
          }
        }
      }
    } catch {
      // ignore — fallback below
    }
    if (pts.length === 0) {
      // Fallback grid if canvas unavailable.
      for (let i = 0; i < 200; i++) {
        pts.push({ x: width / 2 + (seeded(i) - 0.5) * fontSize * 4, y: height / 2 + (seeded(i + 99) - 0.5) * fontSize });
      }
    }
    return pts;
  }, [text, width, height, fontSize, sampleGap]);

  const particles = useMemo(
    () =>
      targets.map((t, i) => ({
        tx: t.x,
        ty: t.y,
        sx: seeded(i) * width,
        sy: seeded(i + 1000) * height,
        ex: t.x + (seeded(i + 2000) - 0.5) * width * 1.6,
        ey: t.y + (seeded(i + 3000) - 0.5) * height * 1.6,
        color: colors[i % colors.length],
        size: 2 + seeded(i + 4000) * 3,
        delay: seeded(i + 5000) * 24,
      })),
    [targets, width, height, colors],
  );

  const formEnd = startFrame + formDuration;
  const holdEnd = formEnd + holdDuration;
  const explodeEnd = holdEnd + explodeDuration;

  return (
    <AbsoluteFill>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {particles.map((p, i) => {
          let x: number;
          let y: number;
          let opacity = 1;
          if (frame < formEnd) {
            const fp = easeOut(
              interpolate(frame, [startFrame + p.delay, formEnd], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            );
            x = interpolate(fp, [0, 1], [p.sx, p.tx]);
            y = interpolate(fp, [0, 1], [p.sy, p.ty]);
            opacity = interpolate(fp, [0, 0.2], [0, 1], { extrapolateRight: "clamp" });
          } else if (frame < holdEnd) {
            x = p.tx;
            y = p.ty;
          } else {
            const ep = easeIn(
              interpolate(frame, [holdEnd, explodeEnd], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            );
            x = interpolate(ep, [0, 1], [p.tx, p.ex]);
            y = interpolate(ep, [0, 1], [p.ty, p.ey]);
            opacity = interpolate(ep, [0.4, 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          }
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={p.size}
              fill={p.color}
              opacity={opacity}
              style={{ filter: `drop-shadow(0 0 4px ${p.color})` }}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
