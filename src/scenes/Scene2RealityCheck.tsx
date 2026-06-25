import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C } from "../constants/colors";
import { ProcessCard } from "../components/ProcessCard";
import { AnimatedBankScene } from "../animations/AnimatedBankScene";
import { ParticleBurst } from "../components/ParticleBurst";
import { RollingNumber } from "../components/ae/RollingNumber";
import { WaveReveal } from "../components/ae/WaveReveal";
import {
  punchSpring, overshootScale, letterSpacingSnap,
  driftY, textGlow, breatheOp, impactFlash,
} from "../utils/energy";

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

const STEPS = [
  { icon: "🏦", title: "ব্যাংকে LC ওপেন", frame: 55 },
  { icon: "🔍", title: "প্রোডাক্ট সোর্সিং", frame: 90 },
  { icon: "💳", title: "পারচেজ অর্ডার", frame: 125 },
  { icon: "⏳", title: "প্রসেসিং সময়", frame: 160 },
];

export const Scene2RealityCheck: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const flash = impactFlash(frame, 0);
  const bgBreath = breatheOp(frame, 0.06, 0.03, 0.07);

  // Wipe instant
  const wipe = interpolate(frame, [2, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Title SLAMS
  const titleSc = punchSpring(frame, fps, 18);
  const titleScale = overshootScale(titleSc);
  const underlineW = interpolate(frame, [30, 50], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      width: "100%", height: "100%",
      backgroundColor: C.bgPrimary,
      position: "relative", overflow: "hidden",
      fontFamily: "'Hind Siliguri', sans-serif",
    }}>
      {/* Blueprint grid */}
      <div style={{
        position: "absolute", inset: 0, opacity: wipe,
        backgroundImage: `linear-gradient(rgba(0,229,255,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,229,255,0.05) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Cyan breathe glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 55% 40% at 50% 50%, rgba(0,229,255,${bgBreath}) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Wipe reveal */}
      <div style={{
        position: "absolute", inset: 0,
        clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)`,
        backgroundColor: C.bgSecondary,
        zIndex: 0,
      }} />

      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        padding: "50px 90px", gap: 36, opacity: wipe,
      }}>
        {/* Title */}
        <div style={{
          transform: `scale(${titleScale}) translateY(${driftY(frame, 20)}px)`,
          opacity: titleSc, alignSelf: "flex-start",
        }}>
          <div style={{
            color: C.white, fontSize: 60, fontWeight: 900,
            letterSpacing: letterSpacingSnap(titleSc),
            textShadow: textGlow(frame, C.cyan, 12, 5),
            filter: `drop-shadow(0 0 18px ${C.cyan})`,
          }}>
            আসল প্রক্রিয়া জানুন
          </div>
          <div style={{
            marginTop: 8, height: 5, width: `${underlineW}%`,
            background: `linear-gradient(90deg, ${C.cyan}, #00B4D8)`,
            borderRadius: 3,
            boxShadow: `0 0 14px ${C.cyan}, 0 0 30px rgba(0,229,255,0.4)`,
          }} />
        </div>

        {/* Real-timeline odometer — the true duration rolls into place */}
        {frame >= 185 && (
          <div style={{
            display: "flex", alignItems: "center", gap: 14,
            background: C.cardBg, border: `1.5px solid ${C.cardBorder}`,
            borderRadius: 14, padding: "10px 24px", alignSelf: "flex-start",
            backdropFilter: "blur(10px)",
          }}>
            <span style={{ color: C.muted, fontSize: 28, fontWeight: 700 }}>প্রকৃত সময়:</span>
            <RollingNumber value="৪৫" startFrame={188} digitSet={BN_DIGITS} digitHeight={42} fontSize={36} color={C.cyan} glow={C.cyan} />
            <span style={{ color: C.cyan, fontSize: 36, fontWeight: 900 }}>–</span>
            <RollingNumber value="৬০" startFrame={196} digitSet={BN_DIGITS} digitHeight={42} fontSize={36} color={C.cyan} glow={C.cyan} />
            <span style={{ color: C.muted, fontSize: 28, fontWeight: 700 }}>দিন</span>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 40, flex: 1 }}>
          {/* Staggered process cards */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, flex: 1, alignContent: "flex-start" }}>
            {STEPS.map((s, i) => (
              <ProcessCard key={i} icon={s.icon} title={s.title} startFrame={s.frame} showArrow={i < STEPS.length - 1} />
            ))}
          </div>
          {/* Bank scene revealed behind an advancing wavy mask (AE mask reveal) */}
          <div style={{ position: "relative", width: 460, height: 340, flexShrink: 0 }}>
            <WaveReveal startFrame={20} durationInFrames={46} width={460} height={340}>
              <AnimatedBankScene width={460} height={340} />
            </WaveReveal>
          </div>
        </div>
      </div>

      {/* Burst when first card hits */}
      <ParticleBurst startFrame={55} x={300} y={480} count={14} colors={[C.cyan, C.white]} radius={140} />

      {/* Impact flash */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: `rgba(0,229,255,${flash * 0.35})`,
        pointerEvents: "none", zIndex: 99,
      }} />
    </div>
  );
};
