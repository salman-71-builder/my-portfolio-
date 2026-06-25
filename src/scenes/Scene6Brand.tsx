import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C } from "../constants/colors";
import { StatCard } from "../components/StatCard";
import { AnimatedWarehouseScene } from "../animations/AnimatedWarehouseScene";
import { AnimatedConnectionScene } from "../animations/AnimatedConnectionScene";
import { ParticleBurst } from "../components/ParticleBurst";
import { ParticleText } from "../components/ae/ParticleText";
import { RollingNumber } from "../components/ae/RollingNumber";
import {
  punchSpring, snapSpring, overshootScale, letterSpacingSnap,
  driftY, textGlow, breatheOp,
} from "../utils/energy";

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

// Stat card whose number rolls in like an odometer.
const RollingStat: React.FC<{ value: string; label: string; startFrame: number }> = ({
  value, label, startFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sc = punchSpring(frame, fps, startFrame);
  const scale = overshootScale(sc);
  const tilt = Math.sin(frame * 0.06 + startFrame * 0.4) * 3;
  if (frame < startFrame) return null;
  return (
    <div style={{
      opacity: sc,
      transform: `scale(${scale}) rotate(${tilt}deg)`,
      transformOrigin: "center",
      background: C.cardBg,
      border: `2px solid ${C.cardBorder}`,
      borderRadius: 22, padding: "26px 34px",
      display: "flex", flexDirection: "column",
      alignItems: "center", gap: 8,
      backdropFilter: "blur(12px)",
      boxShadow: `0 0 36px rgba(0,229,255,0.15), inset 0 0 20px rgba(0,229,255,0.04)`,
      minWidth: 220,
    }}>
      <RollingNumber
        value={value}
        startFrame={startFrame + 4}
        digitSet={BN_DIGITS}
        digitHeight={62}
        fontSize={50}
        color={C.cyan}
        glow={C.cyan}
      />
      <div style={{ color: C.muted, fontSize: 21, textAlign: "center", fontFamily: "'Hind Siliguri', sans-serif", fontWeight: 600 }}>
        {label}
      </div>
    </div>
  );
};

const TRUST_BADGES = [
  { icon: "🏆", text: "৭ বছরের অভিজ্ঞতা" },
  { icon: "🔒", text: "নিরাপদ পেমেন্ট" },
  { icon: "🚢", text: "নিজস্ব শিপমেন্ট" },
  { icon: "🇧🇩", text: "বাংলাদেশ ভিত্তিক" },
];

export const Scene6Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgBreath = breatheOp(frame, 0.1, 0.06, 0.09);

  // MEGA burst on entry
  // Light burst opacity
  const burstOp = interpolate(frame, [88, 96, 140, 165], [0, 0.5, 0.35, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Particles assemble into the logo first, then the solid logo SLAMS in at 92
  const logoSc = punchSpring(frame, fps, 92);
  const logoScale = overshootScale(logoSc);
  const underlineW = interpolate(frame, [108, 134], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // "China" and "Cart" have separate offsets for stagger
  const cartSc = snapSpring(frame, fps, 100);
  const cartScale = overshootScale(cartSc);

  // Trust badges
  const badgeY = interpolate(frame, [318, 340], [60, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const badgeOp = interpolate(frame, [318, 340], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Continuous logo drift
  const logoDrift = driftY(frame, 5);

  return (
    <div style={{
      width: "100%", height: "100%",
      backgroundColor: C.bgPrimary,
      position: "relative", overflow: "hidden",
      fontFamily: "'Hind Siliguri', sans-serif",
    }}>
      {/* Radial light explosion */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 70% 55% at 50% 40%, rgba(0,229,255,${burstOp}) 0%, rgba(0,100,200,${burstOp * 0.4}) 40%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Breathing glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 55% 40% at 50% 42%, rgba(0,229,255,${bgBreath}) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Particles fly in and FORM the "ChinaCart" wordmark, then burst into the logo */}
      {frame < 100 && (
        <div style={{ position: "absolute", top: "14%", left: 0, right: 0, height: 220, zIndex: 4 }}>
          <ParticleText
            text="ChinaCart"
            width={1920}
            height={220}
            startFrame={0}
            formDuration={58}
            holdDuration={22}
            explodeDuration={22}
            fontSize={150}
            colors={[C.cyan, "#00B4D8", C.white, C.gold]}
            sampleGap={7}
          />
        </div>
      )}

      {/* MEGA particle burst as the solid logo lands */}
      <ParticleBurst startFrame={92} x={960} y={360} count={30} colors={[C.cyan, "#00B4D8", C.white, C.gold]} radius={400} />
      <ParticleBurst startFrame={96} x={960} y={360} count={20} colors={[C.cyan, C.white]} radius={250} />

      {/* Logo */}
      <div style={{
        position: "absolute", top: "16%", left: "50%",
        transform: `translateX(-50%) scale(${logoScale}) translateY(${logoDrift}px)`,
        opacity: logoSc, textAlign: "center",
      }}>
        <div style={{
          fontSize: 108, fontWeight: 900, lineHeight: 1, whiteSpace: "nowrap",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 90 }}>🛒</span>
          <span style={{
            color: C.white,
            textShadow: "0 4px 30px rgba(0,0,0,0.5)",
            letterSpacing: letterSpacingSnap(logoSc),
          }}>China</span>
          <span style={{
            color: C.cyan,
            textShadow: textGlow(frame, C.cyan, 22, 10),
            filter: `drop-shadow(0 0 20px ${C.cyan})`,
            transform: `scale(${cartScale})`,
            display: "inline-block",
            letterSpacing: letterSpacingSnap(cartSc),
          }}>Cart</span>
        </div>
        <div style={{
          marginTop: 16, height: 6, width: `${underlineW}%`,
          background: `linear-gradient(90deg, #00B4D8, ${C.cyan}, #90E0EF, ${C.cyan})`,
          borderRadius: 3,
          boxShadow: `0 0 20px ${C.cyan}, 0 0 50px rgba(0,229,255,0.4)`,
          marginLeft: "auto", marginRight: "auto",
        }} />
      </div>

      {/* Stats — numeric values roll in like an odometer (AE) */}
      <div style={{
        position: "absolute", top: "46%", left: "50%",
        transform: "translateX(-50%)",
        display: "flex", gap: 28, alignItems: "flex-start",
      }}>
        <RollingStat value="৭+" label="বছরের অভিজ্ঞতা" startFrame={150} />
        <RollingStat value="১,০০,০০০+" label="সন্তুষ্ট ইমপোর্টার" startFrame={172} />
        <StatCard value="নিজস্ব" label="চায়না ওয়্যারহাউস ও টিম" startFrame={196} />
      </div>

      {/* AI images */}
      <div style={{
        position: "absolute", bottom: 130, left: "50%",
        transform: "translateX(-50%)",
        display: "flex", gap: 28,
      }}>
        <AnimatedWarehouseScene width={440} height={235} />
        <AnimatedConnectionScene width={440} height={235} />
      </div>

      {/* Trust badges */}
      <div style={{
        position: "absolute", bottom: 36, left: "50%",
        transform: `translateX(-50%) translateY(${badgeY}px)`,
        opacity: badgeOp,
        display: "flex", gap: 20,
      }}>
        {TRUST_BADGES.map((b, i) => {
          const { fps: _fps } = { fps };
          const bSc = punchSpring(frame, fps, 318 + i * 16);
          const bScale = overshootScale(bSc);
          return (
            <div key={i} style={{
              transform: `scale(${bScale})`,
              opacity: bSc,
              background: C.cardBg,
              border: `1.5px solid ${C.cardBorder}`,
              borderRadius: 14, padding: "12px 22px",
              display: "flex", alignItems: "center", gap: 10,
              backdropFilter: "blur(10px)",
              boxShadow: `0 0 18px rgba(0,229,255,0.12)`,
            }}>
              <span style={{ fontSize: 26, filter: `drop-shadow(0 0 8px ${C.cyan})` }}>{b.icon}</span>
              <span style={{ color: C.white, fontSize: 19, fontWeight: 700 }}>{b.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
