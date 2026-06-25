import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C } from "../constants/colors";
import { AnimatedScamScene } from "../animations/AnimatedScamScene";
import { ParticleBurst } from "../components/ParticleBurst";
import {
  punchSpring, overshootScale, letterSpacingSnap,
  driftY, textGlow, breatheOp,
} from "../utils/energy";

const BULLETS = [
  { text: "১০ দিন? বাস্তবে ৪৫-৬০ দিন সময় লাগে", startFrame: 90 },
  { text: "ভুল সিদ্ধান্ত = বড় আর্থিক ক্ষতি", startFrame: 165 },
  { text: "চটকদার বিজ্ঞাপন = বিপদের শুরু", startFrame: 240 },
];

const RedCross: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [startFrame, startFrame + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const dash = 650;
  const glow = 16 + Math.sin(frame * 0.14) * 6;
  return (
    <svg width="380" height="380" viewBox="0 0 380 380"
      style={{ position: "absolute", top: "27%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 8 }}>
      <line x1="60" y1="60" x2="320" y2="320" stroke={C.red} strokeWidth={26} strokeLinecap="round"
        strokeDasharray={dash} strokeDashoffset={dash * (1 - p)}
        style={{ filter: `drop-shadow(0 0 ${glow}px ${C.red})` }} />
      <line x1="320" y1="60" x2="60" y2="320" stroke={C.red} strokeWidth={26} strokeLinecap="round"
        strokeDasharray={dash} strokeDashoffset={dash * (1 - p)}
        style={{ filter: `drop-shadow(0 0 ${glow}px ${C.red})` }} />
    </svg>
  );
};

const ScamBadge: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = punchSpring(frame, fps, startFrame);
  const scale = overshootScale(sc);
  const pulse = 1 + Math.sin(frame * 0.16) * 0.04;
  const glowSize = 30 + Math.sin(frame * 0.18) * 14;
  if (frame < startFrame) return null;
  return (
    <div style={{
      position: "absolute", top: 44, right: 90, zIndex: 20,
      transform: `scale(${scale * pulse})`,
    }}>
      <div style={{
        width: 210, height: 210,
        clipPath: "polygon(30% 0%,70% 0%,100% 30%,100% 70%,70% 100%,30% 100%,0% 70%,0% 30%)",
        background: `radial-gradient(circle, #FF1A1A, #990000)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 ${glowSize}px rgba(255,0,0,0.8), 0 0 ${glowSize * 2}px rgba(255,0,0,0.35)`,
        opacity: sc,
      }}>
        <span style={{
          color: C.white, fontSize: 42, fontWeight: 900,
          fontFamily: "'Hind Siliguri', sans-serif",
          textShadow: textGlow(frame, C.red, 10, 4),
          transform: `scale(${1 + Math.sin(frame * 0.18) * 0.03})`,
          display: "block",
        }}>
          সতর্কতা!
        </span>
      </div>
    </div>
  );
};

export const Scene3Warning: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 3 rapid red flashes at 0, 5, 10
  const flash0 = interpolate(frame, [0, 2, 5], [0, 0.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash1 = interpolate(frame, [5, 7, 10], [0, 0.45, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash2 = interpolate(frame, [10, 12, 15], [0, 0.4, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flashOp = Math.max(flash0, flash1, flash2);

  // Screen shake — 15 frames
  const shake = interpolate(frame, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    [0, 10, -10, 8, -8, 10, -10, 7, -7, 5, -5, 3, -3, 2, 0, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const stripePos = (frame * 4) % 80;
  const vigOp = interpolate(frame, [0, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bgBreath = breatheOp(frame, 0.1, 0.05, 0.1);

  // WARNING text slam at frame 20
  const warnSc = punchSpring(frame, fps, 20);
  const warnScale = overshootScale(warnSc);

  return (
    <div style={{
      width: "100%", height: "100%",
      backgroundColor: C.bgPrimary,
      position: "relative", overflow: "hidden",
      fontFamily: "'Hind Siliguri', sans-serif",
      transform: `translateX(${shake}px)`,
    }}>
      {/* Moving warning stripes */}
      {frame >= 15 && (
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `repeating-linear-gradient(45deg,
            transparent, transparent 26px,
            rgba(150,0,0,0.22) 26px, rgba(150,0,0,0.22) 52px)`,
          backgroundPosition: `${stripePos}px 0`,
        }} />
      )}

      {/* Red breathe glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,0,0,${bgBreath}) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Red vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(150,0,0,0.65) 100%)",
        opacity: vigOp, pointerEvents: "none",
      }} />

      {/* Ghost fake ad */}
      <div style={{
        position: "absolute", top: "27%", left: "50%",
        transform: "translate(-50%,-50%)",
        opacity: 0.28, zIndex: 2, textAlign: "center",
      }}>
        <div style={{ color: C.gold, fontSize: 66, fontWeight: 900 }}>
          🚀 মাত্র ১০ দিনে চায়না ডেলিভারি!
        </div>
      </div>

      {/* Red cross */}
      {frame >= 28 && <RedCross startFrame={28} />}

      {/* Scam badge */}
      <ScamBadge startFrame={58} />

      {/* Burst when cross appears */}
      <ParticleBurst startFrame={28} x={960} y={380} count={20} colors={[C.red, "#FF6666", C.white]} radius={180} />

      {/* WARNING header */}
      {frame >= 20 && (
        <div style={{
          position: "absolute", top: 38, left: "50%",
          transform: `translateX(-50%) scale(${warnScale}) translateY(${driftY(frame, 0)}px)`,
          opacity: warnSc, zIndex: 15,
          color: C.red, fontSize: 52, fontWeight: 900,
          letterSpacing: letterSpacingSnap(warnSc),
          textShadow: textGlow(frame, C.red, 20, 10),
          filter: `drop-shadow(0 0 20px ${C.red})`,
          whiteSpace: "nowrap",
        }}>
          ⚠ সাবধান! ⚠
        </div>
      )}

      {/* Bullets */}
      <div style={{
        position: "absolute", bottom: 90, left: 90, right: 90, zIndex: 15,
        display: "flex", flexDirection: "column", gap: 22,
      }}>
        {BULLETS.map(({ text, startFrame: sf }, i) => {
          const sc = punchSpring(frame, fps, sf);
          const scale = overshootScale(sc);
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 20,
              transform: `translateX(${interpolate(sc, [0, 1], [-500, 0])}px) scale(${scale})`,
              opacity: sc,
              transformOrigin: "left center",
            }}>
              <span style={{ fontSize: 38, filter: `drop-shadow(0 0 8px ${C.red})` }}>❌</span>
              <span style={{
                color: C.white, fontSize: 30, fontWeight: 900,
                textShadow: "0 2px 12px rgba(0,0,0,0.9)",
                letterSpacing: letterSpacingSnap(sc),
              }}>
                {text}
              </span>
            </div>
          );
        })}
      </div>

      {/* AI image — red tinted */}
      <div style={{ position: "absolute", right: 70, bottom: 100, zIndex: 16 }}>
        <AnimatedScamScene width={400} height={270} />
      </div>

      {/* Burst on each bullet */}
      <ParticleBurst startFrame={90}  x={120} y={900} count={10} colors={[C.red, "#FF6666"]} radius={80} />
      <ParticleBurst startFrame={165} x={120} y={860} count={10} colors={[C.red, "#FF6666"]} radius={80} />
      <ParticleBurst startFrame={240} x={120} y={820} count={10} colors={[C.red, "#FF6666"]} radius={80} />

      {/* Red flash overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: `rgba(255,0,0,${flashOp})`,
        pointerEvents: "none", zIndex: 50,
      }} />
    </div>
  );
};
