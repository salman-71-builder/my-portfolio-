import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C } from "../constants/colors";
import { AiImageCard } from "../components/AiImageCard";
import { ParticleBurst } from "../components/ParticleBurst";
import {
  punchSpring, overshootScale, letterSpacingSnap,
  driftY, textGlow, breatheOp, impactFlash,
} from "../utils/energy";

export const Scene5Trust: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const flash = impactFlash(frame, 0);
  const bgBreath = breatheOp(frame, 0.07, 0.04, 0.09);

  const splitIn = interpolate(frame, [2, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mergeProgress = interpolate(frame, [120, 145], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const leftOp = interpolate(frame, [120, 140], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rightWidth = interpolate(mergeProgress, [0, 1], [50, 100]);

  // Statement after merge
  const stSc = punchSpring(frame, fps, 150);
  const stScale = overshootScale(stSc);
  const underlineW = interpolate(frame, [164, 190], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const divGlow = 18 + Math.sin(frame * 0.14) * 8;

  return (
    <div style={{
      width: "100%", height: "100%",
      backgroundColor: C.bgPrimary,
      position: "relative", overflow: "hidden",
      fontFamily: "'Hind Siliguri', sans-serif",
    }}>
      {/* Breathe glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 60% 45% at 50% 50%, rgba(0,200,83,${bgBreath}) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* LEFT zone */}
      <div style={{
        position: "absolute", top: 0, left: 0,
        width: `${50 * (1 - mergeProgress)}%`, height: "100%",
        backgroundColor: "rgba(80,0,0,0.45)",
        opacity: leftOp * splitIn,
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 24,
      }}>
        <div style={{
          color: C.red, fontSize: 46, fontWeight: 900,
          textShadow: textGlow(frame, C.red, 16, 8),
          filter: `drop-shadow(0 0 18px ${C.red})`,
          transform: `rotate(-3deg) translateY(${driftY(frame, 0)}px)`,
        }}>
          চটকদার বিজ্ঞাপন
        </div>
        <div style={{ fontSize: 90, filter: `drop-shadow(0 0 20px ${C.red})` }}>✗</div>
        <div style={{ color: "#FF9999", fontSize: 26, textAlign: "center", padding: "0 36px", fontWeight: 700 }}>
          মিথ্যা প্রতিশ্রুতি<br />আর্থিক ক্ষতি
        </div>
      </div>

      {/* Divider line */}
      {mergeProgress < 0.85 && (
        <div style={{
          position: "absolute", top: 0,
          left: `${50 * (1 - mergeProgress)}%`,
          width: 4, height: "100%",
          background: `linear-gradient(to bottom, transparent, ${C.cyan}, ${C.green}, transparent)`,
          boxShadow: `0 0 ${divGlow}px ${C.cyan}, 0 0 ${divGlow * 2}px rgba(0,229,255,0.3)`,
          opacity: splitIn * (1 - mergeProgress * 1.2),
          zIndex: 10,
        }} />
      )}

      {/* RIGHT zone */}
      <div style={{
        position: "absolute", top: 0,
        left: mergeProgress > 0 ? `${50 * (1 - mergeProgress)}%` : "50%",
        width: `${rightWidth}%`, height: "100%",
        backgroundColor: "rgba(0,40,60,0.55)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 28,
        overflow: "hidden", opacity: splitIn,
      }}>
        {mergeProgress < 0.85 ? (
          <>
            <div style={{
              color: C.green, fontSize: 46, fontWeight: 900,
              textShadow: textGlow(frame, C.green, 16, 8),
              filter: `drop-shadow(0 0 18px ${C.green})`,
              transform: `rotate(2deg) translateY(${driftY(frame, 30)}px)`,
            }}>
              বিশ্বস্ত ইমপোর্টার
            </div>
            <div style={{ fontSize: 90, filter: `drop-shadow(0 0 20px ${C.green})` }}>✓</div>
            <div style={{ color: "#99FFCC", fontSize: 26, textAlign: "center", padding: "0 36px", fontWeight: 700 }}>
              সৎ ব্যবসা<br />নির্ভরযোগ্য ডেলিভারি
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, padding: "0 80px" }}>
            <div style={{
              transform: `scale(${stScale}) translateY(${driftY(frame, 50)}px)`,
              opacity: stSc, textAlign: "center",
            }}>
              <div style={{
                color: C.white, fontSize: 74, fontWeight: 900, lineHeight: 1.2,
                letterSpacing: letterSpacingSnap(stSc),
                textShadow: textGlow(frame, C.gold, 18, 10),
                filter: `drop-shadow(0 0 20px ${C.gold})`,
              }}>
                বিশ্বস্ততাই আসল সম্পদ
              </div>
              <div style={{
                marginTop: 18, height: 6, width: `${underlineW}%`,
                background: `linear-gradient(90deg, ${C.gold}, #FF8C00, ${C.gold})`,
                borderRadius: 3,
                boxShadow: `0 0 18px ${C.gold}, 0 0 40px rgba(255,215,0,0.4)`,
                marginLeft: "auto", marginRight: "auto",
              }} />
            </div>
            <AiImageCard
              label="Confident Bangladeshi businessman handshake trust, dark blue gold tones"
              startFrame={165} width={620} height={300} slideFrom="bottom"
            />
          </div>
        )}
      </div>

      {/* Burst on merge */}
      <ParticleBurst startFrame={120} x={960} y={540} count={24} colors={[C.cyan, C.green, C.gold, C.white]} radius={350} />
      <ParticleBurst startFrame={150} x={960} y={540} count={16} colors={[C.gold, C.white]} radius={200} />

      {/* Impact flash */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: `rgba(255,255,255,${flash * 0.4})`,
        pointerEvents: "none", zIndex: 99,
      }} />
    </div>
  );
};
