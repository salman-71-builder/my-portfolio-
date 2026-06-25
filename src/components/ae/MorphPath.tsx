import { useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { interpolate as flubberInterp } from "flubber";
import { easeInOut } from "../../utils/easing";

type Props = {
  from: string;
  to: string;
  startFrame: number;
  durationInFrames?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  ease?: (t: number) => number;
  style?: React.CSSProperties;
};

// Morphs one SVG path into another using flubber (AE shape-layer morph).
export const MorphPath: React.FC<Props> = ({
  from,
  to,
  startFrame,
  durationInFrames = 60,
  fill = "none",
  stroke,
  strokeWidth,
  ease = easeInOut,
  style,
}) => {
  const frame = useCurrentFrame();
  const morphFn = useMemo(
    () => flubberInterp(from, to, { maxSegmentLength: 4 }),
    [from, to],
  );
  const raw = interpolate(frame, [startFrame, startFrame + durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const d = morphFn(ease(raw));
  return <path d={d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} style={style} />;
};
