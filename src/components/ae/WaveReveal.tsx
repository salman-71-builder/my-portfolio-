import { useId } from "react";
import { useCurrentFrame, interpolate, AbsoluteFill } from "remotion";

type Props = {
  startFrame: number;
  durationInFrames?: number;
  width: number;
  height: number;
  direction?: "horizontal" | "vertical";
  children: React.ReactNode;
};

// AE mask reveal — content revealed behind a wavy advancing edge.
export const WaveReveal: React.FC<Props> = ({
  startFrame,
  durationInFrames = 50,
  width,
  height,
  direction = "horizontal",
  children,
}) => {
  const frame = useCurrentFrame();
  const rawId = useId().replace(/:/g, "");
  const clipId = `wave-${rawId}`;
  const progress = interpolate(frame, [startFrame, startFrame + durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const amp = 30 * (1 - progress);

  let pathD: string;
  if (direction === "horizontal") {
    const revealX = progress * (width + 60) - 30;
    const pts = Array.from({ length: 14 }, (_, i) => {
      const y = (i / 13) * height;
      const x = revealX + Math.sin(i * 1.2 + frame * 0.15) * amp;
      return `${x},${y}`;
    }).join(" L ");
    pathD = `M 0,0 L ${pts} L 0,${height} Z`;
  } else {
    const revealY = progress * (height + 60) - 30;
    const pts = Array.from({ length: 14 }, (_, i) => {
      const x = (i / 13) * width;
      const y = revealY + Math.sin(i * 1.2 + frame * 0.15) * amp;
      return `${x},${y}`;
    }).join(" L ");
    pathD = `M 0,0 L ${pts} L ${width},0 Z`;
  }

  return (
    <AbsoluteFill>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        <defs>
          <clipPath id={clipId}>
            <path d={pathD} />
          </clipPath>
        </defs>
      </svg>
      <div style={{ clipPath: `url(#${clipId})`, WebkitClipPath: `url(#${clipId})`, width, height }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};
