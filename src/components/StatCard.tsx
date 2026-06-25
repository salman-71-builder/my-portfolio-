import { useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../constants/colors";
import { punchSpring, overshootScale, driftY, textGlow } from "../utils/energy";

interface StatCardProps {
  value: string;
  label: string;
  startFrame: number;
}

export const StatCard: React.FC<StatCardProps> = ({ value, label, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sc = punchSpring(frame, fps, startFrame);
  const scale = overshootScale(sc);
  const tilt = Math.sin(frame * 0.06 + startFrame * 0.4) * 3;
  const drift = driftY(frame, startFrame * 0.4);

  if (frame < startFrame) return null;

  return (
    <div style={{
      opacity: sc,
      transform: `scale(${scale}) translateY(${drift}px) rotate(${tilt}deg)`,
      transformOrigin: "center",
      background: C.cardBg,
      border: `2px solid ${C.cardBorder}`,
      borderRadius: 22, padding: "26px 34px",
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: 8,
      backdropFilter: "blur(12px)",
      boxShadow: `0 0 36px rgba(0,229,255,0.15), inset 0 0 20px rgba(0,229,255,0.04)`,
      minWidth: 220,
    }}>
      <div style={{
        color: C.cyan, fontSize: 50, fontWeight: 900,
        fontFamily: "'Hind Siliguri', sans-serif", lineHeight: 1,
        textShadow: textGlow(frame, C.cyan, 16, 8),
        filter: `drop-shadow(0 0 18px ${C.cyan})`,
      }}>
        {value}
      </div>
      <div style={{ color: C.muted, fontSize: 21, textAlign: "center", fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
};
