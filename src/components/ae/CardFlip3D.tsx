import { useCurrentFrame, interpolate } from "remotion";
import { easeInOut } from "../../utils/easing";

type Props = {
  startFrame: number;
  durationInFrames?: number;
  width: number;
  height: number;
  front: React.ReactNode;
  back: React.ReactNode;
  frontBorder?: string;
  backBorder?: string;
  frontBg?: string;
  backBg?: string;
};

// AE 3D layer flip — front rotates on Y to reveal the back face.
export const CardFlip3D: React.FC<Props> = ({
  startFrame,
  durationInFrames = 40,
  width,
  height,
  front,
  back,
  frontBorder = "#00E5FF",
  backBorder = "#FF2D2D",
  frontBg = "#0D1526",
  backBg = "#1A0A0A",
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [startFrame, startFrame + durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rotation = interpolate(easeInOut(p), [0, 1], [0, 180]);

  const face: React.CSSProperties = {
    position: "absolute",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    width: "100%",
    height: "100%",
    borderRadius: 16,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div style={{ perspective: 1200, width, height }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transform: `rotateY(${rotation}deg)`,
        }}
      >
        <div style={{ ...face, background: frontBg, border: `2px solid ${frontBorder}` }}>{front}</div>
        <div
          style={{
            ...face,
            background: backBg,
            border: `2px solid ${backBorder}`,
            transform: "rotateY(180deg)",
          }}
        >
          {back}
        </div>
      </div>
    </div>
  );
};
