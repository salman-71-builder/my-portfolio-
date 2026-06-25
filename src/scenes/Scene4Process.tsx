import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C } from "../constants/colors";
import { TimelineNode } from "../components/TimelineNode";
import { AiImageCard } from "../components/AiImageCard";

const NODES = [
  { icon: "📋", title: "ডকুমেন্টেশন", frame: 40 },
  { icon: "🛍️", title: "প্রোডাক্ট অর্ডার", frame: 100 },
  { icon: "🏭", title: "ওয়্যারহাউসে প্রেরণ", frame: 160 },
  { icon: "✅", title: "কোয়ালিটি চেক", frame: 220 },
  { icon: "🚢", title: "শিপমেন্ট", frame: 280 },
  { icon: "🛃", title: "কাস্টমস ক্লিয়ারেন্স", frame: 340 },
  { icon: "🎯", title: "আপনার কাছে ডেলিভারি", frame: 400 },
];

export const Scene4Process: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const wipe = interpolate(frame, [0, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleSc = spring({ frame: frame - 15, fps, config: { damping: 10, stiffness: 200, mass: 0.8 }, durationInFrames: 20 });

  return (
    <div style={{
      width: "100%", height: "100%",
      backgroundColor: C.bgPrimary,
      position: "relative", overflow: "hidden",
      fontFamily: "'Hind Siliguri', sans-serif",
      opacity: wipe,
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
        display: "flex", gap: 60, padding: "50px 80px",
      }}>
        {/* Left: timeline */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
          <div style={{ transform: `scale(${titleSc})`, opacity: titleSc, marginBottom: 32, alignSelf: "flex-start" }}>
            <div style={{ color: C.cyan, fontSize: 52, fontWeight: 800 }}>সঠিক ইমপোর্ট প্রক্রিয়া</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {NODES.map((n, i) => (
              <TimelineNode key={i} icon={n.icon} title={n.title} startFrame={n.frame} isLast={i === NODES.length - 1} />
            ))}
          </div>
        </div>

        {/* Right: AI images */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32, paddingTop: 80, flexShrink: 0 }}>
          <AiImageCard
            label="Modern warehouse quality check, blue uniforms, professional bright"
            startFrame={480}
            width={460}
            height={280}
            slideFrom="right"
          />
          <AiImageCard
            label="Bangladesh customs clearance office, official documents, professional"
            startFrame={560}
            width={460}
            height={260}
            slideFrom="right"
          />
        </div>
      </div>
    </div>
  );
};
