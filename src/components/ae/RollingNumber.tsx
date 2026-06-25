import { useCurrentFrame, interpolate } from "remotion";
import { easeOut } from "../../utils/easing";

type Props = {
  value: number | string; // final number (digits roll to it)
  startFrame: number;
  digitHeight?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number | string;
  prefix?: string;
  suffix?: string;
  glow?: string;
  digitSet?: string[]; // glyphs for 0–9 (e.g. Bengali ['০'..'৯']); default ASCII
};

const ASCII_DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

// AE odometer: each digit rolls vertically like a slot machine into place.
export const RollingNumber: React.FC<Props> = ({
  value,
  startFrame,
  digitHeight = 120,
  fontSize = 96,
  color = "#00E5FF",
  fontWeight = 900,
  prefix = "",
  suffix = "",
  glow,
  digitSet = ASCII_DIGITS,
}) => {
  const frame = useCurrentFrame();
  const str = String(value);
  const chars = str.split("");
  const digitIndex = (c: string) => digitSet.indexOf(c);

  const renderDigit = (digit: number, i: number) => {
    const delay = startFrame + i * 8;
    const p = interpolate(frame, [delay, delay + 45], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    // Roll through several full spins then settle on the target digit.
    const spins = 2;
    const totalTravel = (spins * 10 + digit) * digitHeight;
    const offset = -interpolate(easeOut(p), [0, 1], [0, totalTravel]) % (digitHeight * 10);
    return (
      <div key={i} style={{ position: "relative", height: digitHeight, width: fontSize * 0.62, overflow: "hidden" }}>
        {Array.from({ length: 20 }, (_, n) => (
          <div
            key={n}
            style={{
              position: "absolute",
              top: offset + n * digitHeight,
              left: 0,
              right: 0,
              height: digitHeight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize,
              fontWeight,
              color,
              textShadow: glow ? `0 0 18px ${glow}, 0 0 40px ${glow}66` : undefined,
            }}
          >
            {digitSet[n % 10]}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: "flex", alignItems: "center", height: digitHeight }}>
      {prefix && (
        <span style={{ fontSize, fontWeight, color, textShadow: glow ? `0 0 18px ${glow}` : undefined }}>{prefix}</span>
      )}
      {chars.map((c, i) =>
        digitIndex(c) !== -1 ? (
          renderDigit(digitIndex(c), i)
        ) : (
          <span key={i} style={{ fontSize, fontWeight, color, textShadow: glow ? `0 0 18px ${glow}` : undefined }}>
            {c}
          </span>
        ),
      )}
      {suffix && (
        <span style={{ fontSize, fontWeight, color, textShadow: glow ? `0 0 18px ${glow}` : undefined }}>{suffix}</span>
      )}
    </div>
  );
};
