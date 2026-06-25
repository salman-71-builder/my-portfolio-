import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C } from "../constants/colors";
import { AiImageCard } from "../components/AiImageCard";

const BULLETS = [
  { text: "১০ দিন? বাস্তবে ৪৫-৬০ দিন সময় লাগে", startFrame: 90 },
  { text: "ভুল সিদ্ধান্ত = বড় আর্থিক ক্ষতি", startFrame: 170 },
  { text: "চটকদার বিজ্ঞাপন = বিপদের শুরু", startFrame: 250 },
];

const RedCross: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [startFrame, startFrame + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dash = 600;
  return (
    <svg width="360" height="360" viewBox="0 0 360 360" style={{ position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 8, opacity: 0.9 }}>
      <line x1="60" y1="60" x2="300" y2="300" stroke={C.red} strokeWidth={24} strokeLinecap="round" strokeDasharray={dash} strokeDashoffset={dash * (1 - p)} />
      <line x1="300" y1="60" x2="60" y2="300" stroke={C.red} strokeWidth={24} strokeLinecap="round" strokeDasharray={dash} strokeDashoffset={dash * (1 - p)} />
    </svg>
  );
};

const ScamBadge: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = spring({ frame: frame - startFrame, fps, config: { damping: 8, stiffness: 220, mass: 0.7 }, durationInFrames: 18 });
  const pulse = 1 + Math.sin(frame * 0.1) * 0.03;
  if (frame < startFrame) return null;
  return (
    <div style={{
      position: "absolute", top: 50, right: 100, zIndex: 20,
      transform: `scale(${sc * pulse})`,
    }}>
      <div style={{
        width: 190, height: 190,
        clipPath: "polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)",
        backgroundColor: "#CC0000",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 50px rgba(255,0,0,0.6)",
        opacity: sc,
      }}>
        <span style={{ color: C.white, fontSize: 38, fontWeight: 900, fontFamily: "'Hind Siliguri', sans-serif" }}>সতর্কতা!</span>
      </div>
    </div>
  );
};

export const Scene3Warning: React.FC = () => {
  const frame = useCurrentFrame();

  // Screen shake first 15 frames
  const shake = interpolate(frame, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    [0, 10, -10, 8, -8, 9, -9, 6, -6, 4, -4, 3, -3, 1, 0, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Red flash 3 pulses
  const flash1 = interpolate(frame, [0, 3, 6], [0, 0.45, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash2 = interpolate(frame, [5, 8, 11], [0, 0.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash3 = interpolate(frame, [10, 13, 16], [0, 0.35, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flashOp = Math.max(flash1, flash2, flash3);

  const stripeOffset = (frame * 3) % 80;

  const vigOp = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      width: "100%", height: "100%",
      backgroundColor: C.bgPrimary,
      position: "relative", overflow: "hidden",
      fontFamily: "'Hind Siliguri', sans-serif",
      transform: `translateX(${shake}px)`,
    }}>
      {/* Animated warning stripes */}
      {frame >= 15 && (
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 28px, rgba(160,0,0,0.2) 28px, rgba(160,0,0,0.2) 56px)`,
          backgroundPosition: `${stripeOffset}px 0`,
          zIndex: 0,
        }} />
      )}

      {/* Red vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, transparent 35%, rgba(160,0,0,0.6) 100%)",
        opacity: vigOp, pointerEvents: "none", zIndex: 1,
      }} />

      {/* Ghost fake ad */}
      <div style={{
        position: "absolute", top: "28%", left: "50%",
        transform: "translate(-50%,-50%)",
        opacity: 0.25, zIndex: 2, textAlign: "center",
      }}>
        <div style={{ color: C.gold, fontSize: 60, fontWeight: 900 }}>🚀 মাত্র ১০ দিনে চায়না ডেলিভারি!</div>
      </div>

      {/* Red cross */}
      {frame >= 30 && <RedCross startFrame={30} />}

      {/* Scam badge */}
      <ScamBadge startFrame={60} />

      {/* Bullets */}
      <div style={{
        position: "absolute", bottom: 100, left: 100, right: 100, zIndex: 15,
        display: "flex", flexDirection: "column", gap: 20,
      }}>
        {BULLETS.map(({ text, startFrame: sf }, i) => {
          const p = interpolate(frame, [sf, sf + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 20,
              transform: `translateX(${interpolate(p, [0, 1], [-600, 0])}px)`,
              opacity: p,
            }}>
              <span style={{ fontSize: 36 }}>❌</span>
              <span style={{ color: C.white, fontSize: 30, fontWeight: 600, textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>{text}</span>
            </div>
          );
        })}
      </div>

      {/* AI image */}
      <div style={{ position: "absolute", right: 80, bottom: 120, zIndex: 16 }}>
        <AiImageCard
          label="Stressed man, wrong delivery broken products, red dramatic lighting"
          startFrame={300}
          width={420}
          height={280}
          slideFrom="right"
          tint="rgba(180,0,0,0.15)"
        />
      </div>

      {/* Flash overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: `rgba(255,0,0,${flashOp})`,
        pointerEvents: "none", zIndex: 50,
      }} />
    </div>
  );
};
