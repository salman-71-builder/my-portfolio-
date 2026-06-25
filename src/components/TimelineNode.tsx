import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C } from "../constants/colors";
import { punchSpring, overshootScale, letterSpacingSnap, driftY, textGlow } from "../utils/energy";

interface TimelineNodeProps {
  icon: string;
  title: string;
  startFrame: number;
  isLast?: boolean;
}

export const TimelineNode: React.FC<TimelineNodeProps> = ({ icon, title, startFrame, isLast = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sc = punchSpring(frame, fps, startFrame);
  const scale = overshootScale(sc);
  const cardX = interpolate(sc, [0, 1], [80, 0]);

  const lineProgress = interpolate(frame, [startFrame + 16, startFrame + 48], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const dotGlow = 12 + Math.sin(frame * 0.12 + startFrame * 0.2) * 5;

  if (frame < startFrame) return null;

  return (
    <div style={{ display: "flex", gap: 0, alignItems: "flex-start" }}>
      {/* Axis */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 48, flexShrink: 0 }}>
        <div style={{
          width: 26, height: 26, borderRadius: "50%",
          background: `radial-gradient(circle, #FFFFFF, ${C.cyan})`,
          boxShadow: `0 0 ${dotGlow}px ${C.cyan}, 0 0 ${dotGlow * 2}px rgba(0,229,255,0.4)`,
          transform: `scale(${scale})`,
          marginTop: 12, flexShrink: 0,
        }} />
        {!isLast && (
          <div style={{
            width: 3, marginTop: 4,
            height: `${lineProgress * 62}px`,
            background: `linear-gradient(to bottom, ${C.cyan}, ${C.cyan}33)`,
            borderRadius: 2,
            boxShadow: `0 0 6px ${C.cyan}`,
          }} />
        )}
      </div>

      {/* Card */}
      <div style={{
        opacity: sc,
        transform: `translateX(${cardX}px) scale(${0.9 + sc * 0.1}) translateY(${driftY(frame, startFrame * 0.3)}px)`,
        marginLeft: 16, marginBottom: 6,
        background: C.cardBg,
        border: `1.5px solid ${C.cardBorder}`,
        borderRadius: 14, padding: "12px 22px",
        display: "flex", alignItems: "center", gap: 14,
        backdropFilter: "blur(10px)",
        minWidth: 340,
        boxShadow: `0 0 20px rgba(0,229,255,0.1)`,
      }}>
        <span style={{ fontSize: 30, filter: `drop-shadow(0 0 8px ${C.cyan})` }}>{icon}</span>
        <span style={{
          color: C.white, fontSize: 24, fontWeight: 900,
          fontFamily: "'Hind Siliguri', sans-serif",
          letterSpacing: letterSpacingSnap(sc),
          textShadow: textGlow(frame, C.cyan, 6, 2),
        }}>
          {title}
        </span>
      </div>
    </div>
  );
};
