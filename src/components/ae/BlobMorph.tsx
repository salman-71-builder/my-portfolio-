import { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { interpolate as flubberInterp } from "flubber";
import { easeInOut } from "../../utils/easing";

type Props = {
  shapes: string[]; // 2+ blob paths; cycles through them and loops
  framesPerStep?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
};

// Continuously morphs through a list of organic blob shapes and loops —
// AE "liquify" / morphing shape layer feel.
export const BlobMorph: React.FC<Props> = ({
  shapes,
  framesPerStep = 60,
  fill = "#00E5FF",
  stroke,
  strokeWidth,
  style,
}) => {
  const frame = useCurrentFrame();
  // Build a morph fn between each consecutive pair (looping back to start).
  const morphers = useMemo(() => {
    const fns: ((t: number) => string)[] = [];
    for (let i = 0; i < shapes.length; i++) {
      const a = shapes[i];
      const b = shapes[(i + 1) % shapes.length];
      fns.push(flubberInterp(a, b, { maxSegmentLength: 6 }));
    }
    return fns;
  }, [shapes]);

  const total = framesPerStep * shapes.length;
  const loopFrame = ((frame % total) + total) % total;
  const stepIdx = Math.floor(loopFrame / framesPerStep);
  const localRaw = (loopFrame - stepIdx * framesPerStep) / framesPerStep;
  const d = morphers[stepIdx](easeInOut(localRaw));

  return <path d={d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} style={style} />;
};
