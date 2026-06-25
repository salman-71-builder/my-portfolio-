import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { C } from "../constants/colors";

interface StatCardProps {
  value: string;
  label: string;
  startFrame: number;
}

export const StatCard: React.FC<StatCardProps> = ({ value, label, startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sc = spring({ frame: frame - startFrame, fps, config: { damping: 9, stiffness: 200, mass: 0.8 }, durationInFrames: 22 });

  if (frame < startFrame) return null;

  return (
    <div style={{
      opacity: sc,
      transform: `scale(${0.5 + sc * 0.5})`,
      background: C.cardBg,
      border: `1.5px solid ${C.cardBorder}`,
      borderRadius: 20,
      padding: "28px 36px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 8,
      backdropFilter: "blur(10px)",
      boxShadow: `0 0 32px rgba(0,229,255,0.12)`,
      minWidth: 220,
    }}>
      <div style={{ color: C.cyan, fontSize: 48, fontWeight: 900, fontFamily: "'Hind Siliguri', sans-serif", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ color: C.muted, fontSize: 22, textAlign: "center", fontFamily: "'Hind Siliguri', sans-serif" }}>
        {label}
      </div>
    </div>
  );
};
