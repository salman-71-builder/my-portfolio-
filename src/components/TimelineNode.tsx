import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C } from "../constants/colors";

interface TimelineNodeProps {
  icon: string;
  title: string;
  startFrame: number;
  isLast?: boolean;
}

export const TimelineNode: React.FC<TimelineNodeProps> = ({ icon, title, startFrame, isLast = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sc = spring({ frame: frame - startFrame, fps, config: { damping: 10, stiffness: 220, mass: 0.7 }, durationInFrames: 20 });
  const cardX = interpolate(sc, [0, 1], [60, 0]);

  // Line draws in after card
  const lineProgress = interpolate(frame, [startFrame + 20, startFrame + 55], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  if (frame < startFrame) return null;

  return (
    <div style={{ display: "flex", gap: 0, alignItems: "flex-start" }}>
      {/* Left axis: dot + line */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 48, flexShrink: 0 }}>
        <div style={{
          width: 24, height: 24, borderRadius: "50%",
          backgroundColor: C.cyan,
          boxShadow: `0 0 12px ${C.cyan}`,
          transform: `scale(${sc})`,
          flexShrink: 0,
          marginTop: 14,
        }} />
        {!isLast && (
          <div style={{
            width: 3, marginTop: 4,
            height: `${lineProgress * 64}px`,
            background: `linear-gradient(to bottom, ${C.cyan}, ${C.cyan}44)`,
            borderRadius: 2,
          }} />
        )}
      </div>
      {/* Card */}
      <div style={{
        opacity: sc,
        transform: `translateX(${cardX}px)`,
        marginLeft: 16,
        marginBottom: 8,
        background: C.cardBg,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 14,
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        backdropFilter: "blur(8px)",
        minWidth: 340,
      }}>
        <span style={{ fontSize: 32 }}>{icon}</span>
        <span style={{ color: C.white, fontSize: 24, fontWeight: 600, fontFamily: "'Hind Siliguri', sans-serif" }}>{title}</span>
      </div>
    </div>
  );
};
