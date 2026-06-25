import { useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../constants/colors";
import {
  punchSpring, overshootScale, letterSpacingSnap, driftY, textGlow,
} from "../utils/energy";

interface ProcessCardProps {
  icon: string;
  title: string;
  subtitle?: string;
  startFrame: number;
  showArrow?: boolean;
  accentColor?: string;
}

export const ProcessCard: React.FC<ProcessCardProps> = ({
  icon, title, subtitle, startFrame, showArrow = false, accentColor = C.cyan,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sc = punchSpring(frame, fps, startFrame);
  const scale = overshootScale(sc);
  const drift = driftY(frame, startFrame);
  const tilt = Math.sin(frame * 0.05 + startFrame * 0.3) * 2.5;

  if (frame < startFrame) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        opacity: sc,
        transform: `scale(${scale}) translateY(${drift}px) rotate(${tilt}deg)`,
        transformOrigin: "center",
        background: C.cardBg,
        border: `1.5px solid ${accentColor}55`,
        borderRadius: 18, padding: "18px 24px",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 10,
        minWidth: 180,
        backdropFilter: "blur(10px)",
        boxShadow: `0 0 28px ${accentColor}28, inset 0 0 20px ${accentColor}08`,
      }}>
        <div style={{ fontSize: 44, filter: `drop-shadow(0 0 10px ${accentColor})` }}>{icon}</div>
        <div style={{
          color: C.white, fontSize: 22, fontWeight: 900, textAlign: "center",
          fontFamily: "'Hind Siliguri', sans-serif",
          letterSpacing: letterSpacingSnap(sc),
          textShadow: textGlow(frame, accentColor, 8, 3),
        }}>
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
          color: accentColor, fontSize: 32, fontWeight: 900,
          opacity: sc, filter: `drop-shadow(0 0 10px ${accentColor})`,
          transform: `scale(${1 + Math.sin(frame * 0.15) * 0.06})`,
        }}>
          →
        </div>
      )}
    </div>
  );
};
