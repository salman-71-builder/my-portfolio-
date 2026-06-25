import { useCurrentFrame } from "remotion";

type Props = {
  startFrame: number;
  children: React.ReactNode;
  intensity?: number;
};

// Deterministic pseudo-random so the glitch renders identically each pass.
const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// AE RGB-split glitch — channels offset/skew on specific frames during the cut.
export const GlitchMorph: React.FC<Props> = ({ startFrame, children, intensity = 12 }) => {
  const frame = useCurrentFrame();
  const local = frame - startFrame;
  const glitchFrames = [0, 2, 4, 6, 8, 10, 14, 18];
  const isGlitching = glitchFrames.indexOf(local) !== -1;

  const off = isGlitching ? (rand(local + 1) * 2 - 1) * intensity : 0;
  const skew = isGlitching ? (rand(local + 7) * 2 - 1) * 3 : 0;

  if (!isGlitching) {
    return <>{children}</>;
  }

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          mixBlendMode: "screen",
          opacity: 0.75,
          transform: `translateX(${off}px) skewX(${skew}deg)`,
          filter: "drop-shadow(0 0 0 #FF2D2D)",
        }}
      >
        <div style={{ filter: "sepia(1) saturate(8) hue-rotate(-50deg)" }}>{children}</div>
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          mixBlendMode: "screen",
          opacity: 0.75,
          transform: `translateX(${-off}px) skewX(${-skew}deg)`,
        }}
      >
        <div style={{ filter: "sepia(1) saturate(8) hue-rotate(150deg)" }}>{children}</div>
      </div>
      <div style={{ position: "relative", opacity: 0.9 }}>{children}</div>
    </div>
  );
};
