import { useMemo } from "react";
import { useCurrentFrame, interpolate } from "remotion";
import { CubicSeg, segmentsToPath, approxLength, travelPath } from "../../utils/bezier";
import { easeInOut } from "../../utils/easing";

type Props = {
  segments: CubicSeg[];
  startFrame: number;
  durationInFrames?: number;
  trailColor?: string;
  trailWidth?: number;
  emoji?: string;
  emojiSize?: number;
  rotateWithPath?: boolean;
  children?: React.ReactNode; // custom traveller (overrides emoji)
};

// AE motion-path: a traveller follows a curved bezier while a dotted trail
// draws on behind it.
export const BezierTravel: React.FC<Props> = ({
  segments,
  startFrame,
  durationInFrames = 150,
  trailColor = "#00E5FF",
  trailWidth = 3,
  emoji = "📦",
  emojiSize = 40,
  rotateWithPath = true,
  children,
}) => {
  const frame = useCurrentFrame();
  const pathD = useMemo(() => segmentsToPath(segments), [segments]);
  const len = useMemo(() => approxLength(segments), [segments]);

  const progress = interpolate(frame, [startFrame, startFrame + durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const eased = easeInOut(progress);
  const { x, y, angle } = travelPath(segments, eased);

  return (
    <g>
      <path
        d={pathD}
        stroke={trailColor}
        strokeWidth={trailWidth}
        strokeDasharray="10 8"
        strokeDashoffset={len * (1 - eased)}
        fill="none"
        opacity={0.6}
        style={{ filter: `drop-shadow(0 0 6px ${trailColor})` }}
      />
      {progress > 0.001 && (
        <g transform={`translate(${x}, ${y}) rotate(${rotateWithPath ? angle : 0})`}>
          {children ?? (
            <text x={0} y={emojiSize * 0.35} textAnchor="middle" fontSize={emojiSize}>
              {emoji}
            </text>
          )}
        </g>
      )}
    </g>
  );
};
