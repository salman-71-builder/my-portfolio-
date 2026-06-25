import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C } from "../constants/colors";
import { AiImageCard } from "../components/AiImageCard";

export const Scene5Trust: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Split → merge at frame 120
  const splitRatio = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mergeProgress = interpolate(frame, [120, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Left fades out when merging
  const leftOp = interpolate(frame, [120, 145], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rightWidth = interpolate(mergeProgress, [0, 1], [50, 100]);

  // Bold statement after merge
  const statementSc = spring({ frame: frame - 150, fps, config: { damping: 9, stiffness: 200, mass: 0.8 }, durationInFrames: 22 });
  const underlineW = interpolate(frame, [165, 195], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Divider gradient animation
  const dividerGlow = Math.sin(frame * 0.12) * 0.4 + 0.6;

  return (
    <div style={{
      width: "100%", height: "100%",
      backgroundColor: C.bgPrimary,
      position: "relative", overflow: "hidden",
      fontFamily: "'Hind Siliguri', sans-serif",
      opacity: splitRatio,
    }}>
      {/* LEFT zone — fake/red */}
      <div style={{
        position: "absolute", top: 0, left: 0,
        width: `${50 * (1 - mergeProgress)}%`, height: "100%",
        backgroundColor: "rgba(80,0,0,0.4)",
        opacity: leftOp,
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 20,
      }}>
        <div style={{ color: C.red, fontSize: 44, fontWeight: 900 }}>চটকদার বিজ্ঞাপন</div>
        <div style={{ fontSize: 80 }}>✗</div>
        <div style={{ color: "#FF9999", fontSize: 24, textAlign: "center", padding: "0 40px" }}>
          মিথ্যা প্রতিশ্রুতি<br />আর্থিক ক্ষতি
        </div>
      </div>

      {/* Animated center divider line */}
      {mergeProgress < 0.8 && (
        <div style={{
          position: "absolute", top: 0, left: `${50 * (1 - mergeProgress)}%`,
          width: 3, height: "100%",
          background: `linear-gradient(to bottom, transparent, ${C.cyan}, ${C.green}, transparent)`,
          opacity: dividerGlow * (1 - mergeProgress),
          boxShadow: `0 0 20px ${C.cyan}`,
          zIndex: 10,
        }} />
      )}

      {/* RIGHT zone — trust/blue */}
      <div style={{
        position: "absolute", top: 0,
        left: mergeProgress > 0 ? `${50 * (1 - mergeProgress)}%` : "50%",
        width: `${rightWidth}%`, height: "100%",
        backgroundColor: "rgba(0,40,60,0.5)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 24,
        overflow: "hidden",
      }}>
        {mergeProgress < 0.8 ? (
          <>
            <div style={{ color: C.green, fontSize: 44, fontWeight: 900 }}>বিশ্বস্ত ইমপোর্টার</div>
            <div style={{ fontSize: 80 }}>✓</div>
            <div style={{ color: "#99FFCC", fontSize: 24, textAlign: "center", padding: "0 40px" }}>
              সৎ ব্যবসা<br />নির্ভরযোগ্য ডেলিভারি
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, padding: "0 100px" }}>
            {/* Bold statement */}
            <div style={{ transform: `scale(${statementSc})`, opacity: statementSc, textAlign: "center" }}>
              <div style={{ color: C.white, fontSize: 72, fontWeight: 900, lineHeight: 1.2 }}>
                বিশ্বস্ততাই আসল সম্পদ
              </div>
              <div style={{
                marginTop: 16, height: 5, width: `${underlineW}%`,
                background: `linear-gradient(90deg, ${C.gold}, #FF8C00)`,
                borderRadius: 3, boxShadow: `0 0 12px ${C.gold}`,
                marginLeft: "auto", marginRight: "auto",
              }} />
            </div>
            {/* AI image */}
            <AiImageCard
              label="Confident Bangladeshi businessman handshake trust, dark blue gold tones"
              startFrame={165}
              width={600}
              height={300}
              slideFrom="bottom"
            />
          </div>
        )}
      </div>
    </div>
  );
};
