import { useCurrentFrame, interpolate } from "remotion";
import { C } from "../constants/colors";

interface ParticleBurstProps {
  startFrame: number;
  x: number;
  y: number;
  count?: number;
  colors?: string[];
  radius?: number;
}

export const ParticleBurst: React.FC<ParticleBurstProps> = ({
  startFrame,
  x,
  y,
  count = 18,
  colors = [C.cyan, C.gold, "#FFFFFF", C.green],
  radius = 200,
}) => {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;
  if (elapsed < 0 || elapsed > 35) return null;

  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const speed = 0.7 + (i % 3) * 0.4;
        const r = interpolate(elapsed, [0, 28], [0, radius * speed], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });
        const opacity = interpolate(elapsed, [0, 8, 28], [0, 1, 0], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });
        const size = 4 + (i % 4) * 2;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;
        const color = colors[i % colors.length];

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px - size / 2,
              top: py - size / 2,
              width: size,
              height: size,
              borderRadius: i % 2 === 0 ? "50%" : 2,
              backgroundColor: color,
              opacity,
              boxShadow: `0 0 ${size * 2}px ${color}`,
              zIndex: 100,
            }}
          />
        );
      })}
    </>
  );
};
