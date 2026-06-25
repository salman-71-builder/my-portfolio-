import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C } from "../constants/colors";
import { StatCard } from "../components/StatCard";
import { AiImageCard } from "../components/AiImageCard";

const TRUST_BADGES = [
  { icon: "🏆", text: "৭ বছরের অভিজ্ঞতা" },
  { icon: "🔒", text: "নিরাপদ পেমেন্ট" },
  { icon: "🚢", text: "নিজস্ব শিপমেন্ট" },
  { icon: "🇧🇩", text: "বাংলাদেশ ভিত্তিক" },
];

export const Scene6Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Light burst
  const burstOp = interpolate(frame, [0, 10, 40, 60], [0, 0.3, 0.3, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Logo
  const logoSc = spring({ frame: frame - 5, fps, config: { damping: 9, stiffness: 220, mass: 0.8 }, durationInFrames: 25 });
  const underlineW = interpolate(frame, [25, 55], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Trust badges row slides up
  const badgesY = interpolate(frame, [320, 345], [60, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const badgesOp = interpolate(frame, [320, 345], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      width: "100%", height: "100%",
      backgroundColor: C.bgPrimary,
      position: "relative", overflow: "hidden",
      fontFamily: "'Hind Siliguri', sans-serif",
    }}>
      {/* Radial light burst */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 50% 40% at 50% 42%, rgba(0,229,255,${burstOp}) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Logo section */}
      <div style={{
        position: "absolute", top: "18%", left: "50%",
        transform: `translateX(-50%) scale(${logoSc})`,
        opacity: logoSc,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 100, fontWeight: 900, lineHeight: 1, whiteSpace: "nowrap" }}>
          <span style={{ color: C.white }}>🛒 China</span>
          <span style={{ color: C.cyan }}>Cart</span>
        </div>
        <div style={{
          marginTop: 14, height: 5, width: `${underlineW}%`,
          background: `linear-gradient(90deg, #00B4D8, ${C.cyan}, #90E0EF)`,
          borderRadius: 3, boxShadow: `0 0 16px ${C.cyan}`,
          marginLeft: "auto", marginRight: "auto",
        }} />
      </div>

      {/* Stats row */}
      <div style={{
        position: "absolute", top: "44%", left: "50%",
        transform: "translateX(-50%)",
        display: "flex", gap: 32,
      }}>
        <StatCard value="৭+" label="বছরের অভিজ্ঞতা" startFrame={70} />
        <StatCard value="১,০০,০০০+" label="সন্তুষ্ট ইমপোর্টার" startFrame={110} />
        <StatCard value="নিজস্ব" label="চায়না ওয়্যারহাউস ও টিম" startFrame={150} />
      </div>

      {/* AI images row */}
      <div style={{
        position: "absolute", bottom: 140, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 28,
      }}>
        <AiImageCard
          label="Modern China warehouse exterior, aerial wide shot, ChinaCart branding"
          startFrame={220}
          width={440}
          height={240}
          slideFrom="left"
        />
        <AiImageCard
          label="Team Bangladesh China professionals collaborative office"
          startFrame={240}
          width={440}
          height={240}
          slideFrom="right"
        />
      </div>

      {/* Trust badges */}
      <div style={{
        position: "absolute", bottom: 40, left: "50%", transform: `translateX(-50%) translateY(${badgesY}px)`,
        opacity: badgesOp,
        display: "flex", gap: 24,
      }}>
        {TRUST_BADGES.map((b, i) => {
          const bOp = interpolate(frame, [320 + i * 18, 340 + i * 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              opacity: bOp,
              background: C.cardBg,
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 14, padding: "12px 24px",
              display: "flex", alignItems: "center", gap: 10,
              backdropFilter: "blur(8px)",
            }}>
              <span style={{ fontSize: 26 }}>{b.icon}</span>
              <span style={{ color: C.white, fontSize: 20, fontWeight: 600 }}>{b.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
