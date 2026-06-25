import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C } from "../constants/colors";
import { AnimatedCustomerScene } from "../animations/AnimatedCustomerScene";
import { ParticleBurst } from "../components/ParticleBurst";
import {
  punchSpring, overshootScale, letterSpacingSnap,
  driftY, textGlow, breatheOp, impactFlash,
} from "../utils/energy";

const STEPS = [
  { num: "১", icon: "🌐", title: "ওয়েবসাইট ভিজিট করুন", sub: "chinacart.com.bd", startFrame: 35 },
  { num: "২", icon: "💳", title: "বাংলা টাকায় অর্ডার করুন", sub: "সহজ পেমেন্ট", startFrame: 100 },
  { num: "৩", icon: "✅", title: "আমরা বাকি সব করব", sub: "সোর্সিং → QC → ডেলিভারি", startFrame: 165 },
];

export const Scene7HowItWorks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const flash = impactFlash(frame, 0);
  const bgBreath = breatheOp(frame, 0.07, 0.04, 0.08);

  const titleSc = punchSpring(frame, fps, 8);
  const titleScale = overshootScale(titleSc);

  return (
    <div style={{
      width: "100%", height: "100%",
      backgroundColor: C.bgPrimary,
      position: "relative", overflow: "hidden",
      fontFamily: "'Hind Siliguri', sans-serif",
    }}>
      {/* Blueprint grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Breathe glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 60% 45% at 50% 50%, rgba(0,229,255,${bgBreath}) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <ParticleBurst startFrame={0} x={960} y={540} count={18} colors={[C.cyan, C.white, "#00B4D8"]} radius={280} />

      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", padding: "52px 70px", gap: 48,
      }}>
        {/* Title */}
        <div style={{
          transform: `scale(${titleScale}) translateY(${driftY(frame, 10)}px)`,
          opacity: titleSc,
        }}>
          <div style={{
            color: C.white, fontSize: 60, fontWeight: 900, textAlign: "center",
            letterSpacing: letterSpacingSnap(titleSc),
            textShadow: textGlow(frame, C.cyan, 14, 6),
            filter: `drop-shadow(0 0 18px ${C.cyan})`,
          }}>
            কীভাবে কাজ করে?
          </div>
        </div>

        {/* 3-step flow */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, width: "100%" }}>
          {STEPS.map((s, i) => {
            const sc = punchSpring(frame, fps, s.startFrame);
            const scale = overshootScale(sc);
            const tilt = (i === 0 ? -3 : i === 2 ? 3 : 0);
            const arrowOp = interpolate(frame, [s.startFrame + 16, s.startFrame + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

            return (
              <React.Fragment key={i}>
                <div style={{
                  flex: 1,
                  opacity: sc,
                  transform: `scale(${scale}) translateY(${driftY(frame, i * 20)}px) rotate(${tilt}deg)`,
                  transformOrigin: "center",
                  background: C.cardBg,
                  border: `2px solid ${C.cardBorder}`,
                  borderRadius: 22, padding: "30px 22px",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 16,
                  backdropFilter: "blur(10px)",
                  boxShadow: `0 0 32px rgba(0,229,255,0.14)`,
                }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${C.cyan}, #00B4D8)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#000", fontSize: 28, fontWeight: 900,
                    boxShadow: `0 0 20px ${C.cyan}`,
                    filter: `drop-shadow(0 0 12px ${C.cyan})`,
                  }}>{s.num}</div>
                  <div style={{ fontSize: 56 }}>{s.icon}</div>
                  <div style={{
                    color: C.white, fontSize: 26, fontWeight: 900, textAlign: "center",
                    letterSpacing: letterSpacingSnap(sc),
                  }}>{s.title}</div>
                  <div style={{
                    color: C.cyan, fontSize: 20, textAlign: "center",
                    textShadow: textGlow(frame, C.cyan, 8, 4),
                    filter: `drop-shadow(0 0 8px ${C.cyan})`,
                  }}>{s.sub}</div>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    color: C.cyan, fontSize: 48, fontWeight: 900,
                    opacity: arrowOp, flexShrink: 0,
                    filter: `drop-shadow(0 0 14px ${C.cyan})`,
                    transform: `scale(${1 + Math.sin(frame * 0.15) * 0.06})`,
                  }}>→</div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* AI image */}
        <AnimatedCustomerScene width={720} height={230} />
      </div>

      {/* Burst on each step */}
      <ParticleBurst startFrame={35}  x={360}  y={560} count={12} colors={[C.cyan, C.white]} radius={100} />
      <ParticleBurst startFrame={100} x={960}  y={560} count={12} colors={[C.cyan, C.white]} radius={100} />
      <ParticleBurst startFrame={165} x={1560} y={560} count={12} colors={[C.cyan, C.green]} radius={100} />

      {/* Impact flash */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: `rgba(0,229,255,${flash * 0.3})`,
        pointerEvents: "none", zIndex: 99,
      }} />
    </div>
  );
};
