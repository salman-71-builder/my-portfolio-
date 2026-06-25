import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C } from "../constants/colors";
import { StatCard } from "../components/StatCard";
import { AiImageCard } from "../components/AiImageCard";
import { ParticleBurst } from "../components/ParticleBurst";
import {
  punchSpring, snapSpring, overshootScale, letterSpacingSnap,
  driftY, textGlow, breatheOp,
} from "../utils/energy";

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
  const burstOp = interpolate(frame, [0, 8, 50, 70], [0, 0.5, 0.35, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Logo SLAMS in at frame 6
  const logoSc = punchSpring(frame, fps, 6);
  const logoScale = overshootScale(logoSc);
  const underlineW = interpolate(frame, [22, 48], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // "China" and "Cart" have separate offsets for stagger
  const cartSc = snapSpring(frame, fps, 14);
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

      {/* MEGA particle burst on brand reveal */}
      <ParticleBurst startFrame={6} x={960} y={360} count={30} colors={[C.cyan, "#00B4D8", C.white, C.gold]} radius={400} />
      <ParticleBurst startFrame={10} x={960} y={360} count={20} colors={[C.cyan, C.white]} radius={250} />

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

      {/* Stats */}
      <div style={{
        position: "absolute", top: "46%", left: "50%",
        transform: "translateX(-50%)",
        display: "flex", gap: 28,
      }}>
        <StatCard value="৭+" label="বছরের অভিজ্ঞতা" startFrame={65} />
        <StatCard value="১,০০,০০০+" label="সন্তুষ্ট ইমপোর্টার" startFrame={100} />
        <StatCard value="নিজস্ব" label="চায়না ওয়্যারহাউস ও টিম" startFrame={135} />
      </div>

      {/* AI images */}
      <div style={{
        position: "absolute", bottom: 130, left: "50%",
        transform: "translateX(-50%)",
        display: "flex", gap: 28,
      }}>
        <AiImageCard label="China warehouse exterior, aerial wide shot" startFrame={210} width={440} height={235} slideFrom="left" />
        <AiImageCard label="Team Bangladesh China professionals collaborative office" startFrame={228} width={440} height={235} slideFrom="right" />
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
