import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C } from "../constants/colors";
import { ProcessCard } from "../components/ProcessCard";
import { AiImageCard } from "../components/AiImageCard";

const STEPS = [
  { icon: "🏦", title: "ব্যাংকে LC ওপেন", frame: 70 },
  { icon: "🔍", title: "প্রোডাক্ট সোর্সিং", frame: 110 },
  { icon: "💳", title: "পারচেজ অর্ডার", frame: 150 },
  { icon: "⏳", title: "প্রসেসিং সময়", frame: 190 },
];

export const Scene2RealityCheck: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Wipe reveal
  const wipe = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Title
  const titleSc = spring({ frame: frame - 25, fps, config: { damping: 10, stiffness: 200, mass: 0.8 }, durationInFrames: 20 });
  const underlineW = interpolate(frame, [40, 65], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

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

      {/* Wipe overlay */}
      <div style={{
        position: "absolute", inset: 0,
        clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)`,
        backgroundColor: C.bgSecondary,
        zIndex: 0,
      }} />

      {/* Content */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        padding: "60px 100px", gap: 40,
        opacity: wipe,
      }}>
        {/* Title */}
        <div style={{ transform: `scale(${titleSc})`, opacity: titleSc, alignSelf: "flex-start" }}>
          <div style={{ color: C.white, fontSize: 56, fontWeight: 800 }}>আসল প্রক্রিয়া জানুন</div>
          <div style={{
            marginTop: 8, height: 4, width: `${underlineW}%`,
            background: `linear-gradient(90deg, ${C.cyan}, #0099BB)`,
            borderRadius: 3, boxShadow: `0 0 10px ${C.cyan}`,
          }} />
        </div>

        {/* Process cards + AI image row */}
        <div style={{ display: "flex", alignItems: "center", gap: 40, flex: 1 }}>
          {/* Process flow */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, flex: 1 }}>
            {STEPS.map((s, i) => (
              <ProcessCard
                key={i}
                icon={s.icon}
                title={s.title}
                startFrame={s.frame}
                showArrow={i < STEPS.length - 1}
              />
            ))}
          </div>
          {/* AI image */}
          <AiImageCard
            label="Import/export office Bangladesh, LC documents, professional warm lighting"
            startFrame={220}
            width={460}
            height={320}
            slideFrom="right"
          />
        </div>
      </div>
    </div>
  );
};
