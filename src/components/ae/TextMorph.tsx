import { useCurrentFrame, interpolate } from "remotion";

type Props = {
  text: string;
  startFrame: number;
  stagger?: number; // frames between each char
  charDuration?: number;
  fontSize?: number;
  fontWeight?: number | string;
  color?: string;
  hueShift?: boolean; // sweep hue 0→190 on arrival
  glow?: string;
  style?: React.CSSProperties;
};

// AE text-animator: each character scales/rotates/blurs/fades in independently.
export const TextMorph: React.FC<Props> = ({
  text,
  startFrame,
  stagger = 4,
  charDuration = 20,
  fontSize = 80,
  fontWeight = 900,
  color = "#FFFFFF",
  hueShift = false,
  glow,
  style,
}) => {
  const frame = useCurrentFrame();
  const chars = Array.from(text);

  return (
    <div style={{ display: "flex", justifyContent: "center", ...style }}>
      {chars.map((char, i) => {
        const delay = startFrame + i * stagger;
        const p = interpolate(frame, [delay, delay + charDuration], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const scale = interpolate(p, [0, 1], [3, 1]);
        const rot = interpolate(p, [0, 1], [180, 0]);
        const ty = interpolate(p, [0, 1], [-60, 0]);
        const blur = interpolate(p, [0, 1], [20, 0]);
        const col = hueShift ? `hsl(${interpolate(p, [0, 1], [0, 190])}, 100%, 60%)` : color;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              fontSize,
              fontWeight,
              lineHeight: 1,
              transform: `scale(${scale}) rotate(${rot}deg) translateY(${ty}px)`,
              opacity: p,
              filter: `blur(${blur}px)${glow ? ` drop-shadow(0 0 14px ${glow})` : ""}`,
              color: col,
            }}
          >
            {char === " " ? " " : char}
          </span>
        );
      })}
    </div>
  );
};
