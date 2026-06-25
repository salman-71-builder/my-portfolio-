import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C } from "../constants/colors";
import { AiImageCard } from "../components/AiImageCard";

const STEPS = [
  { num: "১", icon: "🌐", title: "ওয়েবসাইট ভিজিট করুন", sub: "chinacart.com.bd", startFrame: 40 },
  { num: "২", icon: "💳", title: "বাংলা টাকায় অর্ডার করুন", sub: "সহজ পেমেন্ট", startFrame: 110 },
  { num: "৩", icon: "✅", title: "আমরা বাকি সব করব", sub: "সোর্সিং → QC → ডেলিভারি", startFrame: 180 },
];

export const Scene7HowItWorks: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSc = spring({ frame: frame - 5, fps, config: { damping: 10, stiffness: 200, mass: 0.8 }, durationInFrames: 20 });

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
        backgroundImage: `linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", padding: "60px 80px", gap: 48,
      }}>
        {/* Title */}
        <div style={{ transform: `scale(${titleSc})`, opacity: titleSc }}>
          <div style={{ color: C.white, fontSize: 56, fontWeight: 800, textAlign: "center" }}>কীভাবে কাজ করে?</div>
        </div>

        {/* 3-step horizontal flow */}
        <div style={{ display: "flex", alignItems: "center", gap: 28, width: "100%" }}>
          {STEPS.map((s, i) => {
            const sc = spring({ frame: frame - s.startFrame, fps, config: { damping: 10, stiffness: 200, mass: 0.8 }, durationInFrames: 22 });
            const arrowOp = interpolate(frame, [s.startFrame + 18, s.startFrame + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

            return (
              <React.Fragment key={i}>
                <div style={{
                  flex: 1, opacity: sc,
                  transform: `scale(${0.6 + sc * 0.4}) translateY(${interpolate(sc, [0, 1], [30, 0])}px)`,
                  background: C.cardBg,
                  border: `1.5px solid ${C.cardBorder}`,
                  borderRadius: 20, padding: "28px 24px",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 14,
                  backdropFilter: "blur(8px)",
                  boxShadow: `0 0 28px rgba(0,229,255,0.1)`,
                }}>
                  {/* Number circle */}
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    backgroundColor: C.cyan,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#000", fontSize: 26, fontWeight: 900,
                    boxShadow: `0 0 16px ${C.cyan}`,
                  }}>{s.num}</div>
                  <div style={{ fontSize: 52 }}>{s.icon}</div>
                  <div style={{ color: C.white, fontSize: 26, fontWeight: 700, textAlign: "center" }}>{s.title}</div>
                  <div style={{ color: C.cyan, fontSize: 20, textAlign: "center" }}>{s.sub}</div>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ color: C.cyan, fontSize: 44, fontWeight: 900, opacity: arrowOp, flexShrink: 0 }}>→</div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* AI image */}
        <AiImageCard
          label="Person on laptop ordering products, ecommerce website, Bangladeshi home/office, warm lighting"
          startFrame={260}
          width={700}
          height={240}
          slideFrom="bottom"
        />
      </div>
    </div>
  );
};
