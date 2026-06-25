import { useCurrentFrame, interpolate } from "remotion";
import { C } from "../constants/colors";

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
  label,
  startFrame,
  width = 520,
  height = 340,
  slideFrom = "right",
  kenBurnsScale = 1.06,
  tint,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [startFrame, startFrame + 25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const xOffset = slideFrom === "right" ? interpolate(progress, [0, 1], [120, 0])
    : slideFrom === "left" ? interpolate(progress, [0, 1], [-120, 0])
    : 0;
  const yOffset = slideFrom === "bottom" ? interpolate(progress, [0, 1], [80, 0]) : 0;

  const elapsed = Math.max(0, frame - startFrame);
  const zoom = 1 + (kenBurnsScale - 1) * Math.min(elapsed / 300, 1);

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 16,
        border: `2px solid ${C.cardBorder}`,
        overflow: "hidden",
        opacity: progress,
        transform: `translateX(${xOffset}px) translateY(${yOffset}px)`,
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* Gradient mockup */}
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0D1526 0%, #1a2744 50%, #0D1526 100%)",
          transform: `scale(${zoom})`,
          transformOrigin: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            border: `1.5px dashed ${C.cardBorder}`,
            borderRadius: 12,
            width: "90%",
            height: "80%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 36, opacity: 0.6 }}>🖼️</div>
          <div
            style={{
              color: C.muted,
              fontSize: 18,
              textAlign: "center",
              fontFamily: "'Hind Siliguri', sans-serif",
              lineHeight: 1.5,
              opacity: 0.7,
            }}
          >
            {label}
          </div>
        </div>
      </div>
      {tint && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: tint,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};
