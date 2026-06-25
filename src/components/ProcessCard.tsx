import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C } from "../constants/colors";

interface ProcessCardProps {
  icon: string;
  title: string;
  subtitle?: string;
  startFrame: number;
  showArrow?: boolean;
  accentColor?: string;
}

export const ProcessCard: React.FC<ProcessCardProps> = ({
  icon,
  title,
  subtitle,
  startFrame,
  showArrow = false,
  accentColor = C.cyan,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sc = spring({ frame: frame - startFrame, fps, config: { damping: 10, stiffness: 200, mass: 0.8 }, durationInFrames: 25 });
  const yOff = interpolate(sc, [0, 1], [40, 0]);

  if (frame < startFrame) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          opacity: sc,
          transform: `translateY(${yOff}px) scale(${0.6 + sc * 0.4})`,
          background: C.cardBg,
          border: `1.5px solid ${accentColor}44`,
          borderRadius: 16,
          padding: "20px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          minWidth: 180,
          backdropFilter: "blur(8px)",
          boxShadow: `0 0 24px ${accentColor}22`,
        }}
      >
        <div style={{ fontSize: 44 }}>{icon}</div>
        <div style={{ color: C.white, fontSize: 22, fontWeight: 700, textAlign: "center", fontFamily: "'Hind Siliguri', sans-serif" }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ color: C.muted, fontSize: 17, textAlign: "center", fontFamily: "'Hind Siliguri', sans-serif" }}>
            {subtitle}
          </div>
        )}
      </div>
      {showArrow && (
        <div style={{
          opacity: interpolate(frame, [startFrame + 15, startFrame + 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          color: accentColor,
          fontSize: 32,
          fontWeight: 900,
        }}>→</div>
      )}
    </div>
  );
};
