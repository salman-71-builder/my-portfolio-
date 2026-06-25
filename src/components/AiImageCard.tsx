import { useCurrentFrame } from "remotion";
import { C } from "../constants/colors";
import { punchSpring, overshootScale, slamX, slamY, driftY } from "../utils/energy";

interface AiImageCardProps {
  label: string;
  startFrame: number;
  width?: number | string;
  height?: number | string;
  slideFrom?: "right" | "left" | "bottom";
  kenBurnsScale?: number;
  tint?: string;
}

export const AiImageCard: React.FC<AiImageCardProps> = ({
  label, startFrame, width = 520, height = 340,
  slideFrom = "right", kenBurnsScale = 1.07, tint,
}) => {
  const frame = useCurrentFrame();
  const { fps } = { fps: 30 };

  const sc = punchSpring(frame, fps, startFrame);
  const scale = overshootScale(sc);

  const xOffset = slideFrom === "right" ? slamX(sc, true)
    : slideFrom === "left"  ? slamX(sc, false)
    : 0;
  const yOffset = slideFrom === "bottom" ? slamY(sc, true) : 0;

  const elapsed = Math.max(0, frame - startFrame);
  const kbZoom = 1 + (kenBurnsScale - 1) * Math.min(elapsed / 280, 1);
  const drift = driftY(frame, startFrame * 0.2) * 0.5;

  const borderGlow = 12 + Math.sin(frame * 0.1 + startFrame * 0.3) * 5;

  return (
    <div style={{
      width, height,
      borderRadius: 18,
      border: `2px solid ${C.cardBorder}`,
      overflow: "hidden",
      opacity: sc,
      transform: `translateX(${xOffset}px) translateY(${yOffset + drift}px) scale(${scale})`,
      position: "relative", flexShrink: 0,
      boxShadow: `0 0 ${borderGlow}px rgba(0,229,255,0.25)`,
    }}>
      <div style={{
        width: "100%", height: "100%",
        background: "linear-gradient(135deg, #0a1520 0%, #1a2e4a 50%, #0a1520 100%)",
        transform: `scale(${kbZoom})`, transformOrigin: "center",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}>
        <div style={{
          border: `1.5px dashed ${C.cardBorder}`,
          borderRadius: 12, width: "90%", height: "80%",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 12, padding: 16,
        }}>
          <div style={{ fontSize: 38, opacity: 0.5, filter: `drop-shadow(0 0 8px ${C.cyan})` }}>🖼️</div>
          <div style={{
            color: C.muted, fontSize: 17, textAlign: "center",
            fontFamily: "'Hind Siliguri', sans-serif",
            lineHeight: 1.5, opacity: 0.65,
          }}>
            {label}
          </div>
        </div>
      </div>
      {tint && (
        <div style={{ position: "absolute", inset: 0, backgroundColor: tint, pointerEvents: "none" }} />
      )}
    </div>
  );
};
